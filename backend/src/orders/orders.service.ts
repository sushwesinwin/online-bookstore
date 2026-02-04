import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Order, OrderStatus, Prisma } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) { }

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

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    const { items } = createOrderDto;

    // Validate inventory and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const book = await this.prisma.book.findUnique({
        where: { id: item.bookId },
      });

      if (!book) {
        throw new NotFoundException(`Book with ID ${item.bookId} not found`);
      }

      if (book.inventory < item.quantity) {
        throw new BadRequestException(
          `Insufficient inventory for book "${book.title}". Available: ${book.inventory}, Requested: ${item.quantity}`,
        );
      }

      const itemTotal = book.price.toNumber() * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        bookId: item.bookId,
        quantity: item.quantity,
        price: book.price,
      });
    }

    // Generate unique order number with retry logic
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
      if (attempts === maxAttempts) {
        throw new BadRequestException('Failed to generate unique order number');
      }
    }

    // Create order with items in a transaction
    return await this.prisma.$transaction(async tx => {
      // Create the order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          totalAmount,
          items: {
            create: orderItems,
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

      // Update inventory for each book
      for (const item of items) {
        await tx.book.update({
          where: { id: item.bookId },
          data: {
            inventory: {
              decrement: item.quantity,
            },
          },
        });
      }

      return order;
    });
  }

  async findAll(userId?: string, query?: any) {
    const { page = 1, limit = 10, search, status, startDate, endDate, sortBy = 'createdAt', sortOrder = 'desc' } = query || {};

    const where: Prisma.OrderWhereInput = {};

    if (userId) {
      where.userId = userId;
    }

    // Search by order number or user email
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query with count
    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          items: {
            include: {
              book: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          payment: true,
        },
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.order.count({ where }),
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

  async findOne(id: string, userId?: string): Promise<Order> {
    const where: Prisma.OrderWhereUniqueInput = { id };

    const order = await this.prisma.order.findUnique({
      where,
      include: {
        items: {
          include: {
            book: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // If userId is provided, ensure the order belongs to the user
    if (userId && order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(
    id: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    try {
      return await this.prisma.order.update({
        where: { id },
        data: { status: updateOrderStatusDto.status },
        include: {
          items: {
            include: {
              book: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          payment: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Order not found');
        }
      }
      throw error;
    }
  }

  async cancelOrder(id: string, userId?: string): Promise<Order> {
    const order = await this.findOne(id, userId);

    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.CONFIRMED
    ) {
      throw new BadRequestException('Order cannot be cancelled at this stage');
    }

    // Cancel order and restore inventory in a transaction
    return await this.prisma.$transaction(async tx => {
      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED },
        include: {
          items: {
            include: {
              book: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          payment: true,
        },
      });

      // Restore inventory for each item
      for (const item of updatedOrder.items) {
        await tx.book.update({
          where: { id: item.bookId },
          data: {
            inventory: {
              increment: item.quantity,
            },
          },
        });
      }

      return updatedOrder;
    });
  }

  async getUserOrders(userId: string, query?: any) {
    return this.findAll(userId, query);
  }
}
