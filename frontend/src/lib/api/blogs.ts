import { apiClient } from './client';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const blogsApi = {
  getBlogs: async (): Promise<BlogPost[]> => {
    const response = await apiClient.get('/blogs');
    return response.data;
  },

  getBlog: async (id: string): Promise<BlogPost> => {
    const response = await apiClient.get(`/blogs/${id}`);
    return response.data;
  },

  createBlog: async (data: {
    title: string;
    content: string;
  }): Promise<BlogPost> => {
    const response = await apiClient.post('/blogs', data);
    return response.data;
  },
};
