import React, { useState, useEffect } from 'react';
import { Review } from '../types';
import { reviewService } from '../services/reviewService';
import ReviewCard from '../components/reviews/ReviewCard';

const UserReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserReviews();
  }, []);

  const loadUserReviews = async () => {
    try {
      const response = await reviewService.getUserReviews();
      setReviews(response.data.reviews);
    } catch (error) {
      console.error('Error loading user reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await reviewService.deleteReview(reviewId);
      setReviews(reviews.filter(review => review._id !== reviewId));
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Error deleting review. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading your reviews...</div>;
  }

  return (
    <div className="user-reviews">
      <div className="page-header">
        <h1>My Reviews</h1>
        <p>You have written {reviews.length} reviews</p>
      </div>

      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <h3>No reviews yet</h3>
            <p>Start reviewing games to see them here!</p>
          </div>
        ) : (
          reviews.map(review => (
            <ReviewCard
              key={review._id}
              review={review}
              onDelete={handleDeleteReview}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default UserReviews;