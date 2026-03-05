import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { favoritesApi } from '../api/favorites';

export function useFavorites(enabled: boolean = true) {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesApi.getFavorites(),
    enabled,
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookId: string) => favoritesApi.addFavorite(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success('Added to favorites!');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to add to favorites'
      );
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookId: string) => favoritesApi.removeFavorite(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success('Removed from favorites!');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to remove from favorites'
      );
    },
  });
}
