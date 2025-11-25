import React from 'react';
import { Notification } from '../../types';
import { useNotifications } from '../../contexts/NotificationContext';

interface NotificationItemProps {
  notification: Notification;
  onAction: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onAction }) => {
  const { markAsRead } = useNotifications();

  const handleClick = async () => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification._id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    handleNotificationAction();
    onAction();
  };

  const handleNotificationAction = () => {
    // Handle different notification types
    switch (notification.type) {
      case 'friend_request':
        // Navigate to friends page or open friend requests
        window.location.href = '/friends?tab=requests';
        break;
      case 'new_message':
        if (notification.data.chatId) {
          // Navigate to chat
          window.location.href = `/chat?chat=${notification.data.chatId}`;
        }
        break;
      case 'forum_reply':
        if (notification.data.threadId) {
          // Navigate to forum thread
          window.location.href = `/forum/thread/${notification.data.threadId}`;
        }
        break;
      case 'game_recommendation':
        if (notification.data.gameId) {
          // Navigate to game details
          window.location.href = `/games/${notification.data.gameId}`;
        }
        break;
      default:
        // Default action - do nothing or navigate to notifications page
        window.location.href = '/notifications';
    }
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'friend_request':
      case 'friend_request_accepted':
        return '👤';
      case 'new_message':
        return '💬';
      case 'forum_reply':
      case 'forum_mention':
        return '💭';
      case 'game_recommendation':
        return '🎮';
      case 'event_reminder':
        return '📅';
      case 'system_alert':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div 
      className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
      onClick={handleClick}
    >
      <div className="notification-icon">
        {getNotificationIcon()}
      </div>
      
      <div className="notification-content">
        <div className="notification-header">
          <h4 className="notification-title">{notification.title}</h4>
          <span className="notification-time">
            {formatTime(notification.createdAt)}
          </span>
        </div>
        
        <p className="notification-message">{notification.message}</p>
        
        {notification.data.senderId && (
          <div className="notification-sender">
            <div className="sender-avatar">
              {notification.data.senderId.profile.avatar ? (
                <img 
                  src={notification.data.senderId.profile.avatar} 
                  alt={notification.data.senderId.username} 
                />
              ) : (
                <div className="avatar-placeholder">
                  {notification.data.senderId.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="sender-name">{notification.data.senderId.username}</span>
          </div>
        )}
      </div>

      {!notification.isRead && (
        <div className="unread-indicator"></div>
      )}
    </div>
  );
};

export default NotificationItem;