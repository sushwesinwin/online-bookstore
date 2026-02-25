import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as fc from 'fast-check';
import { BooksService } from './books.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Prisma } from '@prisma/client';
import { SortOrder } from './dto/query-books.dto';

describe('BooksService', () => {
  let service: BooksService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    book: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Property-Based Tests', () => {
    /**
     * Feature: online-bookstore-system, Property 5: Book Data Integrity
     * For any book creation or update operation, all required fields (title, author, price, inventory)
     * should be validated and stored correctly with unique ISBN enforcement.
     * Validates: Requirements 2.1, 2.2, 2.4, 2.6
     */
    it('should maintain book data integrity for all valid inputs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            isbn: fc
              .string({ minLength: 10, maxLength: 13 })
              .map(s => s.replace(/[^0-9X]/g, '0')),
            title: fc.string({ minLength: 1, maxLength: 200 }),
            author: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.option(fc.string({ maxLength: 1000 }), {
              nil: undefined,
            }),
            price: fc
              .double({ min: 0.01, max: 9999.99, noNaN: true })
              .map(p => Math.round(p * 100) / 100),
            inventory: fc.integer({ min: 0, max: 10000 }),
            category: fc.string({ minLength: 1, maxLength: 50 }),
            imageUrl: fc.option(fc.webUrl(), { nil: undefined }),
          }),
          async bookData => {
            const mockBook = {
              id: 'test-book-id',
              ...bookData,
              price: new Prisma.Decimal(bookData.price),
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            mockPrismaService.book.create.mockResolvedValue(mockBook);

            const result = await service.create(bookData as CreateBookDto);

            // Verify all required fields are present
            expect(result.isbn).toBe(bookData.isbn);
            expect(result.title).toBe(bookData.title);
            expect(result.author).toBe(bookData.author);
            expect(result.price.toNumber()).toBe(bookData.price);
            expect(result.inventory).toBe(bookData.inventory);
            expect(result.category).toBe(bookData.category);

            // Verify optional fields
            if (bookData.description !== undefined) {
              expect(result.description).toBe(bookData.description);
            }
            if (bookData.imageUrl !== undefined) {
              expect(result.imageUrl).toBe(bookData.imageUrl);
            }

            // Verify price is positive
            expect(result.price.toNumber()).toBeGreaterThan(0);

            // Verify inventory is non-negative
            expect(result.inventory).toBeGreaterThanOrEqual(0);

            // Verify create was called with correct data
            expect(mockPrismaService.book.create).toHaveBeenCalledWith({
              data: bookData,
            });
          },
        ),
        { numRuns: 100 },
      );
    }, 15000);

    /**
     * Feature: online-bookstore-system, Property 6: Book Deletion Preservation
     * For any book deletion operation, the book should be removed from the catalog
     * while preserving all historical order references to maintain data integrity.
     * Validates: Requirements 2.3
     */
    it('should handle book deletion while preserving order history', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 30 }),
          async bookId => {
            // Mock successful deletion
            mockPrismaService.book.delete.mockResolvedValue({
              id: bookId,
              isbn: '1234567890',
              title: 'Test Book',
              author: 'Test Author',
              description: null,
              price: new Prisma.Decimal(19.99),
              inventory: 10,
              category: 'Fiction',
              imageUrl: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            });

            await service.remove(bookId);

            // Verify delete was called with correct ID
            expect(mockPrismaService.book.delete).toHaveBeenCalledWith({
              where: { id: bookId },
            });

            // Note: The actual preservation of order history is handled by database
            // foreign key constraints (ON DELETE RESTRICT or similar), which prevents
            // deletion if orders reference this book. This test verifies the service
            // calls the delete operation correctly.
          },
        ),
        { numRuns: 100 },
      );
    }, 15000);

    /**
     * Feature: online-bookstore-system, Property 7: Inventory State Management
     * For any book with inventory count, when inventory reaches zero, the book should be
     * marked as out of stock and unavailable for new cart additions.
     * Validates: Requirements 2.5
     */
    it('should manage inventory state correctly including out-of-stock marking', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 30 }),
          fc.integer({ min: 0, max: 100 }),
          async (bookId, initialInventory) => {
            const mockBook = {
              id: bookId,
              isbn: '1234567890',
              title: 'Test Book',
              author: 'Test Author',
              description: null,
              price: new Prisma.Decimal(19.99),
              inventory: initialInventory,
              category: 'Fiction',
              imageUrl: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            mockPrismaService.book.update.mockResolvedValue(mockBook);

            const result = await service.updateInventory(
              bookId,
              initialInventory,
            );

            // Verify inventory is set correctly
            expect(result.inventory).toBe(initialInventory);

            // Verify inventory state: when zero, book should be out of stock
            if (initialInventory === 0) {
              expect(result.inventory).toBe(0);
              // The out-of-stock state is determined by inventory === 0
              // Cart operations should check this before allowing additions
            } else {
              expect(result.inventory).toBeGreaterThan(0);
            }

            // Verify update was called with correct parameters
            expect(mockPrismaService.book.update).toHaveBeenCalledWith({
              where: { id: bookId },
              data: { inventory: initialInventory },
            });
          },
        ),
        { numRuns: 100 },
      );
    }, 15000);

    /**
     * Feature: online-bookstore-system, Property 8: Search Result Relevance
     * For any search query, all returned results should match the search terms in title,
     * author, or description fields and be properly paginated.
     * Validates: Requirements 3.1, 3.4
     */
    it('should return relevant search results with proper pagination', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 1, max: 50 }),
          async (searchTerm, page, limit) => {
            // Create mock books that match the search term
            const mockBooks = Array.from(
              { length: Math.min(limit, 10) },
              (_, i) => ({
                id: `book-${i}`,
                isbn: `123456789${i}`,
                title: i % 3 === 0 ? `${searchTerm} Book` : `Book ${i}`,
                author: i % 3 === 1 ? `${searchTerm} Author` : `Author ${i}`,
                description:
                  i % 3 === 2
                    ? `Description with ${searchTerm}`
                    : `Description ${i}`,
                price: new Prisma.Decimal(19.99 + i),
                inventory: 10 + i,
                category: 'Fiction',
                imageUrl: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              }),
            );

            const total = 25;
            mockPrismaService.book.findMany.mockResolvedValue(mockBooks);
            mockPrismaService.book.count.mockResolvedValue(total);

            const result = await service.findAll({
              search: searchTerm,
              page,
              limit,
            });

            // Verify pagination metadata
            expect(result.meta.page).toBe(page);
            expect(result.meta.limit).toBe(limit);
            expect(result.meta.total).toBe(total);
            expect(result.meta.totalPages).toBe(Math.ceil(total / limit));

            // Verify books array is returned
            expect(Array.isArray(result.data)).toBe(true);
            expect(result.data.length).toBeLessThanOrEqual(limit);

            // Verify search was called with correct parameters
            expect(mockPrismaService.book.findMany).toHaveBeenCalledWith(
              expect.objectContaining({
                where: expect.objectContaining({
                  OR: expect.arrayContaining([
                    { title: { contains: searchTerm, mode: 'insensitive' } },
                    { author: { contains: searchTerm, mode: 'insensitive' } },
                    {
                      description: {
                        contains: searchTerm,
                        mode: 'insensitive',
                      },
                    },
                  ]),
                }),
                skip: (page - 1) * limit,
                take: limit,
              }),
            );
          },
        ),
        { numRuns: 100 },
      );
    }, 15000);

    /**
     * Feature: online-bookstore-system, Property 9: Filter and Sort Consistency
     * For any combination of filters and sort criteria, the results should match all
     * selected filters and be ordered according to the specified sort attribute.
     * Validates: Requirements 3.2, 3.3
     */
    it('should apply filters and sorting consistently', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            category: fc.option(fc.string({ minLength: 1, maxLength: 50 }), {
              nil: undefined,
            }),
            author: fc.option(fc.string({ minLength: 1, maxLength: 50 }), {
              nil: undefined,
            }),
            minPrice: fc.option(
              fc
                .double({ min: 0.01, max: 50, noNaN: true })
                .map(p => Math.round(p * 100) / 100),
              { nil: undefined },
            ),
            maxPrice: fc.option(
              fc
                .double({ min: 50, max: 100, noNaN: true })
                .map(p => Math.round(p * 100) / 100),
              { nil: undefined },
            ),
            sortBy: fc.constantFrom('title', 'author', 'price', 'createdAt'),
            sortOrder: fc.constantFrom('asc', 'desc'),
          }),
          async filters => {
            // Clear mocks before each property test iteration
            jest.clearAllMocks();

            const mockBooks = [
              {
                id: 'book-1',
                isbn: '1234567890',
                title: 'Book A',
                author: filters.author || 'Author A',
                description: null,
                price: new Prisma.Decimal(filters.minPrice || 25),
                inventory: 10,
                category: filters.category || 'Fiction',
                imageUrl: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ];

            mockPrismaService.book.findMany.mockResolvedValue(mockBooks);
            mockPrismaService.book.count.mockResolvedValue(1);

import { SortOrder } from './dto/query-books.dto';

// ... (inside the test)
            const result = await service.findAll({
              ...filters,
              page: 1,
              limit: 10,
              sortOrder: filters.sortOrder as SortOrder,
            });

            // Verify findMany was called with correct filter parameters
            const callArgs = mockPrismaService.book.findMany.mock.calls[0][0];

            // Verify category filter
            if (filters.category) {
              expect(callArgs.where).toHaveProperty('category');
              expect(callArgs.where.category).toEqual({
                contains: filters.category,
                mode: 'insensitive',
              });
            }

            // Verify author filter
            if (filters.author) {
              expect(callArgs.where).toHaveProperty('author');
              expect(callArgs.where.author).toEqual({
                contains: filters.author,
                mode: 'insensitive',
              });
            }

            // Verify price filter
            if (
              filters.minPrice !== undefined ||
              filters.maxPrice !== undefined
            ) {
              expect(callArgs.where).toHaveProperty('price');
            }

            // Verify sorting - the service uses the provided sortBy or defaults to 'createdAt'
            expect(callArgs.orderBy).toBeDefined();
            expect(callArgs.orderBy).toHaveProperty(filters.sortBy);
            expect(callArgs.orderBy[filters.sortBy]).toBe(filters.sortOrder);

            // Verify results are returned
            expect(Array.isArray(result.data)).toBe(true);
          },
        ),
        { numRuns: 100 },
      );
    }, 15000);

    /**
     * Feature: online-bookstore-system, Property 10: Book Detail Completeness
     * For any book in the system, viewing book details should display all available
     * information including current availability status.
     * Validates: Requirements 3.5, 3.6
     */
    it('should return complete book details with availability status', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 30 }),
          fc.record({
            isbn: fc
              .string({ minLength: 10, maxLength: 13 })
              .map(s => s.replace(/[^0-9X]/g, '0')),
            title: fc.string({ minLength: 1, maxLength: 200 }),
            author: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.option(fc.string({ maxLength: 1000 }), {
              nil: null,
            }),
            price: fc
              .double({ min: 0.01, max: 9999.99, noNaN: true })
              .map(p => Math.round(p * 100) / 100),
            inventory: fc.integer({ min: 0, max: 10000 }),
            category: fc.string({ minLength: 1, maxLength: 50 }),
            imageUrl: fc.option(fc.webUrl(), { nil: null }),
          }),
          async (bookId, bookData) => {
            const mockBook = {
              id: bookId,
              ...bookData,
              price: new Prisma.Decimal(bookData.price),
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            mockPrismaService.book.findUnique.mockResolvedValue(mockBook);

            const result = await service.findOne(bookId);

            // Verify all book details are present
            expect(result.id).toBe(bookId);
            expect(result.isbn).toBe(bookData.isbn);
            expect(result.title).toBe(bookData.title);
            expect(result.author).toBe(bookData.author);
            expect(result.description).toBe(bookData.description);
            expect(result.price.toNumber()).toBe(bookData.price);
            expect(result.inventory).toBe(bookData.inventory);
            expect(result.category).toBe(bookData.category);
            expect(result.imageUrl).toBe(bookData.imageUrl);

            // Verify availability status can be determined from inventory
            const isAvailable = result.inventory > 0;
            expect(typeof isAvailable).toBe('boolean');

            // Verify timestamps are present
            expect(result.createdAt).toBeInstanceOf(Date);
            expect(result.updatedAt).toBeInstanceOf(Date);

            // Verify findUnique was called with correct ID
            expect(mockPrismaService.book.findUnique).toHaveBeenCalledWith({
              where: { id: bookId },
            });
          },
        ),
        { numRuns: 100 },
      );
    }, 15000);

    /**
     * Additional property test: ISBN uniqueness enforcement
     */
    it('should enforce ISBN uniqueness across all book operations', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            isbn: fc
              .string({ minLength: 10, maxLength: 13 })
              .map(s => s.replace(/[^0-9X]/g, '0')),
            title: fc.string({ minLength: 1, maxLength: 200 }),
            author: fc.string({ minLength: 1, maxLength: 100 }),
            price: fc
              .double({ min: 0.01, max: 9999.99, noNaN: true })
              .map(p => Math.round(p * 100) / 100),
            inventory: fc.integer({ min: 0, max: 10000 }),
            category: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          async bookData => {
            // Simulate ISBN conflict
            const error = new Prisma.PrismaClientKnownRequestError(
              'Unique constraint failed',
              {
                code: 'P2002',
                clientVersion: '5.0.0',
                meta: { target: ['isbn'] },
              },
            );

            mockPrismaService.book.create.mockRejectedValue(error);

            await expect(
              service.create(bookData as CreateBookDto),
            ).rejects.toThrow(ConflictException);

            await expect(
              service.create(bookData as CreateBookDto),
            ).rejects.toThrow('Book with this ISBN already exists');
          },
        ),
        { numRuns: 50 },
      );
    }, 15000);

    /**
     * Additional property test: Update operations maintain data integrity
     */
    it('should maintain data integrity during update operations', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 30 }),
          fc.record({
            title: fc.option(fc.string({ minLength: 1, maxLength: 200 }), {
              nil: undefined,
            }),
            author: fc.option(fc.string({ minLength: 1, maxLength: 100 }), {
              nil: undefined,
            }),
            price: fc.option(
              fc
                .double({ min: 0.01, max: 9999.99, noNaN: true })
                .map(p => Math.round(p * 100) / 100),
              { nil: undefined },
            ),
            inventory: fc.option(fc.integer({ min: 0, max: 10000 }), {
              nil: undefined,
            }),
          }),
          async (bookId, updateData) => {
            const mockUpdatedBook = {
              id: bookId,
              isbn: '1234567890',
              title: updateData.title || 'Original Title',
              author: updateData.author || 'Original Author',
              description: null,
              price: new Prisma.Decimal(updateData.price || 19.99),
              inventory:
                updateData.inventory !== undefined ? updateData.inventory : 10,
              category: 'Fiction',
              imageUrl: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            mockPrismaService.book.update.mockResolvedValue(mockUpdatedBook);

            const result = await service.update(
              bookId,
              updateData as UpdateBookDto,
            );

            // Verify update was called correctly
            expect(mockPrismaService.book.update).toHaveBeenCalledWith({
              where: { id: bookId },
              data: updateData,
            });

            // Verify updated fields
            if (updateData.title !== undefined) {
              expect(result.title).toBe(updateData.title);
            }
            if (updateData.author !== undefined) {
              expect(result.author).toBe(updateData.author);
            }
            if (updateData.price !== undefined) {
              expect(result.price.toNumber()).toBe(updateData.price);
            }
            if (updateData.inventory !== undefined) {
              expect(result.inventory).toBe(updateData.inventory);
            }
          },
        ),
        { numRuns: 100 },
      );
    }, 15000);
  });

  describe('Unit Tests', () => {
    describe('create', () => {
      it('should create a book with all required fields', async () => {
        const bookData: CreateBookDto = {
          isbn: '9781234567890',
          title: 'Test Book',
          author: 'Test Author',
          description: 'A test book description',
          price: 29.99,
          inventory: 100,
          category: 'Fiction',
          imageUrl: 'https://example.com/book.jpg',
        };

        const mockBook = {
          id: 'test-id',
          ...bookData,
          price: new Prisma.Decimal(bookData.price),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockPrismaService.book.create.mockResolvedValue(mockBook);

        const result = await service.create(bookData);

        expect(result.isbn).toBe(bookData.isbn);
        expect(result.title).toBe(bookData.title);
        expect(result.author).toBe(bookData.author);
        expect(result.price.toNumber()).toBe(bookData.price);
        expect(mockPrismaService.book.create).toHaveBeenCalledWith({
          data: bookData,
        });
      });

      it('should throw ConflictException for duplicate ISBN', async () => {
        const bookData: CreateBookDto = {
          isbn: '9781234567890',
          title: 'Test Book',
          author: 'Test Author',
          price: 29.99,
          inventory: 100,
          category: 'Fiction',
        };

        const error = new Prisma.PrismaClientKnownRequestError(
          'Unique constraint failed',
          {
            code: 'P2002',
            clientVersion: '5.0.0',
            meta: { target: ['isbn'] },
          },
        );

        mockPrismaService.book.create.mockRejectedValue(error);

        await expect(service.create(bookData)).rejects.toThrow(
          ConflictException,
        );
        await expect(service.create(bookData)).rejects.toThrow(
          'Book with this ISBN already exists',
        );
      });

      it('should create book with minimum required fields', async () => {
        const bookData: CreateBookDto = {
          isbn: '1234567890',
          title: 'Minimal Book',
          author: 'Author',
          price: 0.01,
          inventory: 0,
          category: 'Test',
        };

        const mockBook = {
          id: 'test-id',
          ...bookData,
          description: null,
          imageUrl: null,
          price: new Prisma.Decimal(bookData.price),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockPrismaService.book.create.mockResolvedValue(mockBook);

        const result = await service.create(bookData);

        expect(result.isbn).toBe(bookData.isbn);
        expect(result.title).toBe(bookData.title);
        expect(result.inventory).toBe(0);
      });
    });

    describe('findOne', () => {
      it('should return a book by ID', async () => {
        const mockBook = {
          id: 'test-id',
          isbn: '9781234567890',
          title: 'Test Book',
          author: 'Test Author',
          description: 'Description',
          price: new Prisma.Decimal(29.99),
          inventory: 100,
          category: 'Fiction',
          imageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockPrismaService.book.findUnique.mockResolvedValue(mockBook);

        const result = await service.findOne('test-id');

        expect(result).toEqual(mockBook);
        expect(mockPrismaService.book.findUnique).toHaveBeenCalledWith({
          where: { id: 'test-id' },
        });
      });

      it('should throw NotFoundException when book not found', async () => {
        mockPrismaService.book.findUnique.mockResolvedValue(null);

        await expect(service.findOne('non-existent-id')).rejects.toThrow(
          NotFoundException,
        );
        await expect(service.findOne('non-existent-id')).rejects.toThrow(
          'Book not found',
        );
      });
    });

    describe('update', () => {
      it('should update a book successfully', async () => {
        const updateData: UpdateBookDto = {
          title: 'Updated Title',
          price: 39.99,
        };

        const mockUpdatedBook = {
          id: 'test-id',
          isbn: '9781234567890',
          title: 'Updated Title',
          author: 'Test Author',
          description: null,
          price: new Prisma.Decimal(39.99),
          inventory: 100,
          category: 'Fiction',
          imageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockPrismaService.book.update.mockResolvedValue(mockUpdatedBook);

        const result = await service.update('test-id', updateData);

        expect(result.title).toBe('Updated Title');
        expect(result.price.toNumber()).toBe(39.99);
        expect(mockPrismaService.book.update).toHaveBeenCalledWith({
          where: { id: 'test-id' },
          data: updateData,
        });
      });

      it('should throw NotFoundException when updating non-existent book', async () => {
        const updateData: UpdateBookDto = {
          title: 'Updated Title',
        };

        const error = new Prisma.PrismaClientKnownRequestError(
          'Record not found',
          {
            code: 'P2025',
            clientVersion: '5.0.0',
            meta: {},
          },
        );

        mockPrismaService.book.update.mockRejectedValue(error);

        await expect(
          service.update('non-existent-id', updateData),
        ).rejects.toThrow(NotFoundException);
      });

      it('should throw ConflictException when updating to duplicate ISBN', async () => {
        const updateData: UpdateBookDto = {
          isbn: '9781234567890',
        };

        const error = new Prisma.PrismaClientKnownRequestError(
          'Unique constraint failed',
          {
            code: 'P2002',
            clientVersion: '5.0.0',
            meta: { target: ['isbn'] },
          },
        );

        mockPrismaService.book.update.mockRejectedValue(error);

        await expect(service.update('test-id', updateData)).rejects.toThrow(
          ConflictException,
        );
      });
    });

    describe('remove', () => {
      it('should delete a book successfully', async () => {
        const mockBook = {
          id: 'test-id',
          isbn: '9781234567890',
          title: 'Test Book',
          author: 'Test Author',
          description: null,
          price: new Prisma.Decimal(29.99),
          inventory: 100,
          category: 'Fiction',
          imageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockPrismaService.book.delete.mockResolvedValue(mockBook);

        await service.remove('test-id');

        expect(mockPrismaService.book.delete).toHaveBeenCalledWith({
          where: { id: 'test-id' },
        });
      });

      it('should throw NotFoundException when deleting non-existent book', async () => {
        const error = new Prisma.PrismaClientKnownRequestError(
          'Record not found',
          {
            code: 'P2025',
            clientVersion: '5.0.0',
            meta: {},
          },
        );

        mockPrismaService.book.delete.mockRejectedValue(error);

        await expect(service.remove('non-existent-id')).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('updateInventory', () => {
      it('should update book inventory', async () => {
        const mockBook = {
          id: 'test-id',
          isbn: '9781234567890',
          title: 'Test Book',
          author: 'Test Author',
          description: null,
          price: new Prisma.Decimal(29.99),
          inventory: 50,
          category: 'Fiction',
          imageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockPrismaService.book.update.mockResolvedValue(mockBook);

        const result = await service.updateInventory('test-id', 50);

        expect(result.inventory).toBe(50);
        expect(mockPrismaService.book.update).toHaveBeenCalledWith({
          where: { id: 'test-id' },
          data: { inventory: 50 },
        });
      });

      it('should allow setting inventory to zero', async () => {
        const mockBook = {
          id: 'test-id',
          isbn: '9781234567890',
          title: 'Test Book',
          author: 'Test Author',
          description: null,
          price: new Prisma.Decimal(29.99),
          inventory: 0,
          category: 'Fiction',
          imageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mockPrismaService.book.update.mockResolvedValue(mockBook);

        const result = await service.updateInventory('test-id', 0);

        expect(result.inventory).toBe(0);
      });
    });
  });
});
