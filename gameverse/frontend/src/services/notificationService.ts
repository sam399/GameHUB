import api from './api';
import { NotificationsResponse, NotificationStats } from '../types';

// Returns the full Axios response so callers can access `response.data` consistently
export const notificationService = {
  async getNotifications(
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false
  ): Promise<any> {
    const response = await api.get('/notifications', {
      params: { page, limit, unreadOnly }
    });
    return response; // callers expect response.data
  },

  async markAsRead(notificationId: string): Promise<any> {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response;
  },

  async markAllAsRead(): Promise<any> {
    const response = await api.put('/notifications/read-all');
    return response;
  },

  async deleteNotification(notificationId: string): Promise<any> {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response;
  },

  async getStats(): Promise<any> {
    const response = await api.get('/notifications/stats');
    return response;
  }
};

export default notificationService;