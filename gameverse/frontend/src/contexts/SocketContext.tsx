import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { Message, TypingUser } from '../types';
import { notificationService } from '../services/notificationService';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  typingUsers: Map<string, TypingUser>;
  notifications: Array<{ type: string; payload: any; timestamp?: string; _id?: string; read?: boolean }>;
  refreshNotifications: () => Promise<void>;
  sendMessage: (chatId: string, message: Message) => void;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  startTyping: (chatId: string) => void;
  stopTyping: (chatId: string) => void;
  markMessagesRead: (chatId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map());
  const [notifications, setNotifications] = useState<Array<{ type: string; payload: any; timestamp?: string; _id?: string; read?: boolean }>>([]);

  const refreshNotifications = async () => {
    try {
      const resp = await notificationService.getNotifications();
      const list = resp?.notifications || resp?.data?.notifications || resp;
      setNotifications((list || []).map((n: any) => ({ ...n })));
    } catch (err) {
      console.warn('Failed to refresh notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      // Vite exposes env vars on import.meta.env (VITE_ prefix). Fallback to localhost:5000.
      const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
      const newSocket = io(apiUrl, {
        transports: ['websocket']
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
        
        // Register user with socket server
        newSocket.emit('user_connected', user._id);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    }
  }, [user]);

  // Typing indicators handler
  useEffect(() => {
    if (!socket) return;

    const handleUserTyping = (data: { userId: string; isTyping: boolean }) => {
      setTypingUsers(prev => {
        const newTypingUsers = new Map(prev);
        
        if (data.isTyping) {
          newTypingUsers.set(data.userId, {
            userId: data.userId,
            isTyping: true,
            username: 'User' // This would need to be populated from user data
          });
        } else {
          newTypingUsers.delete(data.userId);
        }
        
        return newTypingUsers;
      });
    };

    socket.on('user_typing', handleUserTyping);

    // Friend / social notifications: fetch persisted notifications when events happen
    const handleFriendRequest = (data: any) => {
      refreshNotifications();
      console.log('Friend request received via socket', data);
    };

    const handleFriendAccepted = (data: any) => {
      refreshNotifications();
      console.log('Friend request accepted via socket', data);
    };

    const handleFriendCancelled = (data: any) => {
      refreshNotifications();
      console.log('Friend request cancelled via socket', data);
    };

    const handleFriendRemoved = (data: any) => {
      refreshNotifications();
      console.log('Friend removed via socket', data);
    };

    socket.on('friend_request:received', handleFriendRequest);
    socket.on('friend_request:accepted', handleFriendAccepted);
    socket.on('friend_request:cancelled', handleFriendCancelled);
    socket.on('friend:removed', handleFriendRemoved);

    return () => {
      socket.off('user_typing', handleUserTyping);
      socket.off('friend_request:received', handleFriendRequest);
      socket.off('friend_request:accepted', handleFriendAccepted);
      socket.off('friend_request:cancelled', handleFriendCancelled);
      socket.off('friend:removed', handleFriendRemoved);
    };
  }, [socket]);

  const sendMessage = (chatId: string, message: Message) => {
    if (socket && user) {
      socket.emit('send_message', {
        chatId,
        message,
        sender: user
      });
    }
  };

  const joinChat = (chatId: string) => {
    if (socket) {
      socket.emit('join_chat', chatId);
    }
  };

  const leaveChat = (chatId: string) => {
    if (socket) {
      socket.emit('leave_chat', chatId);
    }
  };

  const startTyping = (chatId: string) => {
    if (socket && user) {
      socket.emit('typing_start', {
        chatId,
        userId: user._id
      });
    }
  };

  const stopTyping = (chatId: string) => {
    if (socket && user) {
      socket.emit('typing_stop', {
        chatId,
        userId: user._id
      });
    }
  };

  const markMessagesRead = (chatId: string) => {
    if (socket && user) {
      socket.emit('mark_messages_read', {
        chatId,
        userId: user._id
      });
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    typingUsers,
    notifications,
    refreshNotifications,
    sendMessage,
    joinChat,
    leaveChat,
    startTyping,
    stopTyping,
    markMessagesRead
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};