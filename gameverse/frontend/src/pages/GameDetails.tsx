import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Game } from '../types';
import { gameService } from '../services/gameService';

const GameDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadGame(id);
    }
  }, [id]);

  const loadGame = async (gameId: string) => {
    try {
      const response = await gameService.getGame(gameId);
      setGame(response.data.game);
    } catch (error) {
      console.error('Error loading game:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading game details...</div>;
  }

  if (!game) {
    return <div className="error">Game not found</div>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderRating = (rating: number) => {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  };

  return (
    <div className="game-details">
      <div className="game-hero">
        <img 
          src={game.images.cover || '/placeholder-game.jpg'} 
          alt={game.title}
          className="game-cover"
        />
        <div className="game-hero-content">
          <h1>{game.title}</h1>
          <p className="game-meta">
            By {game.developer} • Released {formatDate(game.releaseDate)}
          </p>
          <div className="game-rating-large">
            <span className="stars">{renderRating(game.rating.average)}</span>
            <span className="rating-text">
              {game.rating.average.toFixed(1)} ({game.rating.count} reviews)
            </span>
          </div>
          <div className="game-price-large">
            {game.isFree ? 'Free' : `$${game.price.toFixed(2)}`}
          </div>
        </div>
      </div>

      <div className="game-content">
        <div className="game-main">
          <section className="game-description">
            <h2>About</h2>
            <p>{game.description}</p>
          </section>

          {game.images.screenshots && game.images.screenshots.length > 0 && (
            <section className="game-screenshots">
              <h2>Screenshots</h2>
              <div className="screenshot-grid">
                {game.images.screenshots.map((screenshot, index) => (
                  <img key={index} src={screenshot} alt={`${game.title} screenshot ${index + 1}`} />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="game-sidebar">
          <div className="info-card">
            <h3>Game Info</h3>
            <div className="info-item">
              <strong>Developer:</strong> {game.developer}
            </div>
            <div className="info-item">
              <strong>Publisher:</strong> {game.publisher}
            </div>
            <div className="info-item">
              <strong>Release Date:</strong> {formatDate(game.releaseDate)}
            </div>
            <div className="info-item">
              <strong>Genres:</strong> {game.genre.join(', ')}
            </div>
            <div className="info-item">
              <strong>Platforms:</strong> {game.platforms.join(', ')}
            </div>
            {game.website && (
              <div className="info-item">
                <strong>Website:</strong>{' '}
                <a href={game.website} target="_blank" rel="noopener noreferrer">
                  Official Site
                </a>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default GameDetails;