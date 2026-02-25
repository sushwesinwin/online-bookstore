import { apiClient } from './client';
import { Order, OrderQueryParams, PaginatedResponse } from './types';

export const ordersApi = {
    createOrder: async (items: { bookId: string; quantity: number }[]): Promise<Order> => {
        const response = await apiClient.post('/orders', { items });
        return response.data;
    },

    getOrders: async (params?: OrderQueryParams): Promise<PaginatedResponse<Order>> => {
        const response = await apiClient.get('/orders', { params });
        return response.data;
    },

    getMyOrders: async (params?: OrderQueryParams): Promise<PaginatedResponse<Order>> => {
        const response = await apiClient.get('/orders/my-orders', { params });
        return response.data;
    },

    getOrder: async (id: string): Promise<Order> => {
        const response = await apiClient.get(`/orders/${id}`);
        return response.data;
    },

    updateOrderStatus: async (id: string, status: Order['status']): Promise<Order> => {
        const response = await apiClient.patch(`/orders/${id}/status`, { status });
        return response.data;
    },

    cancelOrder: async (id: string): Promise<Order> => {
        const response = await apiClient.patch(`/orders/${id}/cancel`);
        return response.data;
    },

    createPayment: async (orderId: string): Promise<{ clientSecret: string; paymentIntentId: string }> => {
        const response = await apiClient.post(`/orders/${orderId}/payment`);
        return response.data;
    },

    getPayment: async (orderId: string): Promise<any> => {
        const response = await apiClient.get(`/orders/${orderId}/payment`);
        return response.data;
    },

    createCheckoutSession: async (): Promise<{ sessionId: string; url: string }> => {
        const response = await apiClient.post('/orders/create-checkout-session');
        return response.data;
    },

    verifySession: async (sessionId: string): Promise<{ orderId: string; orderNumber: string }> => {
        const response = await apiClient.post('/orders/verify-session', { sessionId });
        return response.data;
    },
};
