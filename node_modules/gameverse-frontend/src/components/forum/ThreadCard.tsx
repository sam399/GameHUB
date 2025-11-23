import React from 'react';
import { Link } from 'react-router-dom';
import { ForumThread } from '../../types';

interface ThreadCardProps {
  thread: ForumThread;
}

const ThreadCard: React.FC<ThreadCardProps> = ({ thread }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className={`thread-card ${thread.isPinned ? 'pinned' : ''}`}>
      <div className="thread-status">
        {thread.isPinned && <span className="pin-badge">📌 Pinned</span>}
        {thread.isLocked && <span className="lock-badge">🔒 Locked</span>}
      </div>
      
      <div className="thread-main">
        <div className="thread-author">
          <div className="author-avatar">
            {thread.author.profile.avatar ? (
              <img src={thread.author.profile.avatar} alt={thread.author.username} />
            ) : (
              <div className="avatar-placeholder">
                {thread.author.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <span className="author-name">{thread.author.username}</span>
        </div>
        
        <div className="thread-content">
          <Link to={`/forum/thread/${thread._id}`}>
            <h3 className="thread-title">{thread.title}</h3>
          </Link>
          <p className="thread-preview">{truncateContent(thread.content)}</p>
          
          {thread.tags.length > 0 && (
            <div className="thread-tags">
              {thread.tags.map((tag, index) => (
                <span key={index} className="thread-tag">#{tag}</span>
              ))}
            </div>
          )}
        </div>
        
        <div className="thread-meta">
          <div className="meta-item">
            <span className="meta-icon">👁️</span>
            <span>{thread.views}</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">💬</span>
            <span>{thread.postCount}</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">📅</span>
            <span>{formatDate(thread.createdAt)}</span>
          </div>
        </div>
      </div>
      
      {thread.lastPost && (
        <div className="thread-last-post">
          <div className="last-post-author">
            by {typeof thread.lastPost.author === 'object' ? thread.lastPost.author.username : 'User'}
          </div>
          <div className="last-post-date">
            {formatDate(thread.lastPost.date)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreadCard;