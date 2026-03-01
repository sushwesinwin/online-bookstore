import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    // Get total revenue from completed orders
    const revenueData = await this.prisma.order.aggregate({
      where: {
        status: {
          in: [OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.DELIVERED],
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
          in: [OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.DELIVERED],
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

    return orders.map((order) => ({
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
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Get low stock books
    const lowStockBooks = await this.prisma.book.findMany({
      where: {
        inventory: {
          lte: 10,
        },
      },
      take: 5,
      orderBy: {
        inventory: 'asc',
      },
    });

    // Get new users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newUsers = await this.prisma.user.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      take: 3,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const activities = [];

    // Add low stock alerts
    if (lowStockBooks.length > 0) {
      activities.push({
        type: 'inventory_alert',
        title: 'Inventory Alert',
        description: `${lowStockBooks.length} books are low in stock`,
        timestamp: new Date(),
        severity: 'critical',
      });
    }

    // Add new users
    newUsers.forEach((user) => {
      activities.push({
        type: 'new_user',
        title: 'New Customer',
        description: `${user.firstName} ${user.lastName} joined BookStore`,
        timestamp: user.createdAt,
        severity: 'info',
      });
    });

    // Add recent orders
    recentOrders.forEach((order) => {
      activities.push({
        type: 'new_order',
        title: 'New Order',
        description: `Order ${order.orderNumber} placed by ${order.user.firstName} ${order.user.lastName}`,
        timestamp: order.createdAt,
        severity: 'info',
      });
    });

    // Sort by timestamp and limit
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}
