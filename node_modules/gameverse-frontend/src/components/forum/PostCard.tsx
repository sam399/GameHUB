import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ForumPost } from '../../types';
import { forumService } from '../../services/forumService';

interface PostCardProps {
  post: ForumPost;
  onUpdate?: (post: ForumPost) => void;
  onDelete?: (postId: string) => void;
  onReply?: (parentPost: ForumPost) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onUpdate, onDelete, onReply }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes.length);
  const [hasLiked, setHasLiked] = useState(user ? post.likes.includes(user._id) : false);
  const [liking, setLiking] = useState(false);

  const handleLike = async () => {
    if (!user) return;
    
    setLiking(true);
    try {
      const response = await forumService.likePost(post._id);
      setLikes(response.data.likes);
      setHasLiked(response.data.hasLiked);
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setLiking(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOwnPost = user && user._id === post.author._id;

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-author">
          <div className="author-avatar">
            {post.author.profile.avatar ? (
              <img src={post.author.profile.avatar} alt={post.author.username} />
            ) : (
              <div className="avatar-placeholder">
                {post.author.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="author-info">
            <h4 className="author-name">{post.author.username}</h4>
            <span className="post-date">
              {formatDate(post.createdAt)}
              {post.isEdited && ' (edited)'}
            </span>
          </div>
        </div>
        
        <div className="post-actions">
          {user && (
            <button 
              className="reply-btn"
              onClick={() => onReply?.(post)}
            >
              Reply
            </button>
          )}
          {isOwnPost && (
            <>
              <button 
                className="edit-btn"
                onClick={() => onUpdate?.(post)}
              >
                Edit
              </button>
              <button 
                className="delete-btn"
                onClick={() => onDelete?.(post._id)}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="post-content">
        <p>{post.content}</p>
      </div>
      
      <div className="post-footer">
        <button 
          className={`like-btn ${hasLiked ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={liking || !user}
        >
          <span className="like-icon">👍</span>
          <span className="like-count">{likes}</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;