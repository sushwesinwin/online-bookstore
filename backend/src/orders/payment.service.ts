import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus, Prisma } from '@prisma/client';
import { CartService } from '../cart/cart.service';
import { EmailService } from '../auth/email.service';

type CheckoutSessionItem = {
  bookId: string;
  quantity: number;
  unitAmountInCents: number;
};

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

  private async generateUniqueOrderNumber(
    tx: Prisma.TransactionClient,
  ): Promise<string> {
    const maxAttempts = 5;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

      let randomStr = '';
      for (let i = 0; i < 6; i++) {
        randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const orderNumber = `ORD-${year}${month}${day}-${randomStr}`;
      const existingOrder = await tx.order.findUnique({
        where: { orderNumber },
      });

      if (!existingOrder) {
        return orderNumber;
      }
    }

    throw new BadRequestException('Failed to generate unique order number');
  }

  private async getCheckoutSessionItems(
    sessionId: string,
  ): Promise<CheckoutSessionItem[]> {
    const lineItems = await this.stripe.checkout.sessions.listLineItems(
      sessionId,
      {
        expand: ['data.price.product'],
        limit: 100,
      },
    );

    if (!lineItems.data.length) {
      throw new BadRequestException('Checkout session contains no line items');
    }

    return lineItems.data.map(item => {
      const product =
        item.price?.product &&
        typeof item.price.product !== 'string' &&
        !('deleted' in item.price.product)
          ? item.price.product
          : null;
      const bookId = product?.metadata?.bookId;
      const quantity = item.quantity ?? 0;
      const unitAmountInCents =
        item.price?.unit_amount ??
        (item.amount_subtotal != null && quantity > 0
          ? Math.round(item.amount_subtotal / quantity)
          : null);

      if (!bookId || quantity < 1 || unitAmountInCents == null) {
        throw new BadRequestException(
          'Checkout session is missing purchasable book metadata',
        );
      }

      return {
        bookId,
        quantity,
        unitAmountInCents,
      };
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

      if (payment.status === PaymentStatus.COMPLETED) {
        this.logger.log(`Payment ${paymentIntentId} already completed`);
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
        await this.prisma.cartItem.deleteMany({
          where: {
            userId: payment.order.userId,
            bookId: {
              in: payment.order.items.map(item => item.bookId),
            },
          },
        });
        this.logger.log(
          `Purchased items removed from cart for user ${payment.order.userId} after successful payment`,
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

      if (payment.status === PaymentStatus.FAILED) {
        this.logger.log(`Payment ${paymentIntentId} already marked as failed`);
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
              metadata: {
                bookId: item.bookId,
              },
            },
            unit_amount: Math.round(Number(item.book.price) * 100), // Convert to cents
          },
          quantity: item.quantity,
        }));

      const invalidItems = cart.items.filter(
        item => item.book.inventory < item.quantity,
      );
      if (invalidItems.length > 0) {
        throw new BadRequestException(
          `Some items are no longer available: ${invalidItems
            .map(item => `"${item.book.title}"`)
            .join(', ')}`,
        );
      }

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
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(
        `Failed to create checkout session for user ${userId}`,
        error,
      );
      throw new BadRequestException('Failed to create checkout session');
    }
  }

  /**
   * Verify a Stripe Checkout Session and fulfill the order if not already done.
   * Called by the frontend after Stripe redirects to /checkout/success?session_id=...
   * This is idempotent — safe to call multiple times for the same session.
   */
  async verifyAndFulfillSession(
    sessionId: string,
    userId: string,
  ): Promise<{
    orderId: string;
    orderNumber: string;
    purchasedBookIds: string[];
  }> {
    // Retrieve the session from Stripe
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);

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
      include: {
        order: {
          include: {
            items: true,
          },
        },
      },
    });

    if (existingPayment) {
      this.logger.log(
        `Order already exists for session ${sessionId}: ${existingPayment.order.orderNumber}`,
      );
      return {
        orderId: existingPayment.orderId,
        orderNumber: existingPayment.order.orderNumber,
        purchasedBookIds: existingPayment.order.items.map(item => item.bookId),
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
      include: {
        order: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!payment) {
      throw new BadRequestException(
        'Order creation failed. Please contact support.',
      );
    }

    return {
      orderId: payment.orderId,
      orderNumber: payment.order.orderNumber,
      purchasedBookIds: payment.order.items.map(item => item.bookId),
    };
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

      const sessionItems = await this.getCheckoutSessionItems(session.id);
      const quantityByBookId = new Map<string, number>();
      for (const item of sessionItems) {
        quantityByBookId.set(
          item.bookId,
          (quantityByBookId.get(item.bookId) ?? 0) + item.quantity,
        );
      }

      this.logger.log(
        `Creating order for user ${userId} from session ${session.id}`,
      );

      const order = await this.prisma.$transaction(
        async tx => {
          const paymentInTransaction = await tx.payment.findUnique({
            where: { stripePaymentId },
          });
          if (paymentInTransaction) {
            return null;
          }

          const user = await tx.user.findUnique({
            where: { id: userId },
          });
          if (!user) {
            throw new BadRequestException('User not found');
          }

          const books = await tx.book.findMany({
            where: {
              id: {
                in: Array.from(quantityByBookId.keys()),
              },
            },
          });
          const booksById = new Map(books.map(book => [book.id, book]));

          for (const [bookId, quantity] of quantityByBookId.entries()) {
            const book = booksById.get(bookId);
            if (!book) {
              throw new BadRequestException(`Book ${bookId} no longer exists`);
            }

            const inventoryUpdated = await tx.book.updateMany({
              where: {
                id: bookId,
                inventory: {
                  gte: quantity,
                },
              },
              data: {
                inventory: {
                  decrement: quantity,
                },
              },
            });

            if (inventoryUpdated.count !== 1) {
              throw new BadRequestException(
                `Insufficient inventory for book "${book.title}"`,
              );
            }
          }

          const orderNumber = await this.generateUniqueOrderNumber(tx);
          const totalAmount = (
            sessionItems.reduce(
              (sum, item) => sum + item.unitAmountInCents * item.quantity,
              0,
            ) / 100
          ).toFixed(2);

          const createdOrder = await tx.order.create({
            data: {
              orderNumber,
              user: {
                connect: { id: userId },
              },
              totalAmount,
              status: 'CONFIRMED',
              items: {
                create: sessionItems.map(item => ({
                  bookId: item.bookId,
                  quantity: item.quantity,
                  price: (item.unitAmountInCents / 100).toFixed(2),
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

          await tx.payment.create({
            data: {
              orderId: createdOrder.id,
              stripePaymentId,
              amount: totalAmount,
              status: PaymentStatus.COMPLETED,
            },
          });

          await tx.cartItem.deleteMany({
            where: {
              userId,
              bookId: {
                in: Array.from(quantityByBookId.keys()),
              },
            },
          });

          return createdOrder;
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      );

      if (!order) {
        this.logger.log(
          `Order already fulfilled for session ${session.id} during transaction`,
        );
        return;
      }

      this.logger.log(`Order ${order.orderNumber} created with ID ${order.id}`);

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
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.log(
          `Order already fulfilled for session ${session.id} after duplicate processing attempt`,
        );
        return;
      }

      this.logger.error(
        `Failed to handle checkout session completion for session ${session.id}`,
        error,
      );
      throw error;
    }
  }
}
