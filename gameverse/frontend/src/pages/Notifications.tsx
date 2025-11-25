import React, { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import NotificationItem from '../components/notifications/NotificationItem';

const Notifications: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    stats, 
    loading, 
    markAllAsRead,
    deleteNotification 
  } = useNotifications();
  
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(notification => !notification.isRead)
    : notifications;

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
      alert('Failed to mark all as read. Please try again.');
    }
  };

  const handleDeleteAllRead = async () => {
    if (window.confirm('Are you sure you want to delete all read notifications?')) {
      try {
        const readNotifications = notifications.filter(notification => notification.isRead);
        for (const notification of readNotifications) {
          await deleteNotification(notification._id);
        }
      } catch (error) {
        console.error('Error deleting read notifications:', error);
        alert('Failed to delete notifications. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="loading">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Notifications</h1>
        <p>Stay updated with your gaming community activities</p>
        
        {stats && (
          <div className="notification-stats">
            <div className="stat">
              <span className="stat-number">{unreadCount}</span>
              <span className="stat-label">Unread</span>
            </div>
            <div className="stat">
              <span className="stat-number">{stats.todayCount}</span>
              <span className="stat-label">Today</span>
            </div>
            <div className="stat">
              <span className="stat-number">{stats.totalCount}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
        )}
      </div>

      <div className="notifications-actions">
        <div className="filter-tabs">
          <button 
            className={`tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({notifications.length})
          </button>
          <button 
            className={`tab ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </button>
        </div>

        <div className="bulk-actions">
          {unreadCount > 0 && (
            <button 
              className="mark-all-btn"
              onClick={handleMarkAllAsRead}
            >
              Mark All as Read
            </button>
          )}
          {notifications.some(n => n.isRead) && (
            <button 
              className="delete-read-btn"
              onClick={handleDeleteAllRead}
            >
              Delete Read
            </button>
          )}
        </div>
      </div>

      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <h3>No notifications</h3>
            <p>
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications."
                : "You don't have any notifications yet."
              }
            </p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onAction={() => {}}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;