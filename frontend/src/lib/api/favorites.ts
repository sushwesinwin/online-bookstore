import { apiClient } from './client';
import { Book } from './types';

export const favoritesApi = {
  getFavorites: async (): Promise<Book[]> => {
    const response = await apiClient.get('/favorites');
    return response.data;
  },

  addFavorite: async (bookId: string): Promise<{ message: string }> => {
    const response = await apiClient.post(`/favorites/${bookId}`);
    return response.data;
  },

  removeFavorite: async (bookId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/favorites/${bookId}`);
    return response.data;
  },
};
