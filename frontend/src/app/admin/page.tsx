'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  BookOpen,
  ShoppingCart,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  MoreHorizontal,
  Plus,
  ArrowRight,
  AlertCircle as AlertCircleIcon,
  UserPlus as UserPlusIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { adminApi } from '@/lib/api/admin';
import type { RecentActivity } from '@/lib/api/types';

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch dashboard data
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: adminApi.getDashboardStats,
    enabled: mounted,
  });

  const { data: recentOrdersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin', 'dashboard', 'recent-orders'],
    queryFn: () => adminApi.getRecentOrders(4),
    enabled: mounted,
  });

  const { data: recentActivitiesData, isLoading: activitiesLoading } = useQuery({
    queryKey: ['admin', 'dashboard', 'activities'],
    queryFn: () => adminApi.getRecentActivities(4),
    enabled: mounted,
  });

  if (!mounted) return null;

  // Transform stats data for UI
  const stats = dashboardStats
    ? [
        {
          name: 'Total Revenue',
          value: `$${dashboardStats.totalRevenue.value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          change: `${dashboardStats.totalRevenue.change >= 0 ? '+' : ''}${dashboardStats.totalRevenue.change.toFixed(1)}%`,
          trend: dashboardStats.totalRevenue.trend,
          icon: TrendingUp,
          color: '#17BD8D',
        },
        {
          name: 'Books in Catalog',
          value: dashboardStats.booksInCatalog.value.toLocaleString(),
          change: `${dashboardStats.booksInCatalog.value} total`,
          trend: dashboardStats.booksInCatalog.trend,
          icon: BookOpen,
          color: '#0B7C6B',
        },
        {
          name: 'Total Orders',
          value: dashboardStats.totalOrders.value.toLocaleString(),
          change: `${dashboardStats.totalOrders.change >= 0 ? '+' : ''}${dashboardStats.totalOrders.change.toFixed(1)}%`,
          trend: dashboardStats.totalOrders.trend,
          icon: ShoppingCart,
          color: '#F9B959',
        },
        {
          name: 'Active Customers',
          value: dashboardStats.activeCustomers.value.toLocaleString(),
          change: `${dashboardStats.activeCustomers.value} total`,
          trend: dashboardStats.activeCustomers.trend,
          icon: Users,
          color: '#101313',
        },
      ]
    : [];

  const quickActions = [
    { name: 'Add New Book', icon: Plus, href: '/admin/books/new', color: '#0B7C6B' },
    { name: 'Manage Orders', icon: ShoppingCart, href: '/admin/orders', color: '#F9B959' },
    { name: 'View Customers', icon: Users, href: '/admin/users', color: '#101313' },
  ];

  // Format relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  return (
    <div className="space-y-12">
      {/* Header with Greeting and Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#101313]">
            Welcome back, {user?.firstName || 'Admin'}
          </h1>
          <p className="mt-2 text-lg text-[#848785] font-medium">
            Here&apos;s a quick overview of your bookstore performance today.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {quickActions.map(action => (
            <Link key={action.name} href={action.href}>
              <Button
                variant="outline"
                className="rounded-xl border-[#E4E9E8] hover:bg-[#F3F5F5] font-semibold gap-2"
              >
                <action.icon className="h-4 w-4" style={{ color: action.color }} />
                <span className="hidden sm:inline">{action.name}</span>
                <span className="sm:hidden">{action.name.split(' ').slice(-1)}</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-3xl border border-[#E4E9E8] bg-white p-8 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="h-14 w-14 rounded-2xl bg-[#F3F5F5] animate-pulse" />
                <div className="h-6 w-16 rounded-full bg-[#F3F5F5] animate-pulse" />
              </div>
              <div className="mt-6 space-y-2">
                <div className="h-4 w-24 bg-[#F3F5F5] animate-pulse rounded" />
                <div className="h-9 w-32 bg-[#F3F5F5] animate-pulse rounded" />
              </div>
            </div>
          ))
        ) : (
          stats.map(stat => (
            <div
              key={stat.name}
              className="group relative overflow-hidden rounded-3xl border border-[#E4E9E8] bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: `${stat.color}10`,
                    color: stat.color,
                  }}
                >
                  <stat.icon className="h-7 w-7" />
                </div>
                <div
                  className={`flex items-center px-2 py-1 rounded-full text-xs font-bold ${stat.trend === 'up'
                    ? 'bg-[#DFFEF5] text-[#17BD8D]'
                    : 'bg-[#FFECEB] text-[#FF4E3E]'
                    }`}
                >
                  {stat.change}
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="ml-0.5 h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="ml-0.5 h-3 w-3" />
                  )}
                </div>
              </div>
              <div className="mt-6">
                <p className="text-sm font-bold text-[#848785] uppercase tracking-wider">
                  {stat.name}
                </p>
                <h3 className="text-3xl font-black text-[#101313] mt-1">
                  {stat.value}
                </h3>
              </div>

              {/* Subtle background pattern element */}
              <div
                className="absolute -right-4 -bottom-4 h-32 w-32 opacity-[0.03] rotate-12 transition-transform group-hover:rotate-0"
                style={{ color: stat.color }}
              >
                <stat.icon className="h-full w-full" />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#101313] flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-[#F9B959]" />
              Recent Orders
            </h2>
            <Link href="/admin/orders" className="group flex items-center gap-1.5 text-sm font-bold text-[#0B7C6B] hover:text-[#096355]">
              View all orders
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="overflow-hidden rounded-3xl border border-[#E4E9E8] bg-white shadow-sm overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E4E9E8] bg-[#F8FAFB]">
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-[#848785]">
                    Order Details
                  </th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-[#848785]">
                    Amount
                  </th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-[#848785]">
                    Status
                  </th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-[#848785]">

                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E9E8]">
                {ordersLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="transition-colors">
                      <td className="px-8 py-6">
                        <div className="space-y-2">
                          <div className="h-5 w-40 bg-[#F3F5F5] animate-pulse rounded" />
                          <div className="h-4 w-32 bg-[#F3F5F5] animate-pulse rounded" />
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="h-5 w-20 bg-[#F3F5F5] animate-pulse rounded" />
                      </td>
                      <td className="px-8 py-6">
                        <div className="h-6 w-24 bg-[#F3F5F5] animate-pulse rounded-full" />
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="h-9 w-9 bg-[#F3F5F5] animate-pulse rounded-xl ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : recentOrdersData && recentOrdersData.length > 0 ? (
                  recentOrdersData.map(order => (
                    <tr
                      key={order.id}
                      className="group transition-colors hover:bg-[#F8FAFB]/50"
                    >
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#101313] group-hover:text-[#0B7C6B] transition-colors">
                            {order.id}
                          </span>
                          <div className="flex items-center gap-2 mt-1 text-sm text-[#848785]">
                            <span>{order.customer}</span>
                            <span className="h-1 w-1 rounded-full bg-[#E4E9E8]" />
                            <span>{getRelativeTime(order.createdAt)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-black text-[#101313]">
                        ${order.amount.toFixed(2)}
                      </td>
                      <td className="px-8 py-6">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                            order.status === 'DELIVERED'
                              ? 'bg-[#DFFEF5] text-[#17BD8D]'
                              : order.status === 'SHIPPED'
                                ? 'bg-[#E4F4FF] text-[#0066FF]'
                                : order.status === 'CONFIRMED'
                                  ? 'bg-[#FFF5E6] text-[#F9B959]'
                                  : order.status === 'PENDING'
                                    ? 'bg-[#FFF5E6] text-[#F9B959]'
                                    : 'bg-[#FFECEB] text-[#FF4E3E]'
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Link href={`/admin/orders?search=${order.id}`}>
                          <button className="p-2 rounded-xl text-[#848785] hover:text-[#101313] hover:bg-[#F3F5F5] transition-all">
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-[#848785]">
                      No recent orders
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notifications/Recent Activities */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-[#101313] flex items-center gap-2">
            <BellIcon className="h-6 w-6 text-[#FF4E3E]" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            {activitiesLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex space-x-4 rounded-3xl border border-[#E4E9E8] bg-white p-5 shadow-sm"
                >
                  <div className="h-10 w-10 rounded-xl bg-[#F3F5F5] animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-[#F3F5F5] animate-pulse rounded" />
                    <div className="h-3 w-48 bg-[#F3F5F5] animate-pulse rounded" />
                  </div>
                </div>
              ))
            ) : recentActivitiesData && recentActivitiesData.length > 0 ? (
              recentActivitiesData.map((activity, i) => {
                const iconMap: Record<RecentActivity['type'], typeof AlertCircleIcon> = {
                  inventory_alert: AlertCircleIcon,
                  new_user: UserPlusIcon,
                  new_order: ShoppingCart,
                  system: CheckCircleIcon,
                };
                const colorMap: Record<RecentActivity['severity'], string> = {
                  critical: '#FF4E3E',
                  warning: '#F9B959',
                  info: '#0066FF',
                  success: '#17BD8D',
                };
                const ActivityIcon = iconMap[activity.type] || CheckCircleIcon;
                const color = colorMap[activity.severity] || '#101313';

                return (
                  <div
                    key={i}
                    className="group flex space-x-4 rounded-3xl border border-[#E4E9E8] bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-[#0B7C6B]/20"
                  >
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${color}15`, color }}
                    >
                      <ActivityIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-[#101313] truncate">
                          {activity.title}
                        </p>
                        <span className="text-[10px] font-medium text-[#A6AAA9] flex-shrink-0">
                          {getRelativeTime(activity.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-[#848785] mt-0.5 line-clamp-1">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-[#848785]">
                No recent activities
              </div>
            )}
          </div>
          <Button variant="ghost" className="w-full rounded-2xl border-[#E4E9E8] border h-12 text-[#848785] hover:text-[#101313] font-bold">
            View All Activity
          </Button>
        </div>
      </div>
    </div>
  );
}

// Internal icons for Activity to avoid missing imports in this specific mock UI
function BellIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

