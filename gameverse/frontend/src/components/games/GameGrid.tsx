import React from 'react';
import { Game } from '../../types';
import GameCard from './GameCard';

interface GameGridProps {
  games: Game[];
  loading?: boolean;
}

const GameGrid: React.FC<GameGridProps> = ({ games, loading = false }) => {
  if (loading) {
    return (
      <div className="game-grid loading">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="game-card-skeleton">
            <div className="image-skeleton"></div>
            <div className="content-skeleton">
              <div className="title-skeleton"></div>
              <div className="developer-skeleton"></div>
              <div className="tags-skeleton"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="no-games">
        <h3>No games found</h3>
        <p>Try adjusting your search filters</p>
      </div>
    );
  }

  return (
    <div className="game-grid">
      {games.map((game) => (
        <GameCard key={game._id} game={game} />
      ))}
    </div>
  );
};

export default GameGrid;