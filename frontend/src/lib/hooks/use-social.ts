import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { socialApi } from '@/lib/api/social';

function getRelationshipQueryKey(userIds: string[]) {
  return ['social', 'relationships', [...userIds].sort().join(',')];
}

export function useRelationshipStatuses(userIds: string[], enabled: boolean) {
  return useQuery({
    queryKey: getRelationshipQueryKey(userIds),
    queryFn: () => socialApi.getRelationshipStatuses(userIds),
    enabled: enabled && userIds.length > 0,
  });
}

export function useFollowWriter(userIdsToRefresh: string[]) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => socialApi.followWriter(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getRelationshipQueryKey(userIdsToRefresh),
      });
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast.success('Writer followed');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to follow writer');
    },
  });
}

export function useUnfollowWriter(userIdsToRefresh: string[]) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => socialApi.unfollowWriter(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getRelationshipQueryKey(userIdsToRefresh),
      });
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast.success('Writer unfollowed');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to unfollow writer'
      );
    },
  });
}

export function useAddFriend(userIdsToRefresh: string[]) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => socialApi.addFriend(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getRelationshipQueryKey(userIdsToRefresh),
      });
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast.success('Writer added as friend');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add friend');
    },
  });
}

export function useRemoveFriend(userIdsToRefresh: string[]) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => socialApi.removeFriend(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getRelationshipQueryKey(userIdsToRefresh),
      });
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast.success('Writer removed from friends');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to remove friend');
    },
  });
}
