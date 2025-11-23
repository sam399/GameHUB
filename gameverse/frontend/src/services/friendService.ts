import api from './api';
import {
  FriendsResponse,
  FriendRequestsResponse,
  UsersSearchResponse,
  FriendSuggestionsResponse
} from '../types';

export const friendService = {
  // Friends
  async getFriends(): Promise<FriendsResponse> {
    const response = await api.get('/friends');
    return response.data;
  },

  async removeFriend(friendId: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/friends/${friendId}`);
    return response.data;
  },

  // Friend Requests
  async getFriendRequests(): Promise<FriendRequestsResponse> {
    const response = await api.get('/friends/requests');
    return response.data;
  },

  async sendFriendRequest(toUserId: string): Promise<{ success: boolean }> {
    const response = await api.post('/friends/requests', { toUserId });
    return response.data;
  },

  async acceptFriendRequest(requestId: string): Promise<{ success: boolean }> {
    const response = await api.put(`/friends/requests/${requestId}/accept`);
    return response.data;
  },

  async rejectFriendRequest(requestId: string): Promise<{ success: boolean }> {
    const response = await api.put(`/friends/requests/${requestId}/reject`);
    return response.data;
  },

  async cancelFriendRequest(requestId: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/friends/requests/${requestId}`);
    return response.data;
  },

  // Search and Suggestions
  async searchUsers(query: string, page: number = 1, limit: number = 20): Promise<UsersSearchResponse> {
    const response = await api.get('/friends/search', {
      params: { q: query, page, limit }
    });
    return response.data;
  },

  async getFriendSuggestions(): Promise<FriendSuggestionsResponse> {
    const response = await api.get('/friends/suggestions');
    return response.data;
  }
};