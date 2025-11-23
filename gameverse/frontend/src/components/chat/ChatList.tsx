import React, { useState, useEffect } from 'react';
import { Chat } from '../../types';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../contexts/AuthContext';

interface ChatListProps {
  onSelectChat: (chat: Chat) => void;
  selectedChat?: Chat | null;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectChat, selectedChat }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const response = await chatService.getUserChats();
      setChats(response.data.chats);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLastMessage = (chat: Chat) => {
    if (!chat.lastMessage) return 'No messages yet';
    
    const message = chat.lastMessage;
    const isOwnMessage = message.sender._id === user?._id;
    const prefix = isOwnMessage ? 'You: ' : '';
    
    return prefix + message.content;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (loading) {
    return (
      <div className="chat-list loading">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="chat-item-skeleton">
            <div className="avatar-skeleton"></div>
            <div className="content-skeleton">
              <div className="name-skeleton"></div>
              <div className="message-skeleton"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h3>Messages</h3>
      </div>
      
      <div className="chat-items">
        {chats.map(chat => (
          <div
            key={chat._id}
            className={`chat-item ${selectedChat?._id === chat._id ? 'active' : ''}`}
            onClick={() => onSelectChat(chat)}
          >
            <div className="chat-avatar">
              {chat.displayAvatar ? (
                <img src={chat.displayAvatar} alt={chat.displayName} />
              ) : (
                <div className="avatar-placeholder">
                  {chat.displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="chat-info">
              <div className="chat-header">
                <h4 className="chat-name">{chat.displayName}</h4>
                {chat.lastMessage && (
                  <span className="chat-time">
                    {formatTime(chat.lastMessage.createdAt)}
                  </span>
                )}
              </div>
              
              <p className="chat-last-message">
                {formatLastMessage(chat)}
              </p>
              
              {chat.isGroupChat && (
                <div className="chat-meta">
                  <span className="group-badge">Group</span>
                  <span className="participant-count">
                    {chat.participants.length} members
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {chats.length === 0 && (
        <div className="no-chats">
          <p>No conversations yet</p>
          <p className="subtext">Start a new conversation to see it here</p>
        </div>
      )}
    </div>
  );
};

export default ChatList;