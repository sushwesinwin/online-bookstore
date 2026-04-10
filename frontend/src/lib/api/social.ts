import { apiClient } from './client';

export interface SocialRelationshipStatus {
  userId: string;
  isFollowing: boolean;
  isFriend: boolean;
  isSelf: boolean;
}

export const socialApi = {
  getRelationshipStatuses: async (
    userIds: string[]
  ): Promise<SocialRelationshipStatus[]> => {
    if (userIds.length === 0) {
      return [];
    }

    const response = await apiClient.get('/social/relationships', {
      params: {
        userIds: userIds.join(','),
      },
    });

    return response.data;
  },

  followWriter: async (userId: string) => {
    const response = await apiClient.post(`/social/follow/${userId}`);
    return response.data;
  },

  unfollowWriter: async (userId: string) => {
    const response = await apiClient.delete(`/social/follow/${userId}`);
    return response.data;
  },

  addFriend: async (userId: string) => {
    const response = await apiClient.post(`/social/friend/${userId}`);
    return response.data;
  },

  removeFriend: async (userId: string) => {
    const response = await apiClient.delete(`/social/friend/${userId}`);
    return response.data;
  },
};
