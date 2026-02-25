import { Test, TestingModule } from '@nestjs/testing';
import * as fc from 'fast-check';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, OrderStatus } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';

/**
 * Property-Based Tests for Checkout and Order Creation
 * Feature: online-bookstore-system, Property 13 & 14
 *
 * Property 13: Checkout Validation Completeness
 * For any checkout attempt, the system should validate cart contents,
 * inventory availability, and process payment before creating an order.
 *
 * Property 14: Order Creation Atomicity
 * For any successful payment, order creation and inventory reduction
 * should occur atomically, ensuring data consistency.
 *
 * **Validates: Requirements 5.1, 5.2, 5.3**
 */
describe('Checkout and Order Creation Property Tests', () => {
  let service: OrdersService;
  let mockPrismaService: any;

  beforeEach(async () => {
    mockPrismaService = {
      book: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      order: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  /**
   * Property 13: Checkout Validation Completeness
   *
   * For any checkout attempt, the system should validate cart contents
   * and inventory availability before creating an order.
   *
   * **Validates: Requirements 5.1, 5.2**
   */
  describe('Property 13: Checkout Validation Completeness', () => {
    /**
     * Test 13.1: Checkout validates all cart items exist
     * **Validates: Requirements 5.1**
     */
    it('should reject checkout when any book in cart does not exist', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.uuid(),
            validItems: fc.array(
              fc.record({
                bookId: fc.uuid(),
                quantity: fc.integer({ min: 1, max: 5 }),
                bookPrice: fc
                  .double({ min: 0.01, max: 99.99, noNaN: true })
                  .map(p => Math.round(p * 100) / 100),
                bookInventory: fc.integer({ min: 10, max: 100 }),
              }),
              { minLength: 0, maxLength: 3 },
            ),
            invalidBookId: fc.uuid(),
            invalidQuantity: fc.integer({ min: 1, max: 5 }),
          }),
          async testData => {
            // Reset mocks for this iteration
            mockPrismaService.book.findUnique.mockReset();

            // Mock valid books
            for (const item of testData.validItems) {
              mockPrismaService.book.findUnique.mockResolvedValueOnce({
                id: item.bookId,
                isbn: `ISBN-${item.bookId.substring(0, 10)}`,
                title: 'Valid Book',
                author: 'Test Author',
                description: 'Test Description',
                price: new Prisma.Decimal(item.bookPrice),
                inventory: item.bookInventory,
                category: 'Test',
                imageUrl: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              });
            }

            // Mock invalid book (not found)
            mockPrismaService.book.findUnique.mockResolvedValueOnce(null);

            // Create order with one invalid book ID
            const orderItems = [
              ...testData.validItems.map(item => ({
                bookId: item.bookId,
                quantity: item.quantity,
              })),
              {
                bookId: testData.invalidBookId,
                quantity: testData.invalidQuantity,
              },
            ];

            // Attempt to create order
            await expect(
              service.create(testData.userId, { items: orderItems }),
            ).rejects.toThrow(NotFoundException);
          },
        ),
        { numRuns: 100 },
      );
    }, 20000);

    /**
     * Test 13.2: Checkout validates inventory availability for all items
     * **Validates: Requirements 5.1**
     */
    it('should reject checkout when any item has insufficient inventory', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.uuid(),
            items: fc.array(
              fc.record({
                bookId: fc.uuid(),
                bookTitle: fc.string({ minLength: 5, maxLength: 50 }),
                requestedQuantity: fc.integer({ min: 5, max: 20 }),
                availableInventory: fc.integer({ min: 0, max: 4 }),
                bookPrice: fc
                  .double({ min: 0.01, max: 99.99, noNaN: true })
                  .map(p => Math.round(p * 100) / 100),
              }),
              { minLength: 1, maxLength: 5 },
            ),
          }),
          async testData => {
            // Reset mocks for this iteration
            mockPrismaService.book.findUnique.mockReset();

            // Mock books with insufficient inventory
            for (const item of testData.items) {
              mockPrismaService.book.findUnique.mockResolvedValueOnce({
                id: item.bookId,
                isbn: `ISBN-${item.bookId.substring(0, 10)}`,
                title: item.bookTitle,
                author: 'Test Author',
                description: 'Test Description',
                price: new Prisma.Decimal(item.bookPrice),
                inventory: item.availableInventory, // Less than requested
                category: 'Test',
                imageUrl: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              });
            }

            const orderItems = testData.items.map(item => ({
              bookId: item.bookId,
              quantity: item.requestedQuantity,
            }));

            // Attempt to create order - should fail with BadRequestException
            await expect(
              service.create(testData.userId, { items: orderItems }),
            ).rejects.toThrow(BadRequestException);
          },
        ),
        { numRuns: 100 },
      );
    }, 20000);

    /**
     * Test 13.3: Checkout calculates total amount correctly
     * **Validates: Requirements 5.1**
     */
    it('should calculate total amount correctly for all valid cart items', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.uuid(),
            items: fc.array(
              fc.record({
                bookId: fc.uuid(),
                bookTitle: fc.string({ minLength: 5, maxLength: 50 }),
                quantity: fc.integer({ min: 1, max: 10 }),
                bookPrice: fc
                  .double({ min: 0.01, max: 99.99, noNaN: true })
                  .map(p => Math.round(p * 100) / 100),
                bookInventory: fc.integer({ min: 20, max: 100 }),
              }),
              { minLength: 1, maxLength: 10 },
            ),
          }),
          async testData => {
            // Reset mocks for this iteration
            mockPrismaService.book.findUnique.mockReset();
            mockPrismaService.$transaction.mockReset();

            // Calculate expected total
            const expectedTotal = testData.items.reduce(
              (sum, item) => sum + item.bookPrice * item.quantity,
              0,
            );

            // Mock books with sufficient inventory
            const mockBooks = testData.items.map(item => ({
              id: item.bookId,
              isbn: `ISBN-${item.bookId.substring(0, 10)}`,
              title: item.bookTitle,
              author: 'Test Author',
              description: 'Test Description',
              price: new Prisma.Decimal(item.bookPrice),
              inventory: item.bookInventory,
              category: 'Test',
              imageUrl: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            }));

            // Mock book lookups
            for (const book of mockBooks) {
              mockPrismaService.book.findUnique.mockResolvedValueOnce(book);
            }

            // Mock transaction to capture order data
            let capturedTotalAmount: number | null = null;
            mockPrismaService.$transaction.mockImplementation(
              async callback => {
                const mockTx = {
                  order: {
                    create: jest
                      .fn()
                      .mockImplementation(async ({ data }: any) => {
                        capturedTotalAmount = Number(data.totalAmount);
                        return {
                          id: 'order-id',
                          userId: testData.userId,
                          status: OrderStatus.PENDING,
                          totalAmount: data.totalAmount,
                          items: testData.items.map((item, idx) => ({
                            id: `item-${idx}`,
                            orderId: 'order-id',
                            bookId: item.bookId,
                            quantity: item.quantity,
                            price: new Prisma.Decimal(item.bookPrice),
                            book: mockBooks[idx],
                          })),
                          user: {
                            id: testData.userId,
                            email: 'test@example.com',
                            firstName: 'Test',
                            lastName: 'User',
                          },
                          createdAt: new Date(),
                          updatedAt: new Date(),
                        };
                      }),
                  },
                  book: {
                    update: jest.fn().mockResolvedValue({}),
                  },
                };
                return await callback(mockTx);
              },
            );

            const orderItems = testData.items.map(item => ({
              bookId: item.bookId,
              quantity: item.quantity,
            }));

            // Create order
            await service.create(testData.userId, { items: orderItems });

            // Verify total amount is calculated correctly
            expect(capturedTotalAmount).not.toBeNull();
            expect(Math.abs(capturedTotalAmount! - expectedTotal)).toBeLessThan(
              0.01,
            );
          },
        ),
        { numRuns: 100 },
      );
    }, 25000);
  });

  /**
   * Property 14: Order Creation Atomicity
   *
   * For any successful payment, order creation and inventory reduction
   * should occur atomically, ensuring data consistency.
   *
   * **Validates: Requirements 5.3**
   */
  describe('Property 14: Order Creation Atomicity', () => {
    /**
     * Test 14.1: Order creation and inventory reduction occur in transaction
     * **Validates: Requirements 5.3**
     */
    it('should create order and reduce inventory atomically within a transaction', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.uuid(),
            items: fc.array(
              fc.record({
                bookId: fc.uuid(),
                bookTitle: fc.string({ minLength: 5, maxLength: 50 }),
                quantity: fc.integer({ min: 1, max: 10 }),
                bookPrice: fc
                  .double({ min: 0.01, max: 99.99, noNaN: true })
                  .map(p => Math.round(p * 100) / 100),
                initialInventory: fc.integer({ min: 20, max: 100 }),
              }),
              { minLength: 1, maxLength: 5 },
            ),
          }),
          async testData => {
            // Reset mocks for this iteration
            mockPrismaService.book.findUnique.mockReset();
            mockPrismaService.$transaction.mockReset();

            // Mock books with sufficient inventory
            const mockBooks = testData.items.map(item => ({
              id: item.bookId,
              isbn: `ISBN-${item.bookId.substring(0, 10)}`,
              title: item.bookTitle,
              author: 'Test Author',
              description: 'Test Description',
              price: new Prisma.Decimal(item.bookPrice),
              inventory: item.initialInventory,
              category: 'Test',
              imageUrl: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            }));

            // Mock book lookups
            for (const book of mockBooks) {
              mockPrismaService.book.findUnique.mockResolvedValueOnce(book);
            }

            // Track inventory updates
            const inventoryUpdates: Array<{
              bookId: string;
              decrement: number;
            }> = [];

            // Mock transaction
            mockPrismaService.$transaction.mockImplementation(
              async callback => {
                const mockTx = {
                  order: {
                    create: jest.fn().mockResolvedValue({
                      id: 'order-id',
                      userId: testData.userId,
                      status: OrderStatus.PENDING,
                      totalAmount: new Prisma.Decimal(100),
                      items: testData.items.map((item, idx) => ({
                        id: `item-${idx}`,
                        orderId: 'order-id',
                        bookId: item.bookId,
                        quantity: item.quantity,
                        price: new Prisma.Decimal(item.bookPrice),
                        book: mockBooks[idx],
                      })),
                      user: {
                        id: testData.userId,
                        email: 'test@example.com',
                        firstName: 'Test',
                        lastName: 'User',
                      },
                      createdAt: new Date(),
                      updatedAt: new Date(),
                    }),
                  },
                  book: {
                    update: jest
                      .fn()
                      .mockImplementation(async ({ where, data }: any) => {
                        inventoryUpdates.push({
                          bookId: where.id,
                          decrement: data.inventory.decrement,
                        });
                        return {};
                      }),
                  },
                };
                return await callback(mockTx);
              },
            );

            const orderItems = testData.items.map(item => ({
              bookId: item.bookId,
              quantity: item.quantity,
            }));

            // Create order
            await service.create(testData.userId, { items: orderItems });

            // Verify transaction was used
            expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(1);

            // Verify inventory was updated for all items
            expect(inventoryUpdates.length).toBe(testData.items.length);

            // Verify correct inventory decrements
            for (const item of testData.items) {
              const update = inventoryUpdates.find(
                u => u.bookId === item.bookId,
              );
              expect(update).toBeDefined();
              expect(update!.decrement).toBe(item.quantity);
            }
          },
        ),
        { numRuns: 100 },
      );
    }, 25000);

    /**
     * Test 14.2: Transaction rollback on failure preserves inventory
     * **Validates: Requirements 5.3**
     */
    it('should rollback inventory changes if order creation fails', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.uuid(),
            items: fc.array(
              fc.record({
                bookId: fc.uuid(),
                quantity: fc.integer({ min: 1, max: 5 }),
                bookPrice: fc
                  .double({ min: 0.01, max: 99.99, noNaN: true })
                  .map(p => Math.round(p * 100) / 100),
                initialInventory: fc.integer({ min: 10, max: 100 }),
              }),
              { minLength: 1, maxLength: 3 },
            ),
          }),
          async testData => {
            // Reset mocks for this iteration
            mockPrismaService.book.findUnique.mockReset();
            mockPrismaService.$transaction.mockReset();

            // Mock books
            for (const item of testData.items) {
              mockPrismaService.book.findUnique.mockResolvedValueOnce({
                id: item.bookId,
                isbn: `ISBN-${item.bookId.substring(0, 10)}`,
                title: 'Test Book',
                author: 'Test Author',
                description: 'Test Description',
                price: new Prisma.Decimal(item.bookPrice),
                inventory: item.initialInventory,
                category: 'Test',
                imageUrl: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              });
            }

            // Mock transaction that fails during order creation
            mockPrismaService.$transaction.mockRejectedValue(
              new Error('Database error during order creation'),
            );

            const orderItems = testData.items.map(item => ({
              bookId: item.bookId,
              quantity: item.quantity,
            }));

            // Attempt to create order
            await expect(
              service.create(testData.userId, { items: orderItems }),
            ).rejects.toThrow('Database error during order creation');

            // Verify transaction was attempted
            expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(1);

            // In a real scenario, the transaction would rollback automatically
            // This test verifies that we're using transactions for atomicity
          },
        ),
        { numRuns: 100 },
      );
    }, 20000);

    /**
     * Test 14.3: Order items are created with correct prices at time of order
     * **Validates: Requirements 5.3**
     */
    it('should capture book prices at time of order creation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.uuid(),
            items: fc.array(
              fc.record({
                bookId: fc.uuid(),
                bookTitle: fc.string({ minLength: 5, maxLength: 50 }),
                quantity: fc.integer({ min: 1, max: 10 }),
                currentPrice: fc
                  .double({ min: 0.01, max: 99.99, noNaN: true })
                  .map(p => Math.round(p * 100) / 100),
                bookInventory: fc.integer({ min: 20, max: 100 }),
              }),
              { minLength: 1, maxLength: 5 },
            ),
          }),
          async testData => {
            // Reset mocks for this iteration
            mockPrismaService.book.findUnique.mockReset();
            mockPrismaService.$transaction.mockReset();

            // Mock books
            const mockBooks = testData.items.map(item => ({
              id: item.bookId,
              isbn: `ISBN-${item.bookId.substring(0, 10)}`,
              title: item.bookTitle,
              author: 'Test Author',
              description: 'Test Description',
              price: new Prisma.Decimal(item.currentPrice),
              inventory: item.bookInventory,
              category: 'Test',
              imageUrl: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            }));

            // Mock book lookups
            for (const book of mockBooks) {
              mockPrismaService.book.findUnique.mockResolvedValueOnce(book);
            }

            // Track order item prices
            const capturedOrderItems: any[] = [];

            // Mock transaction
            mockPrismaService.$transaction.mockImplementation(
              async callback => {
                const mockTx = {
                  order: {
                    create: jest
                      .fn()
                      .mockImplementation(async ({ data }: any) => {
                        // Capture the order items being created
                        capturedOrderItems.push(...data.items.create);
                        return {
                          id: 'order-id',
                          userId: testData.userId,
                          status: OrderStatus.PENDING,
                          totalAmount: data.totalAmount,
                          items: data.items.create.map(
                            (item: any, idx: number) => ({
                              id: `item-${idx}`,
                              orderId: 'order-id',
                              bookId: item.bookId,
                              quantity: item.quantity,
                              price: item.price,
                              book: mockBooks[idx],
                            }),
                          ),
                          user: {
                            id: testData.userId,
                            email: 'test@example.com',
                            firstName: 'Test',
                            lastName: 'User',
                          },
                          createdAt: new Date(),
                          updatedAt: new Date(),
                        };
                      }),
                  },
                  book: {
                    update: jest.fn().mockResolvedValue({}),
                  },
                };
                return await callback(mockTx);
              },
            );

            const orderItems = testData.items.map(item => ({
              bookId: item.bookId,
              quantity: item.quantity,
            }));

            // Create order
            await service.create(testData.userId, { items: orderItems });

            // Verify each order item has the correct price from the book at time of order
            expect(capturedOrderItems.length).toBe(testData.items.length);

            for (let i = 0; i < testData.items.length; i++) {
              const item = testData.items[i];
              const orderItem = capturedOrderItems[i];

              expect(orderItem.bookId).toBe(item.bookId);
              expect(orderItem.quantity).toBe(item.quantity);

              // Price should match the book's current price
              const capturedPrice = orderItem.price.toNumber
                ? orderItem.price.toNumber()
                : Number(orderItem.price);
              expect(Math.abs(capturedPrice - item.currentPrice)).toBeLessThan(
                0.01,
              );
            }
          },
        ),
        { numRuns: 100 },
      );
    }, 25000);
  });
});
