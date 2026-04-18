import { apiClient } from './client';
import type {
  AdminUser,
  AdminUserDetails,
  DashboardStats,
  RecentOrder,
  RecentActivity,
  PaginatedResponse,
  UpdateAdminUserData,
} from './types';

export const adminApi = {
  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data;
  },

  getRecentOrders: async (limit = 10): Promise<RecentOrder[]> => {
    const response = await apiClient.get('/admin/dashboard/recent-orders', {
      params: { limit },
    });
    return response.data;
  },

  getRecentActivities: async (limit = 10): Promise<RecentActivity[]> => {
    const response = await apiClient.get('/admin/dashboard/activities', {
      params: { limit },
    });
    return response.data;
  },

  // User Management
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: 'USER' | 'ADMIN';
  }): Promise<PaginatedResponse<AdminUser>> => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },

  getUserById: async (id: string): Promise<AdminUserDetails> => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  },

  updateUser: async (
    id: string,
    data: UpdateAdminUserData
  ): Promise<AdminUser> => {
    const response = await apiClient.patch(`/admin/users/${id}`, data);
    return response.data;
  },

  updateUserRole: async (
    id: string,
    role: 'USER' | 'ADMIN'
  ): Promise<AdminUser> => {
    const response = await apiClient.patch(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  deleteUser: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  },
};
