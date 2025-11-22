import React, { useState, useEffect } from 'react';
import { CreateReviewData, Review } from '../../types';

interface ReviewFormProps {
  gameId: string;
  existingReview?: Review | null;
  onSubmit: (data: CreateReviewData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  gameId,
  existingReview,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<CreateReviewData>({
    rating: 0,
    title: '',
    content: ''
  });
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (existingReview) {
      setFormData({
        rating: existingReview.rating,
        title: existingReview.title,
        content: existingReview.content
      });
    }
  }, [existingReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.rating === 0) {
      alert('Please select a rating');
      return;
    }
    await onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const ratingValue = i + 1;
      return (
        <label key={ratingValue} className="star-label">
          <input
            type="radio"
            name="rating"
            value={ratingValue}
            onChange={() => setFormData({ ...formData, rating: ratingValue })}
            className="star-input"
          />
          <span
            className={`star ${ratingValue <= (hoverRating || formData.rating) ? 'filled' : ''}`}
            onMouseEnter={() => setHoverRating(ratingValue)}
            onMouseLeave={() => setHoverRating(0)}
          >
            ★
          </span>
        </label>
      );
    });
  };

  return (
    <div className="review-form">
      <h3>{existingReview ? 'Edit Review' : 'Write a Review'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Your Rating</label>
          <div className="star-rating">
            {renderStars()}
            <span className="rating-text">
              {formData.rating > 0 ? `${formData.rating}.0 stars` : 'Select rating'}
            </span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="title">Review Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Summarize your experience..."
            required
            maxLength={100}
          />
          <span className="char-count">{formData.title.length}/100</span>
        </div>

        <div className="form-group">
          <label htmlFor="content">Review Content</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Share your thoughts about the game..."
            required
            rows={6}
            maxLength={2000}
          />
          <span className="char-count">{formData.content.length}/2000</span>
        </div>

        <div className="form-actions">
          {onCancel && (
            <button type="button" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
          )}
          <button type="submit" disabled={loading || formData.rating === 0}>
            {loading ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;