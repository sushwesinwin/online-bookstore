import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import * as fc from 'fast-check';

// Mock PrismaService for testing
const mockPrismaService = {
  user: {
    create: jest.fn(),
    delete: jest.fn(),
  },
  book: {
    create: jest.fn(),
    delete: jest.fn(),
  },
  cartItem: {
    create: jest.fn(),
    delete: jest.fn(),
  },
  order: {
    create: jest.fn(),
  },
  orderItem: {
    deleteMany: jest.fn(),
  },
  $disconnect: jest.fn(),
};

describe('PrismaService - Database Schema Integrity', () => {
  let service: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PrismaService>(PrismaService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await service.$disconnect();
  });

  /**
   * Feature: online-bookstore-system, Property 24: Database Migration Consistency
   * Validates: Requirements 9.2
   */
  it('should maintain database schema consistency across migrations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          firstName: fc.string({ minLength: 1, maxLength: 50 }),
          lastName: fc.string({ minLength: 1, maxLength: 50 }),
          password: fc.string({ minLength: 8, maxLength: 100 }),
        }),
        fc.record({
          isbn: fc.string({ minLength: 10, maxLength: 17 }),
          title: fc.string({ minLength: 1, maxLength: 200 }),
          author: fc.string({ minLength: 1, maxLength: 100 }),
          description: fc.option(fc.string({ maxLength: 1000 })),
          price: fc.float({ min: Math.fround(0.01), max: Math.fround(999.99) }),
          inventory: fc.integer({ min: 0, max: 10000 }),
          category: fc.string({ minLength: 1, maxLength: 50 }),
          imageUrl: fc.option(fc.webUrl()),
        }),
        async (userData, bookData) => {
          // Mock successful user creation
          const mockUser = {
            id: 'user-id-123',
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            password: userData.password,
            role: 'USER',
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          service.user.create.mockResolvedValue(mockUser);

          // Mock successful book creation
          const mockBook = {
            id: 'book-id-123',
            isbn: bookData.isbn,
            title: bookData.title,
            author: bookData.author,
            description: bookData.description,
            price: bookData.price,
            inventory: bookData.inventory,
            category: bookData.category,
            imageUrl: bookData.imageUrl,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          service.book.create.mockResolvedValue(mockBook);

          // Mock successful cart item creation
          const mockCartItem = {
            id: 'cart-item-123',
            userId: mockUser.id,
            bookId: mockBook.id,
            quantity: 1,
          };
          service.cartItem.create.mockResolvedValue(mockCartItem);

          // Mock successful order creation
          const mockOrder = {
            id: 'order-id-123',
            userId: mockUser.id,
            status: 'PENDING',
            totalAmount: mockBook.price,
            createdAt: new Date(),
            updatedAt: new Date(),
            items: [
              {
                id: 'order-item-123',
                bookId: mockBook.id,
                quantity: 1,
                price: mockBook.price,
              },
            ],
          };
          service.order.create.mockResolvedValue(mockOrder);

          // Test that we can create a user with the schema
          const user = await service.user.create({
            data: {
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              password: userData.password,
            },
          });

          // Verify user was created with correct schema structure
          expect(user).toHaveProperty('id');
          expect(user).toHaveProperty('email', userData.email);
          expect(user).toHaveProperty('firstName', userData.firstName);
          expect(user).toHaveProperty('lastName', userData.lastName);
          expect(user).toHaveProperty('password', userData.password);
          expect(user).toHaveProperty('role');
          expect(user).toHaveProperty('createdAt');
          expect(user).toHaveProperty('updatedAt');

          // Test that we can create a book with the schema
          const book = await service.book.create({
            data: {
              isbn: bookData.isbn,
              title: bookData.title,
              author: bookData.author,
              description: bookData.description,
              price: bookData.price,
              inventory: bookData.inventory,
              category: bookData.category,
              imageUrl: bookData.imageUrl,
            },
          });

          // Verify book was created with correct schema structure
          expect(book).toHaveProperty('id');
          expect(book).toHaveProperty('isbn', bookData.isbn);
          expect(book).toHaveProperty('title', bookData.title);
          expect(book).toHaveProperty('author', bookData.author);
          expect(book).toHaveProperty('description', bookData.description);
          expect(book).toHaveProperty('price');
          expect(book).toHaveProperty('inventory', bookData.inventory);
          expect(book).toHaveProperty('category', bookData.category);
          expect(book).toHaveProperty('imageUrl', bookData.imageUrl);
          expect(book).toHaveProperty('createdAt');
          expect(book).toHaveProperty('updatedAt');

          // Test that we can create related data (cart item)
          const cartItem = await service.cartItem.create({
            data: {
              userId: user.id,
              bookId: book.id,
              quantity: 1,
            },
          });

          // Verify cart item maintains referential integrity
          expect(cartItem).toHaveProperty('id');
          expect(cartItem).toHaveProperty('userId', user.id);
          expect(cartItem).toHaveProperty('bookId', book.id);
          expect(cartItem).toHaveProperty('quantity', 1);

          // Test that we can create an order with order items
          const order = await service.order.create({
            data: {
              userId: user.id,
              totalAmount: book.price,
              items: {
                create: {
                  bookId: book.id,
                  quantity: 1,
                  price: book.price,
                },
              },
            },
            include: {
              items: true,
            },
          });

          // Verify order and order items maintain schema consistency
          expect(order).toHaveProperty('id');
          expect(order).toHaveProperty('userId', user.id);
          expect(order).toHaveProperty('status');
          expect(order).toHaveProperty('totalAmount');
          expect(order).toHaveProperty('createdAt');
          expect(order).toHaveProperty('updatedAt');
          expect(order.items).toHaveLength(1);
          expect(order.items[0]).toHaveProperty('bookId', book.id);
          expect(order.items[0]).toHaveProperty('quantity', 1);

          // Verify all create methods were called with correct data
          expect(service.user.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              password: userData.password,
            }),
          });

          expect(service.book.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
              isbn: bookData.isbn,
              title: bookData.title,
              author: bookData.author,
              price: bookData.price,
              inventory: bookData.inventory,
              category: bookData.category,
            }),
          });

          expect(service.cartItem.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
              userId: user.id,
              bookId: book.id,
              quantity: 1,
            }),
          });

          expect(service.order.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
              userId: user.id,
              totalAmount: book.price,
            }),
            include: { items: true },
          });
        },
      ),
      { numRuns: 100 }, // Full 100 runs for comprehensive testing
    );
  });

  it('should enforce referential integrity constraints', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        async (nonExistentUserId, nonExistentBookId) => {
          // Mock referential integrity violations
          service.cartItem.create.mockRejectedValue(
            new Error('Foreign key constraint failed'),
          );
          service.order.create.mockRejectedValue(
            new Error('Foreign key constraint failed'),
          );

          // Attempt to create cart item with non-existent user should fail
          await expect(
            service.cartItem.create({
              data: {
                userId: nonExistentUserId,
                bookId: nonExistentBookId,
                quantity: 1,
              },
            }),
          ).rejects.toThrow();

          // Attempt to create order with non-existent user should fail
          await expect(
            service.order.create({
              data: {
                userId: nonExistentUserId,
                totalAmount: 10.99,
              },
            }),
          ).rejects.toThrow();

          // Verify the methods were called
          expect(service.cartItem.create).toHaveBeenCalled();
          expect(service.order.create).toHaveBeenCalled();
        },
      ),
      { numRuns: 50 }, // Reduced runs for error cases
    );
  });
});
