import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { notificationService } from '../../services/notificationService';
import { Link } from 'react-router-dom';

const Notifications: React.FC = () => {
  const { notifications, refreshNotifications } = useSocket();
  const [open, setOpen] = useState(false);
  const [lastReadAt, setLastReadAt] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('notifications_last_read');
    if (stored) setLastReadAt(stored);
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!open) return;
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [open]);

  const unreadCount = notifications.filter(n => {
    if (!n?.timestamp) return true;
    if (!lastReadAt) return true;
    return new Date(n.timestamp) > new Date(lastReadAt);
  }).length;

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      const ts = new Date().toISOString();
      localStorage.setItem('notifications_last_read', ts);
      setLastReadAt(ts);
      // Refresh persisted notifications from server
      await refreshNotifications();
    } catch (err) {
      console.warn('Failed to mark all notifications read:', err);
      const ts = new Date().toISOString();
      localStorage.setItem('notifications_last_read', ts);
      setLastReadAt(ts);
    }
  };

  return (
    <div className="notifications" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        className="notifications-toggle"
        aria-label="Notifications"
        onClick={() => { setOpen(s => !s); if (!open) markAllRead(); }}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notifications-badge">{unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notifications-dropdown" role="menu" style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 40, width: 320, background: '#fff', border: '1px solid #ddd', borderRadius: 6, boxShadow: '0 6px 18px rgba(0,0,0,0.08)', padding: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <strong>Notifications</strong>
            <button className="mark-read" onClick={markAllRead} style={{ fontSize: 12 }}>Mark all read</button>
          </div>

          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {notifications.length === 0 && (
              <div className="empty" style={{ padding: 12 }}>No notifications</div>
            )}

            {notifications.map((n, idx) => {
              const nTime = n.timestamp ? new Date(n.timestamp) : null;
              const lastReadTime = lastReadAt ? new Date(lastReadAt) : null;
              const isUnread = !lastReadTime || (nTime && nTime > lastReadTime) || (!nTime && !lastReadTime);
              return (
                <div key={idx} className={`notification-item ${isUnread ? 'unread' : ''}`} style={{ padding: 10, borderBottom: '1px solid #f0f0f0', background: isUnread ? '#f9fbff' : 'transparent' }}>
                  <div style={{ fontSize: 13, marginBottom: 6 }}>
                    {n.type === 'friend_request:received' && (
                      <span><strong>{n.payload?.from?.username || 'Someone'}</strong> sent you a friend request</span>
                    )}
                    {n.type === 'friend_request:accepted' && (
                      <span><strong>{n.payload?.by?.username || n.payload?.of?.username || 'Someone'}</strong> is now your friend</span>
                    )}
                    {n.type === 'friend_request:cancelled' && (
                      <span><strong>{n.payload?.by?._id || 'Someone'}</strong> cancelled a friend request</span>
                    )}
                    {n.type === 'friend:removed' && (
                      <span><strong>{n.payload?.by?._id || 'Someone'}</strong> removed you as a friend</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <small style={{ color: '#666' }}>{n.timestamp ? new Date(n.timestamp).toLocaleString() : ''}</small>
                    <Link to="/friends" onClick={() => setOpen(false)}>View</Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
