import { apiClient } from './client';
import { Cart, CartItem } from './types';

export const cartApi = {
  getCart: async (): Promise<Cart> => {
    const response = await apiClient.get('/cart');
    return response.data;
  },

  addItem: async (bookId: string, quantity: number): Promise<CartItem> => {
    const response = await apiClient.post('/cart/items', { bookId, quantity });
    return response.data;
  },

  updateItem: async (itemId: string, quantity: number): Promise<CartItem> => {
    const response = await apiClient.patch(`/cart/items/${itemId}`, {
      quantity,
    });
    return response.data;
  },

  removeItem: async (itemId: string): Promise<void> => {
    await apiClient.delete(`/cart/items/${itemId}`);
  },

  clearCart: async (): Promise<void> => {
    await apiClient.delete('/cart');
  },

  validateCart: async (): Promise<{ valid: boolean; issues: string[] }> => {
    const response = await apiClient.get('/cart/validate');
    return response.data;
  },
};
