import { api } from './client';
import type { DashboardStats, RecentOrder, RecentActivity } from './types';

export const adminApi = {
  // Get dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  // Get recent orders for dashboard
  getRecentOrders: async (limit = 10): Promise<RecentOrder[]> => {
    const response = await api.get('/admin/dashboard/recent-orders', {
      params: { limit },
    });
    return response.data;
  },

  // Get recent activities for dashboard
  getRecentActivities: async (limit = 10): Promise<RecentActivity[]> => {
    const response = await api.get('/admin/dashboard/activities', {
      params: { limit },
    });
    return response.data;
  },
};
