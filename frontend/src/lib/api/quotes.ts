import apiClient from './client';

export interface Quote {
  id: string;
  text: string;
  author: string;
  source?: string;
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const quotesApi = {
  getRandomQuote: async (): Promise<Quote> => {
    const { data } = await apiClient.get('/quotes/random');
    return data;
  },

  getAllQuotes: async (): Promise<Quote[]> => {
    const { data } = await apiClient.get('/quotes');
    return data;
  },
};
