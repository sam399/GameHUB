import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Notification, NotificationStats } from '../types';
import { notificationService } from '../services/notificationService';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  stats: NotificationStats | null;
  loading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  loadNotifications: () => Promise<void>;
  loadStats: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadNotifications();
      loadStats();
    }
  }, [user]);

  useEffect(() => {
    if (socket && user) {
      const handleNewNotification = (data: { notification: Notification }) => {
        setNotifications(prev => [data.notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        loadStats(); // Refresh stats
      };

      const handleNotificationRead = (data: { notificationId: string }) => {
        setNotifications(prev =>
          prev.map(notification =>
            notification._id === data.notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      };

      const handleAllNotificationsRead = () => {
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, isRead: true }))
        );
        setUnreadCount(0);
      };

      socket.on('new_notification', handleNewNotification);
      socket.on('notification_read', handleNotificationRead);
      socket.on('all_notifications_read', handleAllNotificationsRead);

      return () => {
        socket.off('new_notification', handleNewNotification);
        socket.off('notification_read', handleNotificationRead);
        socket.off('all_notifications_read', handleAllNotificationsRead);
      };
    }
  }, [socket, user]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getNotifications();
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await notificationService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading notification stats:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Socket will handle the UI update
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      // Socket will handle the UI update
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notification => notification._id !== notificationId));
      loadStats(); // Refresh stats
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    stats,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadNotifications,
    loadStats
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};