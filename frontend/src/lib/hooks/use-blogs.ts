import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { blogsApi, BlogPost } from '../api/blogs';

export function useBlogs() {
  return useQuery({
    queryKey: ['blogs'],
    queryFn: () => blogsApi.getBlogs(),
  });
}

export function useBlog(id: string) {
  return useQuery({
    queryKey: ['blogs', id],
    queryFn: () => blogsApi.getBlog(id),
    enabled: !!id,
  });
}

export function useCreateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { title: string; content: string }) =>
      blogsApi.createBlog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
}
