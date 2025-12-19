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
import WishlistButton from '../components/games/WishlistButton';
import TrackGameButton from '../components/games/TrackGameButton';
import './GameDetails.css';
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

      // API returns { success, data: game } for getGame. Fall back if wrapped.
      const resolvedGame = gameResponse?.data?.game ?? gameResponse?.data;
      setGame(resolvedGame);
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

  return (
    <div className="game-details">
      {/* Game Header Section */}
      <div className="game-header" style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${game.images.cover})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="container">
          <div className="game-header-content">
            <div className="game-cover">
              <img src={game.images.cover} alt={game.title} />
              {game.featured && <div className="featured-badge">Featured</div>}
            </div>
            
            <div className="game-info">
              <h1>{game.title}</h1>
              <p className="game-meta">
                <span className="developer">{game.developer}</span>
                <span className="separator">•</span>
                <span className="publisher">{game.publisher}</span>
                <span className="separator">•</span>
                <span className="release-date">{new Date(game.releaseDate).getFullYear()}</span>
              </p>
              
              <div className="game-rating-section">
                <div className="rating-display">
                  <span className="rating-value">{game.rating.average.toFixed(1)}</span>
                  <span className="rating-max">/5</span>
                  <span className="rating-count">({game.rating.count} reviews)</span>
                </div>
              </div>

              <div className="game-genres">
                {game.genre.map(genre => (
                  <span key={genre} className="genre-badge">{genre}</span>
                ))}
              </div>

              <div className="game-platforms">
                <h4>Platforms:</h4>
                {game.platforms.map(platform => (
                  <span key={platform} className="platform-badge">{platform}</span>
                ))}
              </div>

              <div className="game-price-section">
                <div className="price">
                  {game.isFree || game.price === 0 ? (
                    <span className="free">Free to Play</span>
                  ) : (
                    <span className="paid">${game.price.toFixed(2)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="game-actions">
            <WishlistButton game={game} size="large" showText />
            <TrackGameButton game={game} />
          </div>
        </div>
      </div>

      {/* Game Description Section */}
      <div className="container">
        <div className="game-main-content">
          <main className="game-description-section">
            <h2>About This Game</h2>
            <p className="game-description">{game.description}</p>

            {game.images.screenshots && game.images.screenshots.length > 0 && (
              <div className="screenshots-section">
                <h3>Screenshots</h3>
                <div className="screenshots-grid">
                  {game.images.screenshots.map((screenshot, index) => (
                    <div key={index} className="screenshot-item">
                      <img src={screenshot} alt={`Screenshot ${index + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>

          <aside className="game-sidebar">
            <div className="game-info-box">
              <h3>Game Information</h3>
              <div className="info-item">
                <label>Developer</label>
                <p>{game.developer}</p>
              </div>
              <div className="info-item">
                <label>Publisher</label>
                <p>{game.publisher}</p>
              </div>
              <div className="info-item">
                <label>Release Date</label>
                <p>{new Date(game.releaseDate).toLocaleDateString()}</p>
              </div>
              <div className="info-item">
                <label>Platforms</label>
                <p>{game.platforms.join(', ')}</p>
              </div>
              <div className="info-item">
                <label>Genres</label>
                <p>{game.genre.join(', ')}</p>
              </div>
              <div className="info-item">
                <label>Price</label>
                <p>
                  {game.isFree || game.price === 0 ? (
                    <span className="free">Free to Play</span>
                  ) : (
                    <span className="paid">${game.price.toFixed(2)}</span>
                  )}
                </p>
              </div>
              {game.tags && game.tags.length > 0 && (
                <div className="info-item">
                  <label>Tags</label>
                  <div className="tags-list">
                    {game.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="container">
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
              {reviews.length === 0 ? (
                <p className="no-reviews">No reviews yet. Be the first to review this game!</p>
              ) : (
                reviews.map(review => (
                  <ReviewCard
                    key={review._id}
                    review={review}
                    onUpdate={handleEditReview}
                    onDelete={handleDeleteReview}
                  />
                ))
              )}
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
    </div>
  );
};

export default GameDetails;