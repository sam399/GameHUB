import api from './api';
import {
  ForumCategory,
  ForumThread,
  ForumPost,
  ForumThreadsResponse,
  ForumThreadResponse,
  CreateThreadData,
  CreatePostData
} from '../types';

export const forumService = {
  // Categories
  async getCategories(): Promise<{ success: boolean; data: { categories: ForumCategory[] } }> {
    const response = await api.get('/forum/categories');
    return response.data;
  },

  // Threads
  async getThreadsByCategory(
    categoryId: string,
    page: number = 1,
    limit: number = 20,
    sortBy: string = 'lastPost.date',
    sortOrder: string = 'desc'
  ): Promise<ForumThreadsResponse> {
    const response = await api.get(`/forum/categories/${categoryId}/threads`, {
      params: { page, limit, sortBy, sortOrder }
    });
    return response.data;
  },

  async getThread(
    threadId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ForumThreadResponse> {
    const response = await api.get(`/forum/threads/${threadId}`, {
      params: { page, limit }
    });
    return response.data;
  },

  async createThread(categoryId: string, threadData: CreateThreadData): Promise<{ success: boolean; data: { thread: ForumThread } }> {
    const response = await api.post(`/forum/categories/${categoryId}/threads`, threadData);
    return response.data;
  },

  // Posts
  async createPost(threadId: string, postData: CreatePostData): Promise<{ success: boolean; data: { post: ForumPost } }> {
    const response = await api.post(`/forum/threads/${threadId}/posts`, postData);
    return response.data;
  },

  async updatePost(postId: string, content: string): Promise<{ success: boolean; data: { post: ForumPost } }> {
    const response = await api.put(`/forum/posts/${postId}`, { content });
    return response.data;
  },

  async deletePost(postId: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/forum/posts/${postId}`);
    return response.data;
  },

  async likePost(postId: string): Promise<{ success: boolean; data: { likes: number; hasLiked: boolean } }> {
    const response = await api.post(`/forum/posts/${postId}/like`);
    return response.data;
  },

  // Search
  async searchThreads(query: string, page: number = 1, limit: number = 20): Promise<ForumThreadsResponse> {
    const response = await api.get('/forum/search', {
      params: { q: query, page, limit }
    });
    return response.data;
  }
};