import api from './api';
import { GameTracking, LibraryStats, GamingStats, PlaySession } from '../types';

export const libraryService = {
  async getUserLibrary(filters?: {
    status?: string;
    platform?: string;
    isFavorite?: boolean;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<{ success: boolean; data: { library: GameTracking[]; stats: LibraryStats } }> {
    const response = await api.get('/library', { params: filters });
    return response.data;
  },

  async trackGame(
    gameId: string, 
    status: string = 'planning', 
    platform?: string, 
    notes?: string
  ): Promise<{ success: boolean; data: { gameTracking: GameTracking } }> {
    const response = await api.post('/library/games', { gameId, status, platform, notes });
    return response.data;
  },

  async updateGameTracking(
    gameId: string, 
    updates: {
      status?: string;
      rating?: number;
      hoursPlayed?: number;
      progress?: number;
      platform?: string;
      isFavorite?: boolean;
      notes?: string;
    }
  ): Promise<{ success: boolean; data: { gameTracking: GameTracking } }> {
    const response = await api.put(`/library/games/${gameId}`, updates);
    return response.data;
  },

  async removeFromLibrary(gameId: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/library/games/${gameId}`);
    return response.data;
  },

  async addPlaySession(
    gameId: string, 
    session: PlaySession
  ): Promise<{ success: boolean; data: { gameTracking: GameTracking } }> {
    const response = await api.post(`/library/games/${gameId}/sessions`, session);
    return response.data;
  },

  async getGameTracking(gameId: string): Promise<{ success: boolean; data: { gameTracking: GameTracking } }> {
    const response = await api.get(`/library/games/${gameId}`);
    return response.data;
  },

  async getGamingStats(): Promise<{ success: boolean; data: { stats: GamingStats } }> {
    const response = await api.get('/library/stats');
    return response.data;
  }
};