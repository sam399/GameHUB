import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Review } from '../../types';
import { reviewService } from '../../services/reviewService';

interface ReviewCardProps {
  review: Review;
  onUpdate?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onUpdate, onDelete }) => {
  const { user } = useAuth();
  const [reaction, setReaction] = useState({
    likes: review.likes.length,
    dislikes: review.dislikes.length,
    helpful: review.helpful,
    userReaction: user ? 
      (review.likes.includes(user._id) ? 'like' : 
       review.dislikes.includes(user._id) ? 'dislike' : 'none') : 'none'
  });
  const [reacting, setReacting] = useState(false);

  const handleReaction = async (newReaction: 'like' | 'dislike') => {
    if (!user) return;
    
    setReacting(true);
    try {
      const response = await reviewService.reactToReview(review._id, newReaction);
      setReaction(response.data);
    } catch (error) {
      console.error('Error reacting to review:', error);
    } finally {
      setReacting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const isOwnReview = user && review.user && user._id === review.user._id;

  // Handle case where user data is missing
  if (!review.user) {
    return null;
  }

  return (
    <div className="review-card">
      <div className="review-header">
        <div className="reviewer-info">
          <div className="reviewer-avatar">
            {review.user.profile?.avatar ? (
              <img src={review.user.profile.avatar} alt={review.user.username} />
            ) : (
              <div className="avatar-placeholder">
                {review.user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="reviewer-details">
            <h4>{review.user.username}</h4>
            <div className="review-meta">
              <span className="review-rating">
                <span className="stars">{renderStars(review.rating)}</span>
                <span className="rating-number">{review.rating}.0</span>
              </span>
              <span className="review-date">
                {formatDate(review.createdAt)}
                {review.isEdited && ` (edited)`}
              </span>
            </div>
          </div>
        </div>
        
        {isOwnReview && (
          <div className="review-actions">
            <button onClick={() => onUpdate?.(review)}>Edit</button>
            <button onClick={() => onDelete?.(review._id)}>Delete</button>
          </div>
        )}
      </div>

      <div className="review-content">
        <h3 className="review-title">{review.title}</h3>
        <p className="review-text">{review.content}</p>
      </div>

      <div className="review-footer">
        <div className="review-reactions">
          <span className="helpful-text">Helpful?</span>
          <button 
            className={`reaction-btn like-btn ${reaction.userReaction === 'like' ? 'active' : ''}`}
            onClick={() => handleReaction('like')}
            disabled={reacting || !user}
          >
            👍 {reaction.likes}
          </button>
          <button 
            className={`reaction-btn dislike-btn ${reaction.userReaction === 'dislike' ? 'active' : ''}`}
            onClick={() => handleReaction('dislike')}
            disabled={reacting || !user}
          >
            👎 {reaction.dislikes}
          </button>
          <span className="helpful-count">
            {reaction.helpful > 0 ? '+' : ''}{reaction.helpful} helpful
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;