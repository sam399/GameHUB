import api from './api';
import { GamesResponse, Game, GameFilters } from '../types';

export const gameService = {
  async getGames(filters: GameFilters = {}): Promise<GamesResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/games?${params}`);
    return response.data;
  },

  async getGame(id: string): Promise<{ success: boolean; data: { game: Game } }> {
    const response = await api.get(`/games/${id}`);
    return response.data;
  },

  async getFeaturedGames(): Promise<{ success: boolean; data: { games: Game[] } }> {
    const response = await api.get('/games/featured');
    return response.data;
  },

  async getGamesByGenre(genre: string): Promise<{ success: boolean; data: { games: Game[] } }> {
    const response = await api.get(`/games/genre/${genre}`);
    return response.data;
  }
};