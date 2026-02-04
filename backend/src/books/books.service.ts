import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Book, Prisma } from '@prisma/client';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { QueryBooksDto } from './dto/query-books.dto';
import { PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) { }

  async create(createBookDto: CreateBookDto): Promise<Book> {
    try {
      return await this.prisma.book.create({
        data: createBookDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Book with this ISBN already exists');
        }
      }
      throw error;
    }
  }

  async findAll(query?: QueryBooksDto): Promise<PaginatedResult<Book>> {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      minPrice,
      maxPrice,
      author,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      inStock,
    } = query || {};

    const skip = (page - 1) * limit;

    const where: Prisma.BookWhereInput = {};

    // Search across multiple fields
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { isbn: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filters
    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }
    if (author) {
      where.author = { contains: author, mode: 'insensitive' };
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }
    if (inStock !== undefined && inStock) {
      where.inventory = { gt: 0 };
    }

    const [data, total] = await Promise.all([
      this.prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.book.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    return book;
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    try {
      return await this.prisma.book.update({
        where: { id },
        data: updateBookDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Book not found');
        }
        if (error.code === 'P2002') {
          throw new ConflictException('Book with this ISBN already exists');
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.book.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Book not found');
        }
      }
      throw error;
    }
  }

  async updateInventory(id: string, quantity: number): Promise<Book> {
    try {
      return await this.prisma.book.update({
        where: { id },
        data: { inventory: quantity },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Book not found');
        }
      }
      throw error;
    }
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.prisma.book.findMany({
      select: { category: true },
      distinct: ['category'],
    });

    return categories.map(c => c.category);
  }
}
