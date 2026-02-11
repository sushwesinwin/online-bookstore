import { apiClient } from './client';
import { Book, BookQueryParams, PaginatedResponse } from './types';

export const booksApi = {
    getBooks: async (params?: BookQueryParams): Promise<PaginatedResponse<Book>> => {
        const response = await apiClient.get('/books', { params });
        return response.data;
    },

    getBook: async (id: string): Promise<Book> => {
        const response = await apiClient.get(`/books/${id}`);
        return response.data;
    },

    getCategories: async (): Promise<string[]> => {
        const response = await apiClient.get('/books/categories');
        return response.data;
    },

    createBook: async (data: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Promise<Book> => {
        const response = await apiClient.post('/books', data);
        return response.data;
    },

    updateBook: async (id: string, data: Partial<Book>): Promise<Book> => {
        const response = await apiClient.patch(`/books/${id}`, data);
        return response.data;
    },

    deleteBook: async (id: string): Promise<void> => {
        await apiClient.delete(`/books/${id}`);
    },

    updateInventory: async (id: string, quantity: number): Promise<Book> => {
        const response = await apiClient.patch(`/books/${id}/inventory`, { quantity });
        return response.data;
    },
};
