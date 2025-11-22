import React from 'react';
import { ReviewStats as ReviewStatsType } from '../../types';

interface ReviewStatsProps {
  stats: ReviewStatsType;
  averageRating: number;
}

const ReviewStats: React.FC<ReviewStatsProps> = ({ stats, averageRating }) => {
  const renderRatingBar = (rating: number, count: number, percentage: number) => {
    return (
      <div key={rating} className="rating-bar">
        <span className="rating-label">{rating} star</span>
        <div className="bar-container">
          <div 
            className="bar-fill" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="rating-count">{count}</span>
      </div>
    );
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  };

  return (
    <div className="review-stats">
      <h3>Rating Overview</h3>
      
      <div className="stats-overview">
        <div className="average-rating">
          <span className="average-number">{averageRating.toFixed(1)}</span>
          <div className="average-stars">
            <span className="stars">{renderStars(averageRating)}</span>
            <span className="total-reviews">{stats.totalReviews} reviews</span>
          </div>
        </div>

        <div className="rating-bars">
          {stats.ratingDistribution.map(({ rating, count, percentage }) =>
            renderRatingBar(rating, count, percentage)
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewStats;