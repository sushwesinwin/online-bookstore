import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';
import Stripe from 'stripe';

describe('PaymentService', () => {
    let service: PaymentService;
    let prismaService: PrismaService;
    let configService: ConfigService;

    const mockPrismaService = {
        payment: {
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        order: {
            update: jest.fn(),
        },
    };

    const mockConfigService = {
        get: jest.fn((key: string) => {
            if (key === 'STRIPE_SECRET_KEY') return 'sk_test_mock_key';
            if (key === 'STRIPE_WEBHOOK_SECRET') return 'whsec_mock_secret';
            return null;
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        service = module.get<PaymentService>(PaymentService);
        prismaService = module.get<PrismaService>(PrismaService);
        configService = module.get<ConfigService>(ConfigService);

        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createPaymentIntent', () => {
        it('should create a payment intent and store payment record', async () => {
            const orderId = 'order-123';
            const amount = 99.99;
            const mockPaymentIntent = {
                id: 'pi_123',
                client_secret: 'secret_123',
                amount: 9999,
                currency: 'usd',
                lastResponse: {
                    headers: {},
                    requestId: 'req_123',
                    statusCode: 200,
                },
            } as Stripe.Response<Stripe.PaymentIntent>;

            // Mock Stripe API call
            jest.spyOn(service['stripe'].paymentIntents, 'create').mockResolvedValue(mockPaymentIntent);

            mockPrismaService.payment.create.mockResolvedValue({
                id: 'payment-123',
                orderId,
                stripePaymentId: mockPaymentIntent.id,
                amount,
                status: PaymentStatus.PENDING,
                createdAt: new Date(),
            });

            const result = await service.createPaymentIntent(orderId, amount);

            expect(result).toEqual(mockPaymentIntent);
            expect(service['stripe'].paymentIntents.create).toHaveBeenCalledWith({
                amount: 9999, // amount in cents
                currency: 'usd',
                metadata: { orderId },
                automatic_payment_methods: { enabled: true },
            });
            expect(mockPrismaService.payment.create).toHaveBeenCalledWith({
                data: {
                    orderId,
                    stripePaymentId: mockPaymentIntent.id,
                    amount,
                    status: PaymentStatus.PENDING,
                },
            });
        });

        it('should handle payment intent creation failure', async () => {
            const orderId = 'order-123';
            const amount = 99.99;

            jest.spyOn(service['stripe'].paymentIntents, 'create').mockRejectedValue(
                new Error('Stripe API error'),
            );

            await expect(service.createPaymentIntent(orderId, amount)).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    describe('handlePaymentSuccess', () => {
        it('should update payment and order status on successful payment', async () => {
            const paymentIntentId = 'pi_123';
            const mockPayment = {
                id: 'payment-123',
                orderId: 'order-123',
                stripePaymentId: paymentIntentId,
                amount: 99.99,
                status: PaymentStatus.PENDING,
                order: {
                    id: 'order-123',
                    status: 'PENDING',
                },
            };

            mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);
            mockPrismaService.payment.update.mockResolvedValue({
                ...mockPayment,
                status: PaymentStatus.COMPLETED,
            });
            mockPrismaService.order.update.mockResolvedValue({
                ...mockPayment.order,
                status: 'CONFIRMED',
            });

            await service.handlePaymentSuccess(paymentIntentId);

            expect(mockPrismaService.payment.findUnique).toHaveBeenCalledWith({
                where: { stripePaymentId: paymentIntentId },
                include: { order: true },
            });
            expect(mockPrismaService.payment.update).toHaveBeenCalledWith({
                where: { id: mockPayment.id },
                data: { status: PaymentStatus.COMPLETED },
            });
            expect(mockPrismaService.order.update).toHaveBeenCalledWith({
                where: { id: mockPayment.orderId },
                data: { status: 'CONFIRMED' },
            });
        });

        it('should handle payment not found', async () => {
            const paymentIntentId = 'pi_nonexistent';
            mockPrismaService.payment.findUnique.mockResolvedValue(null);

            // Should not throw, just log error
            await service.handlePaymentSuccess(paymentIntentId);

            expect(mockPrismaService.payment.findUnique).toHaveBeenCalled();
            expect(mockPrismaService.payment.update).not.toHaveBeenCalled();
            expect(mockPrismaService.order.update).not.toHaveBeenCalled();
        });
    });

    describe('handlePaymentFailure', () => {
        it('should update payment status to FAILED and preserve cart', async () => {
            const paymentIntentId = 'pi_123';
            const mockPayment = {
                id: 'payment-123',
                orderId: 'order-123',
                stripePaymentId: paymentIntentId,
                amount: 99.99,
                status: PaymentStatus.PENDING,
                order: {
                    id: 'order-123',
                    status: 'PENDING',
                },
            };

            mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);
            mockPrismaService.payment.update.mockResolvedValue({
                ...mockPayment,
                status: PaymentStatus.FAILED,
            });

            await service.handlePaymentFailure(paymentIntentId);

            expect(mockPrismaService.payment.update).toHaveBeenCalledWith({
                where: { id: mockPayment.id },
                data: { status: PaymentStatus.FAILED },
            });
            // Order status should remain PENDING (cart preserved)
            expect(mockPrismaService.order.update).not.toHaveBeenCalled();
        });
    });

    describe('getPaymentByOrderId', () => {
        it('should retrieve payment by order ID', async () => {
            const orderId = 'order-123';
            const mockPayment = {
                id: 'payment-123',
                orderId,
                stripePaymentId: 'pi_123',
                amount: 99.99,
                status: PaymentStatus.COMPLETED,
                createdAt: new Date(),
            };

            mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);

            const result = await service.getPaymentByOrderId(orderId);

            expect(result).toEqual(mockPayment);
            expect(mockPrismaService.payment.findUnique).toHaveBeenCalledWith({
                where: { orderId },
            });
        });
    });

    describe('handleWebhookEvent', () => {
        it('should handle payment_intent.succeeded event', async () => {
            const mockEvent = {
                type: 'payment_intent.succeeded',
                data: {
                    object: {
                        id: 'pi_123',
                    } as Stripe.PaymentIntent,
                },
            } as Stripe.Event;

            const mockPayment = {
                id: 'payment-123',
                orderId: 'order-123',
                stripePaymentId: 'pi_123',
                status: PaymentStatus.PENDING,
                order: { id: 'order-123' },
            };

            mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);
            mockPrismaService.payment.update.mockResolvedValue({
                ...mockPayment,
                status: PaymentStatus.COMPLETED,
            });
            mockPrismaService.order.update.mockResolvedValue({});

            await service.handleWebhookEvent(mockEvent);

            expect(mockPrismaService.payment.update).toHaveBeenCalled();
            expect(mockPrismaService.order.update).toHaveBeenCalled();
        });

        it('should handle payment_intent.payment_failed event', async () => {
            const mockEvent = {
                type: 'payment_intent.payment_failed',
                data: {
                    object: {
                        id: 'pi_123',
                    } as Stripe.PaymentIntent,
                },
            } as Stripe.Event;

            const mockPayment = {
                id: 'payment-123',
                orderId: 'order-123',
                stripePaymentId: 'pi_123',
                status: PaymentStatus.PENDING,
                order: { id: 'order-123' },
            };

            mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);
            mockPrismaService.payment.update.mockResolvedValue({
                ...mockPayment,
                status: PaymentStatus.FAILED,
            });

            await service.handleWebhookEvent(mockEvent);

            expect(mockPrismaService.payment.update).toHaveBeenCalledWith({
                where: { id: mockPayment.id },
                data: { status: PaymentStatus.FAILED },
            });
        });
    });
});
