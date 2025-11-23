import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../../contexts/SocketContext';

interface ToastItem {
  id: string;
  title: string;
  message?: string;
}

const Toasts: React.FC = () => {
  const { notifications } = useSocket();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const shownIds = useRef<Set<string>>(new Set());

  // when notifications change, show the newest one as a toast
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;
    const newest = notifications[0];
    const id = newest._id || newest.timestamp || `${Date.now()}`;
    if (shownIds.current.has(id)) return; // already shown

    const titleMap: Record<string, string> = {
      'friend_request:received': 'New Friend Request',
      'friend_request:accepted': 'Friend Request Accepted',
      'friend_request:cancelled': 'Friend Request Cancelled',
      'friend:removed': 'Removed as Friend'
    };

    const title = titleMap[newest.type] || 'Notification';
    const message = newest.type === 'friend_request:received'
      ? `${newest.payload?.from?.username || 'Someone'} sent you a friend request`
      : newest.type === 'friend_request:accepted'
      ? `${newest.payload?.by?.username || newest.payload?.of?.username || 'Someone'} is now your friend`
      : '';

    const toast: ToastItem = { id, title, message };
    shownIds.current.add(id);
    setToasts(prev => [toast, ...prev]);

    const timer = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);

    return () => clearTimeout(timer);
  }, [notifications]);

  return (
    <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 60, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} className="toast-item" style={{ minWidth: 260, background: '#111827', color: '#fff', padding: '12px 14px', borderRadius: 8, boxShadow: '0 8px 24px rgba(2,6,23,0.4)', transform: 'translateY(0)', transition: 'transform 220ms ease, opacity 220ms ease' }}>
          <div style={{ fontWeight: 600 }}>{t.title}</div>
          {t.message && <div style={{ fontSize: 13, opacity: 0.9 }}>{t.message}</div>}
        </div>
      ))}
    </div>
  );
};

export default Toasts;
