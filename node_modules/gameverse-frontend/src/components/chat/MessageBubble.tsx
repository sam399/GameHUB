import React from 'react';
import { Message } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const { user } = useAuth();

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hasRead = message.readBy.some(read => 
    read.user && typeof read.user === 'object' && read.user._id !== user?._id
  );

  return (
    <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
      {!isOwn && (
        <div className="message-sender">
          {message.sender.username}
        </div>
      )}
      
      <div className="message-content">
        {message.replyTo && (
          <div className="message-reply">
            <div className="reply-content">
              <strong>
                {message.replyTo.sender._id === user?._id ? 'You' : message.replyTo.sender.username}:
              </strong>
              <span>{message.replyTo.content}</span>
            </div>
          </div>
        )}
        
        <div className="message-text">
          {message.content}
        </div>
        
        <div className="message-meta">
          <span className="message-time">
            {formatTime(message.createdAt)}
          </span>
          {message.isEdited && (
            <span className="message-edited">(edited)</span>
          )}
          {isOwn && hasRead && (
            <span className="message-read">✓✓</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;