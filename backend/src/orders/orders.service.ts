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
  constructor(private prisma: PrismaService) {}

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

    // Create order with items in a transaction
    return await this.prisma.$transaction(async tx => {
      // Create the order
      const order = await tx.order.create({
        data: {
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

  async findAll(userId?: string) {
    const where: Prisma.OrderWhereInput = userId ? { userId } : {};

    return await this.prisma.order.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });
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

  async getUserOrders(userId: string) {
    return this.findAll(userId);
  }
}
