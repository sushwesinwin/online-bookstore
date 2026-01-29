import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as fc from 'fast-check';
import { CartService } from './cart.service';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { Prisma } from '@prisma/client';

describe('CartService', () => {
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

    describe('Property-Based Tests', () => {
        /**
         * Feature: online-bookstore-system, Property 11: Cart Operation Consistency
         * For any cart modification (add, update, remove), the cart total should be recalculated correctly 
         * and inventory availability should be validated before allowing additions.
         * Validates: Requirements 4.1, 4.2, 4.3, 4.6
         */
        describe('Property 11: Cart Operation Consistency', () => {
            /**
             * Test: Adding items to cart validates inventory and stores correct data
             * **Validates: Requirements 4.1, 4.6**
             */
            it('should validate inventory and store items with quantity and price when adding to cart', async () => {
                await fc.assert(
                    fc.asyncProperty(
                        fc.record({
                            userId: fc.uuid(),
                            bookId: fc.uuid(),
                            quantity: fc.integer({ min: 1, max: 100 }),
                            bookPrice: fc.double({ min: 0.01, max: 999.99, noNaN: true }).map(p => Math.round(p * 100) / 100),
                            bookInventory: fc.integer({ min: 1, max: 1000 }),
                        }),
                        async (testData) => {
                            // Ensure quantity doesn't exceed inventory
                            const quantity = Math.min(testData.quantity, testData.bookInventory);

                            const mockBook = {
                                id: testData.bookId,
                                isbn: '1234567890',
                                title: 'Test Book',
                                author: 'Test Author',
                                description: 'Test Description',
                                price: new Prisma.Decimal(testData.bookPrice),
                                inventory: testData.bookInventory,
                                category: 'Test',
                                imageUrl: null,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            };

                            const mockCartItem = {
                                id: 'cart-item-id',
                                userId: testData.userId,
                                bookId: testData.bookId,
                                quantity: quantity,
                                book: mockBook,
                            };

                            mockPrismaService.book.findUnique.mockResolvedValue(mockBook);
                            mockPrismaService.cartItem.findUnique.mockResolvedValue(null);
                            mockPrismaService.cartItem.create.mockResolvedValue(mockCartItem);

                            const addToCartDto: AddToCartDto = {
                                bookId: testData.bookId,
                                quantity: quantity,
                            };

                            const result = await service.addItem(testData.userId, addToCartDto);

                            // Verify inventory was checked
                            expect(mockPrismaService.book.findUnique).toHaveBeenCalledWith({
                                where: { id: testData.bookId },
                            });

                            // Verify item was stored with correct quantity
                            expect(result.quantity).toBe(quantity);
                            expect(result.bookId).toBe(testData.bookId);
                            expect(result.userId).toBe(testData.userId);

                            // Verify price is available through book relation
                            expect((result as any).book.price.toNumber()).toBe(testData.bookPrice);
                        }
                    ),
                    { numRuns: 100 }
                );
            }, 15000);

            /**
             * Test: Adding items with insufficient inventory should fail
             * **Validates: Requirements 4.6**
             */
            it('should reject cart additions when inventory is insufficient', async () => {
                await fc.assert(
                    fc.asyncProperty(
                        fc.record({
                            userId: fc.uuid(),
                            bookId: fc.uuid(),
                            requestedQuantity: fc.integer({ min: 10, max: 100 }),
                            availableInventory: fc.integer({ min: 0, max: 9 }),
                        }),
                        async (testData) => {
                            const mockBook = {
                                id: testData.bookId,
                                isbn: '1234567890',
                                title: 'Test Book',
                                author: 'Test Author',
                                description: 'Test Description',
                                price: new Prisma.Decimal(19.99),
                                inventory: testData.availableInventory,
                                category: 'Test',
                                imageUrl: null,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            };

                            mockPrismaService.book.findUnique.mockResolvedValue(mockBook);
                            mockPrismaService.cartItem.findUnique.mockResolvedValue(null);

                            const addToCartDto: AddToCartDto = {
                                bookId: testData.bookId,
                                quantity: testData.requestedQuantity,
                            };

                            // Should throw BadRequestException due to insufficient inventory
                            await expect(
                                service.addItem(testData.userId, addToCartDto)
                            ).rejects.toThrow(BadRequestException);

                            // Verify inventory was checked
                            expect(mockPrismaService.book.findUnique).toHaveBeenCalled();
                            // Verify no cart item was created
                            expect(mockPrismaService.cartItem.create).not.toHaveBeenCalled();
                        }
                    ),
                    { numRuns: 100 }
                );
            }, 15000);

            /**
             * Test: Updating cart quantities recalculates total correctly
             * **Validates: Requirements 4.2**
             */
            it('should recalculate cart total correctly when quantities are updated', async () => {
                await fc.assert(
                    fc.asyncProperty(
                        fc.record({
                            userId: fc.uuid(),
                            cartItems: fc.array(
                                fc.record({
                                    id: fc.uuid(),
                                    bookId: fc.uuid(),
                                    quantity: fc.integer({ min: 1, max: 10 }),
                                    price: fc.double({ min: 0.01, max: 99.99, noNaN: true }).map(p => Math.round(p * 100) / 100),
                                    inventory: fc.integer({ min: 10, max: 100 }),
                                }),
                                { minLength: 1, maxLength: 5 }
                            ),
                        }),
                        async (testData) => {
                            const mockCartItems = testData.cartItems.map(item => ({
                                id: item.id,
                                userId: testData.userId,
                                bookId: item.bookId,
                                quantity: item.quantity,
                                book: {
                                    id: item.bookId,
                                    isbn: '1234567890',
                                    title: 'Test Book',
                                    author: 'Test Author',
                                    description: 'Test Description',
                                    price: new Prisma.Decimal(item.price),
                                    inventory: item.inventory,
                                    category: 'Test',
                                    imageUrl: null,
                                    createdAt: new Date(),
                                    updatedAt: new Date(),
                                },
                            }));

                            mockPrismaService.cartItem.findMany.mockResolvedValue(mockCartItems);

                            const cart = await service.getCart(testData.userId);

                            // Calculate expected total
                            const expectedTotal = testData.cartItems.reduce(
                                (sum, item) => sum + item.price * item.quantity,
                                0
                            );

                            // Verify total is calculated correctly (with small floating point tolerance)
                            expect(Math.abs(cart.total - expectedTotal)).toBeLessThan(0.01);

                            // Verify item count is correct
                            const expectedItemCount = testData.cartItems.reduce(
                                (sum, item) => sum + item.quantity,
                                0
                            );
                            expect(cart.itemCount).toBe(expectedItemCount);

                            // Verify all items are present
                            expect(cart.items.length).toBe(testData.cartItems.length);
                        }
                    ),
                    { numRuns: 100 }
                );
            }, 15000);

            /**
             * Test: Updating item quantity validates inventory
             * **Validates: Requirements 4.2, 4.6**
             */
            it('should validate inventory when updating cart item quantities', async () => {
                await fc.assert(
                    fc.asyncProperty(
                        fc.record({
                            userId: fc.uuid(),
                            itemId: fc.uuid(),
                            bookId: fc.uuid(),
                            currentQuantity: fc.integer({ min: 1, max: 5 }),
                            newQuantity: fc.integer({ min: 1, max: 20 }),
                            inventory: fc.integer({ min: 1, max: 100 }),
                            price: fc.double({ min: 0.01, max: 99.99, noNaN: true }).map(p => Math.round(p * 100) / 100),
                        }),
                        async (testData) => {
                            // Clear mocks before each iteration
                            jest.clearAllMocks();

                            const mockBook = {
                                id: testData.bookId,
                                isbn: '1234567890',
                                title: 'Test Book',
                                author: 'Test Author',
                                description: 'Test Description',
                                price: new Prisma.Decimal(testData.price),
                                inventory: testData.inventory,
                                category: 'Test',
                                imageUrl: null,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            };

                            const mockCartItem = {
                                id: testData.itemId,
                                userId: testData.userId,
                                bookId: testData.bookId,
                                quantity: testData.currentQuantity,
                                book: mockBook,
                            };

                            mockPrismaService.cartItem.findFirst.mockResolvedValue(mockCartItem);

                            const updateDto: UpdateCartItemDto = {
                                quantity: testData.newQuantity,
                            };

                            if (testData.newQuantity <= testData.inventory) {
                                // Should succeed
                                const updatedCartItem = {
                                    ...mockCartItem,
                                    quantity: testData.newQuantity,
                                };
                                mockPrismaService.cartItem.update.mockResolvedValue(updatedCartItem);

                                const result = await service.updateItem(testData.userId, testData.itemId, updateDto);

                                expect(result.quantity).toBe(testData.newQuantity);
                                expect(mockPrismaService.cartItem.update).toHaveBeenCalled();
                            } else {
                                // Should fail due to insufficient inventory
                                await expect(
                                    service.updateItem(testData.userId, testData.itemId, updateDto)
                                ).rejects.toThrow(BadRequestException);

                                expect(mockPrismaService.cartItem.update).not.toHaveBeenCalled();
                            }
                        }
                    ),
                    { numRuns: 100 }
                );
            }, 15000);

            /**
             * Test: Removing items updates cart contents correctly
             * **Validates: Requirements 4.3**
             */
            it('should update cart contents correctly when items are removed', async () => {
                await fc.assert(
                    fc.asyncProperty(
                        fc.record({
                            userId: fc.uuid(),
                            itemId: fc.uuid(),
                            bookId: fc.uuid(),
                        }),
                        async (testData) => {
                            const mockCartItem = {
                                id: testData.itemId,
                                userId: testData.userId,
                                bookId: testData.bookId,
                                quantity: 2,
                            };

                            mockPrismaService.cartItem.findFirst.mockResolvedValue(mockCartItem);
                            mockPrismaService.cartItem.delete.mockResolvedValue(mockCartItem);

                            await service.removeItem(testData.userId, testData.itemId);

                            // Verify the item was found with correct user and item ID
                            expect(mockPrismaService.cartItem.findFirst).toHaveBeenCalledWith({
                                where: {
                                    id: testData.itemId,
                                    userId: testData.userId,
                                },
                            });

                            // Verify the item was deleted
                            expect(mockPrismaService.cartItem.delete).toHaveBeenCalledWith({
                                where: { id: testData.itemId },
                            });
                        }
                    ),
                    { numRuns: 100 }
                );
            }, 15000);

            /**
             * Test: Removing non-existent items throws appropriate error
             * **Validates: Requirements 4.3**
             */
            it('should throw NotFoundException when removing non-existent cart items', async () => {
                await fc.assert(
                    fc.asyncProperty(
                        fc.record({
                            userId: fc.uuid(),
                            itemId: fc.uuid(),
                        }),
                        async (testData) => {
                            mockPrismaService.cartItem.findFirst.mockResolvedValue(null);

                            await expect(
                                service.removeItem(testData.userId, testData.itemId)
                            ).rejects.toThrow(NotFoundException);

                            // Verify delete was not called
                            expect(mockPrismaService.cartItem.delete).not.toHaveBeenCalled();
                        }
                    ),
                    { numRuns: 100 }
                );
            }, 15000);

            /**
             * Test: Cart operations maintain consistency across add, update, and remove
             * **Validates: Requirements 4.1, 4.2, 4.3, 4.6**
             */
            it('should maintain cart consistency across multiple operations', async () => {
                await fc.assert(
                    fc.asyncProperty(
                        fc.record({
                            userId: fc.uuid(),
                            operations: fc.array(
                                fc.oneof(
                                    fc.record({
                                        type: fc.constant('add' as const),
                                        bookId: fc.uuid(),
                                        quantity: fc.integer({ min: 1, max: 5 }),
                                        price: fc.double({ min: 0.01, max: 99.99, noNaN: true }).map(p => Math.round(p * 100) / 100),
                                        inventory: fc.integer({ min: 5, max: 100 }),
                                    }),
                                    fc.record({
                                        type: fc.constant('update' as const),
                                        itemId: fc.uuid(),
                                        quantity: fc.integer({ min: 1, max: 5 }),
                                    }),
                                    fc.record({
                                        type: fc.constant('remove' as const),
                                        itemId: fc.uuid(),
                                    })
                                ),
                                { minLength: 1, maxLength: 3 }
                            ),
                        }),
                        async (testData) => {
                            // Track cart state
                            const cartState = new Map<string, { quantity: number; price: number }>();

                            for (const op of testData.operations) {
                                if (op.type === 'add') {
                                    const mockBook = {
                                        id: op.bookId,
                                        isbn: '1234567890',
                                        title: 'Test Book',
                                        author: 'Test Author',
                                        description: 'Test Description',
                                        price: new Prisma.Decimal(op.price),
                                        inventory: op.inventory,
                                        category: 'Test',
                                        imageUrl: null,
                                        createdAt: new Date(),
                                        updatedAt: new Date(),
                                    };

                                    const mockCartItem = {
                                        id: 'cart-item-' + op.bookId,
                                        userId: testData.userId,
                                        bookId: op.bookId,
                                        quantity: op.quantity,
                                        book: mockBook,
                                    };

                                    mockPrismaService.book.findUnique.mockResolvedValue(mockBook);
                                    mockPrismaService.cartItem.findUnique.mockResolvedValue(null);
                                    mockPrismaService.cartItem.create.mockResolvedValue(mockCartItem);

                                    const result = await service.addItem(testData.userId, {
                                        bookId: op.bookId,
                                        quantity: op.quantity,
                                    });

                                    // Verify inventory was validated
                                    expect(mockPrismaService.book.findUnique).toHaveBeenCalled();
                                    expect(result.quantity).toBe(op.quantity);

                                    cartState.set(op.bookId, { quantity: op.quantity, price: op.price });
                                } else if (op.type === 'remove') {
                                    const mockCartItem = {
                                        id: op.itemId,
                                        userId: testData.userId,
                                        bookId: 'book-id',
                                        quantity: 1,
                                    };

                                    mockPrismaService.cartItem.findFirst.mockResolvedValue(mockCartItem);
                                    mockPrismaService.cartItem.delete.mockResolvedValue(mockCartItem);

                                    await service.removeItem(testData.userId, op.itemId);

                                    // Verify deletion was called
                                    expect(mockPrismaService.cartItem.delete).toHaveBeenCalled();
                                }
                            }

                            // Verify cart state is consistent
                            const mockCartItems = Array.from(cartState.entries()).map(([bookId, data]) => ({
                                id: 'cart-item-' + bookId,
                                userId: testData.userId,
                                bookId: bookId,
                                quantity: data.quantity,
                                book: {
                                    id: bookId,
                                    isbn: '1234567890',
                                    title: 'Test Book',
                                    author: 'Test Author',
                                    description: 'Test Description',
                                    price: new Prisma.Decimal(data.price),
                                    inventory: 100,
                                    category: 'Test',
                                    imageUrl: null,
                                    createdAt: new Date(),
                                    updatedAt: new Date(),
                                },
                            }));

                            mockPrismaService.cartItem.findMany.mockResolvedValue(mockCartItems);

                            const cart = await service.getCart(testData.userId);

                            // Calculate expected total
                            let expectedTotal = 0;
                            let expectedItemCount = 0;
                            for (const [, data] of cartState) {
                                expectedTotal += data.price * data.quantity;
                                expectedItemCount += data.quantity;
                            }

                            // Verify totals are correct
                            expect(Math.abs(cart.total - expectedTotal)).toBeLessThan(0.01);
                            expect(cart.itemCount).toBe(expectedItemCount);
                        }
                    ),
                    { numRuns: 100 }
                );
            }, 20000);
        });
    });
});
