import api from './api';
import { ReviewsResponse, Review, ReviewStats, CreateReviewData, ReviewReaction } from '../types';

export const reviewService = {
  async getGameReviews(
    gameId: string, 
    page: number = 1, 
    limit: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: string = 'desc'
  ): Promise<ReviewsResponse> {
    const response = await api.get(`/reviews/games/${gameId}/reviews`, {
      params: { page, limit, sortBy, sortOrder }
    });
    return response.data;
  },

  async getUserReviews(): Promise<{ success: boolean; data: { reviews: Review[] } }> {
    const response = await api.get('/reviews/user');
    return response.data;
  },

  async createReview(gameId: string, reviewData: CreateReviewData): Promise<{ success: boolean; data: { review: Review } }> {
    const response = await api.post(`/reviews/games/${gameId}/reviews`, reviewData);
    return response.data;
  },

  async updateReview(reviewId: string, reviewData: Partial<CreateReviewData>): Promise<{ success: boolean; data: { review: Review } }> {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  async deleteReview(reviewId: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  async reactToReview(reviewId: string, reaction: 'like' | 'dislike'): Promise<{ success: boolean; data: ReviewReaction }> {
    const response = await api.post(`/reviews/${reviewId}/react`, { reaction });
    return response.data;
  },

  async getReviewStats(gameId: string): Promise<{ success: boolean; data: ReviewStats }> {
    const response = await api.get(`/reviews/games/${gameId}/reviews/stats`);
    return response.data;
  }
};