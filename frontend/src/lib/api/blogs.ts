import {
  BlogFontFamily,
  BlogPostVisibility,
  DEFAULT_BLOG_FONT_FAMILY,
  DEFAULT_BLOG_POST_VISIBILITY,
} from '@/lib/blog-posts';
import { apiClient } from './client';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  featureImage?: string | null;
  fontFamily: BlogFontFamily;
  visibility: BlogPostVisibility;
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
    return response.data.map((blog: BlogPost) => ({
      ...blog,
      featureImage: blog.featureImage ?? null,
      fontFamily: blog.fontFamily ?? DEFAULT_BLOG_FONT_FAMILY,
      visibility: blog.visibility ?? DEFAULT_BLOG_POST_VISIBILITY,
    }));
  },

  getBlog: async (id: string): Promise<BlogPost> => {
    const response = await apiClient.get(`/blogs/${id}`);
    return {
      ...response.data,
      featureImage: response.data.featureImage ?? null,
      fontFamily: response.data.fontFamily ?? DEFAULT_BLOG_FONT_FAMILY,
      visibility: response.data.visibility ?? DEFAULT_BLOG_POST_VISIBILITY,
    };
  },

  createBlog: async (data: {
    title: string;
    content: string;
    featureImage?: string | null;
    fontFamily?: BlogFontFamily;
    visibility?: BlogPostVisibility;
  }): Promise<BlogPost> => {
    const response = await apiClient.post('/blogs', {
      ...data,
      fontFamily: data.fontFamily ?? DEFAULT_BLOG_FONT_FAMILY,
      visibility: data.visibility ?? DEFAULT_BLOG_POST_VISIBILITY,
    });
    return {
      ...response.data,
      featureImage: response.data.featureImage ?? null,
      fontFamily: response.data.fontFamily ?? DEFAULT_BLOG_FONT_FAMILY,
      visibility: response.data.visibility ?? DEFAULT_BLOG_POST_VISIBILITY,
    };
  },
};
