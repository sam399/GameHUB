import React from 'react';
import { Link } from 'react-router-dom';
import { Game } from '../../types';

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const formatPrice = (price: number, isFree: boolean) => {
    if (isFree) return 'Free';
    return `$${price.toFixed(2)}`;
  };

  const renderRating = (rating: number) => {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  };

  return (
    <div className="game-card">
      <Link to={`/games/${game._id}`}>
        <div className="game-card-image">
          <img 
            src={game.images.cover || '/placeholder-game.jpg'} 
            alt={game.title}
          />
          {game.featured && <span className="featured-badge">Featured</span>}
        </div>
        
        <div className="game-card-content">
          <h3 className="game-title">{game.title}</h3>
          <p className="game-developer">{game.developer}</p>
          
          <div className="game-genres">
            {game.genre.slice(0, 2).map((genre, index) => (
              <span key={index} className="genre-tag">{genre}</span>
            ))}
          </div>
          
          <div className="game-platforms">
            {game.platforms.slice(0, 3).map((platform, index) => (
              <span key={index} className="platform-tag">{platform}</span>
            ))}
          </div>
          
          <div className="game-card-footer">
            <div className="game-rating">
              <span className="stars">{renderRating(game.rating.average)}</span>
              <span className="rating-text">({game.rating.count})</span>
            </div>
            <div className="game-price">
              {formatPrice(game.price, game.isFree)}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default GameCard;