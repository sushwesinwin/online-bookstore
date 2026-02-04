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
    async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
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
    constructWebhookEvent(
        rawBody: Buffer,
        signature: string,
    ): Stripe.Event {
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
            case 'payment_intent.succeeded':
                const successIntent = event.data.object as Stripe.PaymentIntent;
                await this.handlePaymentSuccess(successIntent.id);
                break;

            case 'payment_intent.payment_failed':
                const failedIntent = event.data.object as Stripe.PaymentIntent;
                await this.handlePaymentFailure(failedIntent.id);
                break;

            case 'payment_intent.canceled':
                const canceledIntent = event.data.object as Stripe.PaymentIntent;
                await this.handlePaymentFailure(canceledIntent.id);
                break;

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
}
