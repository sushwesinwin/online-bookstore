import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, Prisma, Role } from '@prisma/client';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const adminUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImage: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { orders: true } },
} satisfies Prisma.UserSelect;

type AdminUserRecord = Prisma.UserGetPayload<{
  select: typeof adminUserSelect;
}>;

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  private mapAdminUser(user: AdminUserRecord) {
    const { _count, ...rest } = user;

    return {
      ...rest,
      orderCount: _count.orders,
    };
  }

  private async ensureAdminAccountRemains(excludedUserId: string) {
    const remainingAdmins = await this.prisma.user.count({
      where: {
        role: Role.ADMIN,
        id: { not: excludedUserId },
      },
    });

    if (remainingAdmins === 0) {
      throw new BadRequestException('At least one admin account must remain.');
    }
  }

  async getDashboardStats() {
    // Get total revenue from completed orders
    const revenueData = await this.prisma.order.aggregate({
      where: {
        status: {
          in: [
            OrderStatus.CONFIRMED,
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED,
          ],
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Get total books count
    const booksCount = await this.prisma.book.count();

    // Get total orders count
    const ordersCount = await this.prisma.order.count();

    // Get active customers count (users who have placed orders)
    const activeCustomersCount = await this.prisma.user.count({
      where: {
        orders: {
          some: {},
        },
      },
    });

    // Get previous period stats for comparison
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const previousRevenueData = await this.prisma.order.aggregate({
      where: {
        status: {
          in: [
            OrderStatus.CONFIRMED,
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED,
          ],
        },
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    const previousOrdersCount = await this.prisma.order.count({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    // Calculate changes
    const currentRevenue = revenueData._sum.totalAmount?.toNumber() || 0;
    const previousRevenue =
      previousRevenueData._sum.totalAmount?.toNumber() || 1;
    const revenueChange =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    const ordersChange =
      previousOrdersCount > 0
        ? ((ordersCount - previousOrdersCount) / previousOrdersCount) * 100
        : 0;

    return {
      totalRevenue: {
        value: currentRevenue,
        change: revenueChange,
        trend: revenueChange >= 0 ? 'up' : 'down',
      },
      booksInCatalog: {
        value: booksCount,
        change: 0, // Static for now
        trend: 'up',
      },
      totalOrders: {
        value: ordersCount,
        change: ordersChange,
        trend: ordersChange >= 0 ? 'up' : 'down',
      },
      activeCustomers: {
        value: activeCustomersCount,
        change: 0, // Static for now
        trend: 'up',
      },
    };
  }

  async getRecentOrders(limit = 10) {
    const orders = await this.prisma.order.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return orders.map(order => ({
      id: order.orderNumber,
      customer: `${order.user.firstName} ${order.user.lastName}`,
      customerEmail: order.user.email,
      amount: order.totalAmount.toNumber(),
      status: order.status,
      createdAt: order.createdAt,
    }));
  }

  async getRecentActivities(limit = 10) {
    // Get recent orders for activity feed
    const recentOrders = await this.prisma.order.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    // Get low stock books
    const lowStockBooks = await this.prisma.book.findMany({
      where: { inventory: { lte: 10 } },
      take: 5,
      orderBy: { inventory: 'asc' },
    });

    // Get new users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsers = await this.prisma.user.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      take: 3,
      orderBy: { createdAt: 'desc' },
    });

    const activities = [];
    if (lowStockBooks.length > 0) {
      activities.push({
        type: 'inventory_alert',
        title: 'Inventory Alert',
        description: `${lowStockBooks.length} books are low in stock`,
        timestamp: new Date(),
        severity: 'critical',
      });
    }
    newUsers.forEach(user => {
      activities.push({
        type: 'new_user',
        title: 'New Customer',
        description: `${user.firstName} ${user.lastName} joined BookStore`,
        timestamp: user.createdAt,
        severity: 'info',
      });
    });
    recentOrders.forEach(order => {
      activities.push({
        type: 'new_order',
        title: 'New Order',
        description: `Order ${order.orderNumber} placed by ${order.user.firstName} ${order.user.lastName}`,
        timestamp: order.createdAt,
        severity: 'info',
      });
    });
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // ── User Management ────────────────────────────────────────────────────────

  async getUsers({
    page = 1,
    limit = 10,
    search,
    role,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    role?: Role;
  }) {
    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: adminUserSelect,
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      data: users.map(user => this.mapAdminUser(user)),
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

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: adminUserSelect,
    });

    if (!user) throw new NotFoundException('User not found');

    return this.mapAdminUser(user);
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const nextEmail = dto.email?.trim();

    if (nextEmail && nextEmail !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: nextEmail },
        select: { id: true },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(nextEmail !== undefined && { email: nextEmail }),
        ...(dto.firstName !== undefined && { firstName: dto.firstName.trim() }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName.trim() }),
      },
      select: adminUserSelect,
    });

    return this.mapAdminUser(updated);
  }

  async updateUserRole(id: string, dto: UpdateUserRoleDto, actorId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    if (id === actorId && dto.role !== Role.ADMIN) {
      throw new BadRequestException('You cannot remove your own admin access.');
    }

    if (user.role === Role.ADMIN && dto.role !== Role.ADMIN) {
      await this.ensureAdminAccountRemains(id);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { role: dto.role },
      select: adminUserSelect,
    });

    return this.mapAdminUser(updated);
  }

  async deleteUser(id: string, actorId: string) {
    if (id === actorId) {
      throw new BadRequestException(
        'You cannot delete your own account from the admin panel.',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
        _count: { select: { orders: true } },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    if (user._count.orders > 0) {
      throw new BadRequestException(
        'Cannot delete a user who has placed orders.',
      );
    }

    if (user.role === Role.ADMIN) {
      await this.ensureAdminAccountRemains(id);
    }

    await this.prisma.$transaction([
      this.prisma.cartItem.deleteMany({ where: { userId: id } }),
      this.prisma.favorite.deleteMany({ where: { userId: id } }),
      this.prisma.blogPost.deleteMany({ where: { authorId: id } }),
      this.prisma.userFollow.deleteMany({
        where: {
          OR: [{ followerId: id }, { followingId: id }],
        },
      }),
      this.prisma.userFriendship.deleteMany({
        where: {
          OR: [{ userOneId: id }, { userTwoId: id }],
        },
      }),
      this.prisma.user.delete({ where: { id } }),
    ]);

    return { message: 'User deleted successfully' };
  }
}
