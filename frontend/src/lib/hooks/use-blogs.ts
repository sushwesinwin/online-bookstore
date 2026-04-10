import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogsApi } from '@/lib/api/blogs';
import { BlogFontFamily, BlogPostVisibility } from '@/lib/blog-posts';

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
    mutationFn: (data: {
      title: string;
      content: string;
      featureImage?: string | null;
      fontFamily?: BlogFontFamily;
      visibility?: BlogPostVisibility;
    }) => blogsApi.createBlog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
}
