import React from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationItem from './NotificationItem';

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { 
    notifications, 
    unreadCount, 
    markAllAsRead, 
    loadNotifications 
  } = useNotifications();

  const recentNotifications = notifications.slice(0, 5);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleViewAll = () => {
    onClose();
    // Navigate to notifications page - you'll need to implement this
    window.location.href = '/notifications';
  };

  return (
    <div className="notification-dropdown">
      <div className="dropdown-header">
        <h3>Notifications</h3>
        {unreadCount > 0 && (
          <button 
            className="mark-all-read"
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="dropdown-content">
        {recentNotifications.length === 0 ? (
          <div className="no-notifications">
            <p>No notifications</p>
            <span>You're all caught up!</span>
          </div>
        ) : (
          recentNotifications.map(notification => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onAction={onClose}
            />
          ))
        )}
      </div>

      <div className="dropdown-footer">
        <button 
          className="view-all-btn"
          onClick={handleViewAll}
        >
          View All Notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;