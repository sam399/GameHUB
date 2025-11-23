import api from './api';
import { Chat, Message, MessagesResponse, CreateMessageData, User } from '../types';

export const chatService = {
  // Chats
  async getUserChats(): Promise<{ success: boolean; data: { chats: Chat[] } }> {
    const response = await api.get('/chats');
    return response.data;
  },

  async getOrCreateOneOnOneChat(participantId: string): Promise<{ success: boolean; data: { chat: Chat } }> {
    const response = await api.post('/chats/one-on-one', { participantId });
    return response.data;
  },

  async createGroupChat(name: string, participants: string[]): Promise<{ success: boolean; data: { chat: Chat } }> {
    const response = await api.post('/chats/group', { name, participants });
    return response.data;
  },

  async searchUsers(query: string): Promise<{ success: boolean; data: { users: User[] } }> {
    const response = await api.get('/chats/search-users', { params: { q: query } });
    return response.data;
  },

  // Messages
  async getChatMessages(
    chatId: string, 
    page: number = 1, 
    limit: number = 50
  ): Promise<MessagesResponse> {
    const response = await api.get(`/chats/${chatId}/messages`, {
      params: { page, limit }
    });
    return response.data;
  },

  async sendMessage(chatId: string, messageData: CreateMessageData): Promise<{ success: boolean; data: { message: Message } }> {
    const response = await api.post(`/chats/${chatId}/messages`, messageData);
    return response.data;
  },

  async updateMessage(messageId: string, content: string): Promise<{ success: boolean; data: { message: Message } }> {
    const response = await api.put(`/chats/messages/${messageId}`, { content });
    return response.data;
  },

  async deleteMessage(messageId: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/chats/messages/${messageId}`);
    return response.data;
  }
};