import { Test, TestingModule } from '@nestjs/testing';
import * as fc from 'fast-check';
import { CartService } from './cart.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

/**
 * Property-Based Tests for Cart Persistence
 * Feature: online-bookstore-system, Property 12: Cart Persistence Integrity
 *
 * For any authenticated user, cart contents should persist across sessions
 * and be updated when book availability changes.
 *
 * **Validates: Requirements 4.4, 4.5**
 */
describe('Cart Persistence Property Tests', () => {
  let service: CartService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    cartItem: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    book: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 12.1: Cart Persistence Across Sessions
   *
   * For any authenticated user with cart items, retrieving the cart in a new session
   * should return the same items with the same quantities that were stored previously.
   *
   * **Validates: Requirements 4.4**
   */
  describe('Property 12.1: Cart Persistence Across Sessions', () => {
    it('should persist cart contents for authenticated users across sessions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.uuid(),
            cartItems: fc.array(
              fc.record({
                id: fc.uuid(),
                bookId: fc.uuid(),
                quantity: fc.integer({ min: 1, max: 10 }),
                bookTitle: fc.string({ minLength: 5, maxLength: 50 }),
                bookPrice: fc
                  .double({ min: 0.01, max: 999.99, noNaN: true })
                  .map(p => Math.round(p * 100) / 100),
                bookInventory: fc.integer({ min: 10, max: 100 }),
              }),
              { minLength: 1, maxLength: 10 },
            ),
          }),
          async testData => {
            // Simulate first session: Add items to cart
            const addedItems = [];

            for (const item of testData.cartItems) {
              const mockBook = {
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
              };

              const mockCartItem = {
                id: item.id,
                userId: testData.userId,
                bookId: item.bookId,
                quantity: item.quantity,
                book: mockBook,
              };

              addedItems.push(mockCartItem);
            }

            // Simulate second session: Retrieve cart
            mockPrismaService.cartItem.findMany.mockResolvedValue(addedItems);

            const retrievedCart = await service.getCart(testData.userId);

            // Verify all items persisted
            expect(retrievedCart.items.length).toBe(testData.cartItems.length);

            // Verify each item's data persisted correctly
            for (let i = 0; i < testData.cartItems.length; i++) {
              const original = testData.cartItems[i];
              const retrieved = retrievedCart.items[i];

              expect(retrieved.userId).toBe(testData.userId);
              expect(retrieved.bookId).toBe(original.bookId);
              expect(retrieved.quantity).toBe(original.quantity);
              expect(retrieved.book.title).toBe(original.bookTitle);
              expect(retrieved.book.price.toNumber()).toBe(original.bookPrice);
            }

            // Verify total is calculated correctly from persisted data
            const expectedTotal = testData.cartItems.reduce(
              (sum, item) => sum + item.bookPrice * item.quantity,
              0,
            );
            expect(Math.abs(retrievedCart.total - expectedTotal)).toBeLessThan(
              0.01,
            );

            // Verify the cart was retrieved from database (not memory)
            expect(mockPrismaService.cartItem.findMany).toHaveBeenCalledWith({
              where: { userId: testData.userId },
              include: { book: true },
            });
          },
        ),
        { numRuns: 100 },
      );
    }, 20000);

    /**
     * Test: Empty cart persists as empty across sessions
     * **Validates: Requirements 4.4**
     */
    it('should persist empty cart state for authenticated users', async () => {
      await fc.assert(
        fc.asyncProperty(fc.uuid(), async userId => {
          // Simulate empty cart in database
          mockPrismaService.cartItem.findMany.mockResolvedValue([]);

          const cart = await service.getCart(userId);

          // Verify empty cart persists correctly
          expect(cart.items.length).toBe(0);
          expect(cart.total).toBe(0);
          expect(cart.itemCount).toBe(0);

          // Verify database was queried
          expect(mockPrismaService.cartItem.findMany).toHaveBeenCalledWith({
            where: { userId },
            include: { book: true },
          });
        }),
        { numRuns: 100 },
      );
    }, 15000);

    /**
     * Test: Cart persistence maintains item uniqueness per user
     * **Validates: Requirements 4.4**
     */
    it('should maintain cart item uniqueness per user across sessions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            user1Id: fc.uuid(),
            user2Id: fc.uuid(),
            sharedBookId: fc.uuid(),
            user1Quantity: fc.integer({ min: 1, max: 5 }),
            user2Quantity: fc.integer({ min: 6, max: 10 }),
            bookPrice: fc
              .double({ min: 0.01, max: 99.99, noNaN: true })
              .map(p => Math.round(p * 100) / 100),
          }),
          async testData => {
            // Ensure users are different
            fc.pre(testData.user1Id !== testData.user2Id);

            const mockBook = {
              id: testData.sharedBookId,
              isbn: 'ISBN-123456',
              title: 'Shared Book',
              author: 'Test Author',
              description: 'Test Description',
              price: new Prisma.Decimal(testData.bookPrice),
              inventory: 100,
              category: 'Test',
              imageUrl: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            // User 1's cart
            const user1CartItems = [
              {
                id: 'cart-item-user1',
                userId: testData.user1Id,
                bookId: testData.sharedBookId,
                quantity: testData.user1Quantity,
                book: mockBook,
              },
            ];

            // User 2's cart
            const user2CartItems = [
              {
                id: 'cart-item-user2',
                userId: testData.user2Id,
                bookId: testData.sharedBookId,
                quantity: testData.user2Quantity,
                book: mockBook,
              },
            ];

            // Retrieve user 1's cart
            mockPrismaService.cartItem.findMany.mockResolvedValueOnce(
              user1CartItems,
            );
            const user1Cart = await service.getCart(testData.user1Id);

            // Retrieve user 2's cart
            mockPrismaService.cartItem.findMany.mockResolvedValueOnce(
              user2CartItems,
            );
            const user2Cart = await service.getCart(testData.user2Id);

            // Verify each user has their own cart with correct quantities
            expect(user1Cart.items[0].quantity).toBe(testData.user1Quantity);
            expect(user2Cart.items[0].quantity).toBe(testData.user2Quantity);

            // Verify carts are independent
            expect(user1Cart.items[0].userId).toBe(testData.user1Id);
            expect(user2Cart.items[0].userId).toBe(testData.user2Id);

            // Verify totals are calculated independently
            expect(user1Cart.total).toBe(
              testData.bookPrice * testData.user1Quantity,
            );
            expect(user2Cart.total).toBe(
              testData.bookPrice * testData.user2Quantity,
            );
          },
        ),
        { numRuns: 100 },
      );
    }, 15000);
  });

  /**
   * Property 12.2: Cart Updates When Book Availability Changes
   *
   * For any cart with items, when a book's availability changes (inventory reduced),
   * the cart validation should detect and report the availability issues.
   *
   * **Validates: Requirements 4.5**
   */
  describe('Property 12.2: Cart Updates When Book Availability Changes', () => {
    it('should detect and report when cart items exceed available inventory', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.uuid(),
            cartItems: fc.array(
              fc.record({
                id: fc.uuid(),
                bookId: fc.uuid(),
                bookTitle: fc.string({ minLength: 5, maxLength: 50 }),
                cartQuantity: fc.integer({ min: 5, max: 20 }),
                currentInventory: fc.integer({ min: 0, max: 4 }),
                bookPrice: fc
                  .double({ min: 0.01, max: 99.99, noNaN: true })
                  .map(p => Math.round(p * 100) / 100),
              }),
              { minLength: 1, maxLength: 5 },
            ),
          }),
          async testData => {
            // Create cart items where inventory is less than cart quantity
            const mockCartItems = testData.cartItems.map(item => ({
              id: item.id,
              userId: testData.userId,
              bookId: item.bookId,
              quantity: item.cartQuantity,
              book: {
                id: item.bookId,
                isbn: `ISBN-${item.bookId.substring(0, 10)}`,
                title: item.bookTitle,
                author: 'Test Author',
                description: 'Test Description',
                price: new Prisma.Decimal(item.bookPrice),
                inventory: item.currentInventory, // Less than cart quantity
                category: 'Test',
                imageUrl: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            }));

            mockPrismaService.cartItem.findMany.mockResolvedValue(
              mockCartItems,
            );

            const validation = await service.validateCartItems(testData.userId);

            // Verify validation detects insufficient inventory
            expect(validation.valid).toBe(false);
            expect(validation.issues.length).toBe(testData.cartItems.length);

            // Verify each issue is reported correctly
            for (let i = 0; i < testData.cartItems.length; i++) {
              const item = testData.cartItems[i];
              const issue = validation.issues[i];

              expect(issue).toContain(item.bookTitle);
              expect(issue).toContain(`Available: ${item.currentInventory}`);
              expect(issue).toContain(`In cart: ${item.cartQuantity}`);
            }
          },
        ),
        { numRuns: 100 },
      );
    }, 15000);

    /**
     * Test: Cart validation passes when inventory is sufficient
     * **Validates: Requirements 4.5**
     */
    it('should validate successfully when all cart items have sufficient inventory', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.uuid(),
            cartItems: fc.array(
              fc.record({
                id: fc.uuid(),
                bookId: fc.uuid(),
                bookTitle: fc.string({ minLength: 5, maxLength: 50 }),
                quantity: fc.integer({ min: 1, max: 10 }),
                bookPrice: fc
                  .double({ min: 0.01, max: 99.99, noNaN: true })
                  .map(p => Math.round(p * 100) / 100),
              }),
              { minLength: 1, maxLength: 5 },
            ),
          }),
          async testData => {
            // Create cart items where inventory is sufficient
            const mockCartItems = testData.cartItems.map(item => ({
              id: item.id,
              userId: testData.userId,
              bookId: item.bookId,
              quantity: item.quantity,
              book: {
                id: item.bookId,
                isbn: `ISBN-${item.bookId.substring(0, 10)}`,
                title: item.bookTitle,
                author: 'Test Author',
                description: 'Test Description',
                price: new Prisma.Decimal(item.bookPrice),
                inventory: item.quantity + 10, // More than cart quantity
                category: 'Test',
                imageUrl: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            }));

            mockPrismaService.cartItem.findMany.mockResolvedValue(
              mockCartItems,
            );

            const validation = await service.validateCartItems(testData.userId);

            // Verify validation passes
            expect(validation.valid).toBe(true);
            expect(validation.issues.length).toBe(0);
          },
        ),
        { numRuns: 100 },
      );
    }, 15000);

    /**
     * Test: Cart validation detects mixed availability scenarios
     * **Validates: Requirements 4.5**
     */
    it('should correctly identify which items have availability issues in mixed scenarios', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.uuid(),
            availableItems: fc.array(
              fc.record({
                id: fc.uuid(),
                bookId: fc.uuid(),
                bookTitle: fc.string({ minLength: 5, maxLength: 50 }),
                quantity: fc.integer({ min: 1, max: 5 }),
                bookPrice: fc
                  .double({ min: 0.01, max: 99.99, noNaN: true })
                  .map(p => Math.round(p * 100) / 100),
              }),
              { minLength: 1, maxLength: 3 },
            ),
            unavailableItems: fc.array(
              fc.record({
                id: fc.uuid(),
                bookId: fc.uuid(),
                bookTitle: fc.string({ minLength: 5, maxLength: 50 }),
                cartQuantity: fc.integer({ min: 5, max: 10 }),
                currentInventory: fc.integer({ min: 0, max: 4 }),
                bookPrice: fc
                  .double({ min: 0.01, max: 99.99, noNaN: true })
                  .map(p => Math.round(p * 100) / 100),
              }),
              { minLength: 1, maxLength: 3 },
            ),
          }),
          async testData => {
            // Create cart items with mixed availability
            const availableCartItems = testData.availableItems.map(item => ({
              id: item.id,
              userId: testData.userId,
              bookId: item.bookId,
              quantity: item.quantity,
              book: {
                id: item.bookId,
                isbn: `ISBN-${item.bookId.substring(0, 10)}`,
                title: item.bookTitle,
                author: 'Test Author',
                description: 'Test Description',
                price: new Prisma.Decimal(item.bookPrice),
                inventory: item.quantity + 10, // Sufficient
                category: 'Test',
                imageUrl: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            }));

            const unavailableCartItems = testData.unavailableItems.map(
              item => ({
                id: item.id,
                userId: testData.userId,
                bookId: item.bookId,
                quantity: item.cartQuantity,
                book: {
                  id: item.bookId,
                  isbn: `ISBN-${item.bookId.substring(0, 10)}`,
                  title: item.bookTitle,
                  author: 'Test Author',
                  description: 'Test Description',
                  price: new Prisma.Decimal(item.bookPrice),
                  inventory: item.currentInventory, // Insufficient
                  category: 'Test',
                  imageUrl: null,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              }),
            );

            const allCartItems = [
              ...availableCartItems,
              ...unavailableCartItems,
            ];
            mockPrismaService.cartItem.findMany.mockResolvedValue(allCartItems);

            const validation = await service.validateCartItems(testData.userId);

            // Verify validation fails due to unavailable items
            expect(validation.valid).toBe(false);
            expect(validation.issues.length).toBe(
              testData.unavailableItems.length,
            );

            // Verify only unavailable items are reported
            for (const unavailableItem of testData.unavailableItems) {
              const hasIssue = validation.issues.some(issue =>
                issue.includes(unavailableItem.bookTitle),
              );
              expect(hasIssue).toBe(true);
            }

            // Verify available items are not reported
            for (const availableItem of testData.availableItems) {
              const hasIssue = validation.issues.some(issue =>
                issue.includes(availableItem.bookTitle),
              );
              expect(hasIssue).toBe(false);
            }
          },
        ),
        { numRuns: 100 },
      );
    }, 20000);

    /**
     * Test: Cart validation handles zero inventory correctly
     * **Validates: Requirements 4.5**
     */
    it('should detect when books in cart have zero inventory', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.uuid(),
            cartItems: fc.array(
              fc.record({
                id: fc.uuid(),
                bookId: fc.uuid(),
                bookTitle: fc.string({ minLength: 5, maxLength: 50 }),
                quantity: fc.integer({ min: 1, max: 10 }),
                bookPrice: fc
                  .double({ min: 0.01, max: 99.99, noNaN: true })
                  .map(p => Math.round(p * 100) / 100),
              }),
              { minLength: 1, maxLength: 5 },
            ),
          }),
          async testData => {
            // Create cart items where all books have zero inventory
            const mockCartItems = testData.cartItems.map(item => ({
              id: item.id,
              userId: testData.userId,
              bookId: item.bookId,
              quantity: item.quantity,
              book: {
                id: item.bookId,
                isbn: `ISBN-${item.bookId.substring(0, 10)}`,
                title: item.bookTitle,
                author: 'Test Author',
                description: 'Test Description',
                price: new Prisma.Decimal(item.bookPrice),
                inventory: 0, // Out of stock
                category: 'Test',
                imageUrl: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            }));

            mockPrismaService.cartItem.findMany.mockResolvedValue(
              mockCartItems,
            );

            const validation = await service.validateCartItems(testData.userId);

            // Verify validation fails
            expect(validation.valid).toBe(false);
            expect(validation.issues.length).toBe(testData.cartItems.length);

            // Verify all items are reported as out of stock
            for (const item of testData.cartItems) {
              const hasIssue = validation.issues.some(
                issue =>
                  issue.includes(item.bookTitle) &&
                  issue.includes('Available: 0'),
              );
              expect(hasIssue).toBe(true);
            }
          },
        ),
        { numRuns: 100 },
      );
    }, 15000);
  });

  /**
   * Property 12.3: Cart Persistence Integrity Under Concurrent Access
   *
   * For any user accessing their cart from multiple sessions simultaneously,
   * the cart state should remain consistent and reflect the most recent operations.
   *
   * **Validates: Requirements 4.4**
   */
  describe('Property 12.3: Cart Persistence Integrity Under Concurrent Access', () => {
    it('should maintain cart consistency when accessed from multiple sessions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.uuid(),
            initialCartItems: fc.array(
              fc.record({
                id: fc.uuid(),
                bookId: fc.uuid(),
                quantity: fc.integer({ min: 1, max: 5 }),
                bookPrice: fc
                  .double({ min: 0.01, max: 99.99, noNaN: true })
                  .map(p => Math.round(p * 100) / 100),
              }),
              { minLength: 1, maxLength: 3 },
            ),
          }),
          async testData => {
            // Clear mocks for this iteration
            jest.clearAllMocks();

            // Create initial cart state
            const mockCartItems = testData.initialCartItems.map(item => ({
              id: item.id,
              userId: testData.userId,
              bookId: item.bookId,
              quantity: item.quantity,
              book: {
                id: item.bookId,
                isbn: `ISBN-${item.bookId.substring(0, 10)}`,
                title: 'Test Book',
                author: 'Test Author',
                description: 'Test Description',
                price: new Prisma.Decimal(item.bookPrice),
                inventory: 100,
                category: 'Test',
                imageUrl: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            }));

            // Simulate multiple sessions retrieving the same cart
            mockPrismaService.cartItem.findMany.mockResolvedValue(
              mockCartItems,
            );

            const session1Cart = await service.getCart(testData.userId);
            const session2Cart = await service.getCart(testData.userId);
            const session3Cart = await service.getCart(testData.userId);

            // Verify all sessions see the same cart state
            expect(session1Cart.items.length).toBe(
              testData.initialCartItems.length,
            );
            expect(session2Cart.items.length).toBe(
              testData.initialCartItems.length,
            );
            expect(session3Cart.items.length).toBe(
              testData.initialCartItems.length,
            );

            // Verify totals are consistent across sessions
            expect(session1Cart.total).toBe(session2Cart.total);
            expect(session2Cart.total).toBe(session3Cart.total);

            // Verify item counts are consistent
            expect(session1Cart.itemCount).toBe(session2Cart.itemCount);
            expect(session2Cart.itemCount).toBe(session3Cart.itemCount);

            // Verify database was queried for each session (not cached)
            expect(mockPrismaService.cartItem.findMany).toHaveBeenCalledTimes(
              3,
            );
          },
        ),
        { numRuns: 100 },
      );
    }, 15000);
  });
});
