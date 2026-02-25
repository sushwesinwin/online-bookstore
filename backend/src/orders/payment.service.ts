import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';
import { CartService } from '../cart/cart.service';
import { EmailService } from '../auth/email.service';

@Injectable()
export class PaymentService {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private cartService: CartService,
    private emailService: EmailService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
  }

  /**
   * Create a payment intent for an order
   */
  async createPaymentIntent(
    orderId: string,
    amount: number,
    currency: string = 'usd',
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: {
          orderId,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Create payment record in database
      await this.prisma.payment.create({
        data: {
          orderId,
          stripePaymentId: paymentIntent.id,
          amount,
          status: PaymentStatus.PENDING,
        },
      });

      this.logger.log(
        `Payment intent created: ${paymentIntent.id} for order ${orderId}`,
      );

      return paymentIntent;
    } catch (error) {
      this.logger.error(
        `Failed to create payment intent for order ${orderId}`,
        error,
      );
      throw new BadRequestException('Failed to create payment intent');
    }
  }

  /**
   * Confirm a payment intent
   */
  async confirmPayment(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent =
        await this.stripe.paymentIntents.confirm(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      this.logger.error(
        `Failed to confirm payment intent ${paymentIntentId}`,
        error,
      );
      throw new BadRequestException('Failed to confirm payment');
    }
  }

  /**
   * Retrieve a payment intent
   */
  async getPaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      this.logger.error(
        `Failed to retrieve payment intent ${paymentIntentId}`,
        error,
      );
      throw new BadRequestException('Failed to retrieve payment');
    }
  }

  /**
   * Handle successful payment
   */
  async handlePaymentSuccess(paymentIntentId: string): Promise<void> {
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { stripePaymentId: paymentIntentId },
        include: {
          order: {
            include: {
              items: {
                include: {
                  book: true,
                },
              },
              user: true,
            },
          },
        },
      });

      if (!payment) {
        this.logger.error(`Payment not found for intent ${paymentIntentId}`);
        return;
      }

      // Update payment status
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.COMPLETED },
      });

      // Update order status to CONFIRMED
      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'CONFIRMED' },
      });

      // Clear the user's cart after successful payment
      try {
        await this.cartService.clearCart(payment.order.userId);
        this.logger.log(
          `Cart cleared for user ${payment.order.userId} after successful payment`,
        );
      } catch (error) {
        // Log error but don't fail the payment success handling
        this.logger.error(
          `Failed to clear cart for user ${payment.order.userId}`,
          error,
        );
      }

      // Send order confirmation email
      try {
        await this.emailService.sendOrderConfirmationEmail(
          payment.order.user.email,
          payment.order.orderNumber,
          payment.order,
        );
        this.logger.log(
          `Order confirmation email sent to ${payment.order.user.email} for order ${payment.order.orderNumber}`,
        );
      } catch (error) {
        // Log error but don't fail the payment success handling
        this.logger.error(
          `Failed to send order confirmation email for order ${payment.order.orderNumber}`,
          error,
        );
      }

      this.logger.log(
        `Payment ${paymentIntentId} completed for order ${payment.orderId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle payment success for ${paymentIntentId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Handle failed payment
   */
  async handlePaymentFailure(paymentIntentId: string): Promise<void> {
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { stripePaymentId: paymentIntentId },
        include: { order: true },
      });

      if (!payment) {
        this.logger.error(`Payment not found for intent ${paymentIntentId}`);
        return;
      }

      // Update payment status
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });

      // Keep order in PENDING status - cart is preserved
      this.logger.log(
        `Payment ${paymentIntentId} failed for order ${payment.orderId}. Cart preserved.`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle payment failure for ${paymentIntentId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Construct webhook event from raw body and signature
   */
  constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    try {
      return this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (error) {
      this.logger.error('Failed to construct webhook event', error);
      throw new BadRequestException('Invalid webhook signature');
    }
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    this.logger.log(`Received webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.handleCheckoutSessionCompleted(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const successIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentSuccess(successIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const failedIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentFailure(failedIntent.id);
        break;
      }

      case 'payment_intent.canceled': {
        const canceledIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentFailure(canceledIntent.id);
        break;
      }

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }
  }

  /**
   * Cancel a payment intent
   */
  async cancelPaymentIntent(paymentIntentId: string): Promise<void> {
    try {
      await this.stripe.paymentIntents.cancel(paymentIntentId);
      await this.handlePaymentFailure(paymentIntentId);
      this.logger.log(`Payment intent ${paymentIntentId} canceled`);
    } catch (error) {
      this.logger.error(
        `Failed to cancel payment intent ${paymentIntentId}`,
        error,
      );
      throw new BadRequestException('Failed to cancel payment');
    }
  }

  /**
   * Get payment by order ID
   */
  async getPaymentByOrderId(orderId: string) {
    return await this.prisma.payment.findUnique({
      where: { orderId },
    });
  }

  /**
   * Create a Stripe Checkout Session from user's cart
   */
  async createCheckoutSessionFromCart(
    userId: string,
  ): Promise<Stripe.Checkout.Session> {
    try {
      // Get user's cart
      const cart = await this.cartService.getCart(userId);

      if (!cart.items || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      // Get user info
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Create line items for Stripe
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
        cart.items.map(item => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.book.title,
              description: `by ${item.book.author}`,
              images: item.book.imageUrl ? [item.book.imageUrl] : [],
            },
            unit_amount: Math.round(Number(item.book.price) * 100), // Convert to cents
          },
          quantity: item.quantity,
        }));

      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        'http://localhost:3000';

      // Create checkout session
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        customer_email: user.email,
        success_url: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/cart`,
        metadata: {
          userId: userId,
        },
      });

      this.logger.log(
        `Checkout session created: ${session.id} for user ${userId}`,
      );

      return session;
    } catch (error) {
      this.logger.error(
        `Failed to create checkout session for user ${userId}`,
        error,
      );
      throw new BadRequestException('Failed to create checkout session');
    }
  }

  /**
   * Generate a unique order number
   * Format: ORD-YYYYMMDD-XXXXXX (e.g., ORD-20240115-A1B2C3)
   */
  private generateOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Generate a random 6-character alphanumeric string
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomStr = '';
    for (let i = 0; i < 6; i++) {
      randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return `ORD-${year}${month}${day}-${randomStr}`;
  }

  /**
   * Verify a Stripe Checkout Session and fulfill the order if not already done.
   * Called by the frontend after Stripe redirects to /checkout/success?session_id=...
   * This is idempotent — safe to call multiple times for the same session.
   */
  async verifyAndFulfillSession(
    sessionId: string,
    userId: string,
  ): Promise<{ orderId: string; orderNumber: string }> {
    // Retrieve the session from Stripe
    const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });

    if (session.payment_status !== 'paid') {
      throw new BadRequestException('Payment has not been completed');
    }

    // Check if session belongs to this user
    if (session.metadata?.userId !== userId) {
      throw new BadRequestException('Session does not belong to this user');
    }

    // Check if order already exists for this session (idempotent)
    const stripePaymentId = (session.payment_intent as string) || session.id;
    const existingPayment = await this.prisma.payment.findUnique({
      where: { stripePaymentId },
      include: { order: true },
    });

    if (existingPayment) {
      this.logger.log(
        `Order already exists for session ${sessionId}: ${existingPayment.order.orderNumber}`,
      );
      return {
        orderId: existingPayment.orderId,
        orderNumber: existingPayment.order.orderNumber,
      };
    }

    // Order doesn't exist yet — fulfill it now
    this.logger.log(
      `Fulfilling order for session ${sessionId} (webhook may not have arrived yet)`,
    );
    await this.handleCheckoutSessionCompleted(session);

    // Fetch the newly created payment/order
    const payment = await this.prisma.payment.findUnique({
      where: { stripePaymentId },
      include: { order: true },
    });

    if (!payment) {
      throw new BadRequestException(
        'Order creation failed. Please contact support.',
      );
    }

    return { orderId: payment.orderId, orderNumber: payment.order.orderNumber };
  }

  /**
   * Handle successful checkout session
   */
  async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    try {
      const userId = session.metadata?.userId;

      if (!userId) {
        this.logger.error('No userId in checkout session metadata');
        return;
      }

      // Idempotency guard: check if order already created for this session
      const stripePaymentId = (session.payment_intent as string) || session.id;
      const existingPayment = await this.prisma.payment.findUnique({
        where: { stripePaymentId },
      });
      if (existingPayment) {
        this.logger.log(
          `Order already fulfilled for session ${session.id} — skipping duplicate`,
        );
        return;
      }

      // Get cart items to create order
      const cart = await this.cartService.getCart(userId);

      if (!cart.items || cart.items.length === 0) {
        this.logger.error(
          `Cart is empty for user ${userId} during checkout completion`,
        );
        return;
      }

      // Generate unique order number
      let orderNumber: string;
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts) {
        orderNumber = this.generateOrderNumber();
        const existingOrder = await this.prisma.order.findUnique({
          where: { orderNumber },
        });

        if (!existingOrder) {
          break;
        }
        attempts++;
      }

      if (attempts === maxAttempts) {
        throw new Error('Failed to generate unique order number');
      }

      this.logger.log(
        `Creating order for user ${userId} from session ${session.id}`,
      );

      // Create order
      const order = await this.prisma.order.create({
        data: {
          orderNumber,
          user: {
            connect: { id: userId },
          },
          totalAmount: cart.total,
          status: 'CONFIRMED',
          items: {
            create: cart.items.map(item => ({
              bookId: item.bookId,
              quantity: item.quantity,
              price: Number(item.book.price),
            })),
          },
        },
        include: {
          items: {
            include: {
              book: true,
            },
          },
          user: true,
        },
      });

      this.logger.log(`Order ${order.orderNumber} created with ID ${order.id}`);

      // Create payment record
      await this.prisma.payment.create({
        data: {
          orderId: order.id,
          stripePaymentId: (session.payment_intent as string) || session.id,
          amount: cart.total,
          status: PaymentStatus.COMPLETED,
        },
      });

      this.logger.log(`Payment record created for order ${order.orderNumber}`);

      // Reduce inventory for each book
      for (const item of cart.items) {
        await this.prisma.book.update({
          where: { id: item.bookId },
          data: {
            inventory: {
              decrement: item.quantity,
            },
          },
        });
      }

      this.logger.log(`Inventory reduced for order ${order.orderNumber}`);

      // Clear cart
      await this.cartService.clearCart(userId);
      this.logger.log(`Cart cleared for user ${userId}`);

      // Send confirmation email
      try {
        await this.emailService.sendOrderConfirmationEmail(
          order.user.email,
          order.orderNumber,
          order,
        );
        this.logger.log(
          `Order confirmation email sent for order ${order.orderNumber}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to send confirmation email for order ${order.orderNumber}`,
          error,
        );
      }

      this.logger.log(
        `Order ${order.id} fully processed from checkout session ${session.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle checkout session completion for session ${session.id}`,
        error,
      );
      throw error;
    }
  }
}
