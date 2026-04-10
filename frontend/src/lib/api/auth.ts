import { apiClient } from './client';
import { AuthResponse, LoginCredentials, RegisterData, User } from './types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.post('/auth/reset-password', { token, newPassword });
  },

  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    profileImage?: string;
  }): Promise<User> => {
    const response = await apiClient.patch('/auth/profile', data);
    return response.data;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    const response = await apiClient.patch('/auth/change-password', data);
    return response.data;
  },
};
