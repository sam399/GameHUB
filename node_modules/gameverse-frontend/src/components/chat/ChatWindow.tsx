import React, { useState, useEffect, useRef } from 'react';
import { Chat, Message } from '../../types';
import { chatService } from '../../services/chatService';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

interface ChatWindowProps {
  chat: Chat | null;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chat }) => {
  const { user } = useAuth();
  const { socket, joinChat, leaveChat, typingUsers, startTyping, stopTyping, markMessagesRead } = useSocket();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chat) {
      loadMessages();
      joinChat(chat._id);
    }

    return () => {
      if (chat) {
        leaveChat(chat._id);
      }
    };
  }, [chat]);

  useEffect(() => {
    if (socket && chat) {
      const handleNewMessage = (data: { message: Message; chatId: string }) => {
        if (data.chatId === chat._id) {
          setMessages(prev => [...prev, data.message]);
        }
      };

      const handleMessageSent = (data: { messageId: string; status: string }) => {
        setMessages(prev => prev.map(m => m._id === data.messageId ? { ...m, status: data.status } : m));
      };

      const handleMessagesRead = (data: { chatId: string; userId: string }) => {
        if (data.chatId !== chat._id) return;
        setMessages(prev => prev.map(m => {
          // if reader already present, skip
          const already = (m.readBy || []).some(r => {
            const u = r.user as any;
            return (typeof u === 'string' && u === data.userId) || (typeof u === 'object' && u && (u._id === data.userId));
          });

          if (already) return m;

          // do not add read mark for messages authored by the reader
          const mSenderId = typeof m.sender === 'string' ? m.sender : (m.sender && (m.sender as any)._id);
          if (mSenderId === data.userId) return m;

          const updated = { ...m, readBy: [ ...(m.readBy || []), { user: data.userId, readAt: new Date().toISOString() } ] };
          return updated;
        }));
      };

      socket.on('new_message', handleNewMessage);
      socket.on('message_sent', handleMessageSent);
      socket.on('messages_read', handleMessagesRead);

      return () => {
        socket.off('new_message', handleNewMessage);
        socket.off('message_sent', handleMessageSent);
        socket.off('messages_read', handleMessagesRead);
      };
    }
  }, [socket, chat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!chat) return;
    
    setLoading(true);
    try {
      const response = await chatService.getChatMessages(chat._id);
      setMessages(response.data.messages);
      // Notify others that messages were read by this user
      if (markMessagesRead) markMessagesRead(chat._id);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string) => {
    if (!chat || !content.trim()) return;
    
    setSending(true);
    try {
      const response = await chatService.sendMessage(chat._id, { content });
      const newMessage = response.data.message;
      
      setMessages(prev => [...prev, newMessage]);
      
      // Emit socket event for real-time delivery
      if (socket && user) {
        socket.emit('send_message', {
          chatId: chat._id,
          message: newMessage,
          sender: user
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const getTypingUsers = () => {
    if (!chat) return [];
    
    const typingInThisChat = Array.from(typingUsers.values()).filter(
      typingUser => {
        // Check if typing user is a participant in this chat
        return chat.participants.some(participant => {
          const pid = typeof participant === 'string' ? participant : (participant as any)._id;
          return pid === typingUser.userId;
        });
      }
    );
    
    return typingInThisChat;
  };

  if (!chat) {
    return (
      <div className="chat-window empty">
        <div className="empty-state">
          <h3>Select a conversation</h3>
          <p>Choose a chat from the list to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-avatar">
            {chat.displayAvatar ? (
              <img src={chat.displayAvatar} alt={chat.displayName} />
            ) : (
              <div className="avatar-placeholder">
                {chat.displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h3 className="chat-title">{chat.displayName}</h3>
            {chat.isGroupChat && (
              <p className="chat-subtitle">
                {chat.participants.length} members
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="messages-container">
        {loading ? (
          <div className="loading-messages">
            <p>Loading messages...</p>
          </div>
        ) : (
          <>
            <div className="messages-list">
              {messages.map(message => (
                (() => {
                  const senderId = typeof message.sender === 'string' ? message.sender : (message.sender && (message.sender as any)._id);
                  return (
                    <MessageBubble
                      key={message._id}
                      message={message}
                      isOwn={senderId === user?._id}
                    />
                  );
                })()
              ))}
              
              {/* Typing indicators */}
              {getTypingUsers().map(typingUser => (
                <div key={typingUser.userId} className="typing-indicator">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="typing-text">
                    {typingUser.username} is typing...
                  </span>
                </div>
              ))}
              
              <div ref={messagesEndRef} />
            </div>
          </>
        )}
      </div>

      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={sending}
        onTypingStart={() => { if (startTyping) startTyping(chat._id); }}
        onTypingStop={() => { if (stopTyping) stopTyping(chat._id); }}
      />
    </div>
  );
};

export default ChatWindow;