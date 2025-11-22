import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Game, Review, ReviewStats as ReviewStatsType, CreateReviewData } from '../types';
import { gameService } from '../services/gameService';
import { reviewService } from '../services/reviewService';
import { useAuth } from '../contexts/AuthContext';
import ReviewCard from '../components/reviews/ReviewCard';
import ReviewForm from '../components/reviews/ReviewForm';
import ReviewStats from '../components/reviews/ReviewStats';
import { on as realtimeOn, off as realtimeOff } from '../services/realtime';

const GameDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [game, setGame] = useState<Game | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStatsType | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (id) {
      loadGameAndReviews(id);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const handleReviewEvent = (payload: any) => {
      try {
        if (payload?.gameId === id) {
          // reload reviews and stats to reflect changes
          loadGameAndReviews(id);
        }
      } catch (err) {
        console.error('Realtime handler error:', err);
      }
    };

    realtimeOn('review:created', handleReviewEvent);
    realtimeOn('review:updated', handleReviewEvent);
    realtimeOn('review:deleted', handleReviewEvent);
    realtimeOn('review:reaction', handleReviewEvent);
    realtimeOn('game:ratingUpdated', handleReviewEvent);

    return () => {
      realtimeOff('review:created', handleReviewEvent);
      realtimeOff('review:updated', handleReviewEvent);
      realtimeOff('review:deleted', handleReviewEvent);
      realtimeOff('review:reaction', handleReviewEvent);
      realtimeOff('game:ratingUpdated', handleReviewEvent);
    };
  }, [id]);

  const loadGameAndReviews = async (gameId: string) => {
    setLoading(true);
    try {
      const [gameResponse, reviewsResponse, statsResponse] = await Promise.all([
        gameService.getGame(gameId),
        reviewService.getGameReviews(gameId),
        reviewService.getReviewStats(gameId)
      ]);
      
      setGame(gameResponse.data.game);
      setReviews(reviewsResponse.data.reviews);
      setReviewStats(statsResponse.data);
    } catch (error) {
      console.error('Error loading game details:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreReviews = async () => {
    if (!id) return;
    
    setReviewsLoading(true);
    try {
      const response = await reviewService.getGameReviews(id, 1, reviews.length + 10);
      setReviews(response.data.reviews);
    } catch (error) {
      console.error('Error loading more reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleSubmitReview = async (reviewData: CreateReviewData) => {
    if (!id) return;
    
    setSubmittingReview(true);
    try {
      if (editingReview) {
        await reviewService.updateReview(editingReview._id, reviewData);
      } else {
        await reviewService.createReview(id, reviewData);
      }
      
      // Reload reviews and stats
      await loadGameAndReviews(id);
      setShowReviewForm(false);
      setEditingReview(null);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await reviewService.deleteReview(reviewId);
      await loadGameAndReviews(id!);
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Error deleting review. Please try again.');
    }
  };

  const userHasReviewed = user && reviews.some(review => review.user._id === user._id);

  if (loading) {
    return <div className="loading">Loading game details...</div>;
  }

  if (!game) {
    return <div className="error">Game not found</div>;
  }

  // ... (keep existing game details rendering code)

  return (
    <div className="game-details">
      {/* Existing game hero and content sections */}
      
      {/* Add reviews section */}
      <section className="game-reviews">
        <div className="reviews-header">
          <h2>Player Reviews</h2>
          {reviewStats && (
            <ReviewStats 
              stats={reviewStats} 
              averageRating={game.rating.average} 
            />
          )}
        </div>

        <div className="reviews-content">
          <div className="reviews-actions">
            {user && !userHasReviewed && !showReviewForm && (
              <button 
                className="write-review-btn"
                onClick={() => setShowReviewForm(true)}
              >
                Write a Review
              </button>
            )}
          </div>

          {showReviewForm && (
            <div className="review-form-section">
              <ReviewForm
                gameId={id!}
                existingReview={editingReview}
                onSubmit={handleSubmitReview}
                onCancel={() => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                }}
                loading={submittingReview}
              />
            </div>
          )}

          <div className="reviews-list">
            {reviews.map(review => (
              <ReviewCard
                key={review._id}
                review={review}
                onUpdate={handleEditReview}
                onDelete={handleDeleteReview}
              />
            ))}
          </div>

          {reviews.length > 0 && (
            <div className="reviews-footer">
              <button 
                onClick={loadMoreReviews}
                disabled={reviewsLoading}
              >
                {reviewsLoading ? 'Loading...' : 'Load More Reviews'}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default GameDetails;