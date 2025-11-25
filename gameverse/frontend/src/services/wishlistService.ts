import api from './api';
import { Wishlist } from '../types';

export const wishlistService = {
  async getWishlist(): Promise<{ success: boolean; data: { wishlist: Wishlist } }> {
    const response = await api.get('/wishlist');
    return response.data;
  },

  async addToWishlist(
    gameId: string, 
    priority: 'low' | 'medium' | 'high' = 'medium', 
    notes: string = ''
  ): Promise<{ success: boolean; data: { wishlist: Wishlist } }> {
    const response = await api.post('/wishlist/games', { gameId, priority, notes });
    return response.data;
  },

  async removeFromWishlist(gameId: string): Promise<{ success: boolean; data: { wishlist: Wishlist } }> {
    const response = await api.delete(`/wishlist/games/${gameId}`);
    return response.data;
  },

  async updateWishlistItem(
    gameId: string, 
    updates: { priority?: string; notes?: string; priceAlert?: any }
  ): Promise<{ success: boolean; data: { wishlist: Wishlist } }> {
    const response = await api.put(`/wishlist/games/${gameId}`, updates);
    return response.data;
  },

  async togglePrivacy(isPublic: boolean): Promise<{ success: boolean; data: { isPublic: boolean } }> {
    const response = await api.put('/wishlist/privacy', { isPublic });
    return response.data;
  },

  async getPublicWishlist(userId: string): Promise<{ success: boolean; data: { wishlist: Wishlist } }> {
    const response = await api.get(`/wishlist/user/${userId}`);
    return response.data;
  },

  async checkGameInWishlist(gameId: string): Promise<{ success: boolean; data: { inWishlist: boolean } }> {
    const response = await api.get(`/wishlist/check/${gameId}`);
    return response.data;
  }
};