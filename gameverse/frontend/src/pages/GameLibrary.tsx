import React, { useState, useEffect } from 'react';
import { Game, GameFilters as GameFiltersType } from '../types';
import { gameService } from '../services/gameService';
import GameGrid from '../components/games/GameGrid';
import GameFilters from '../components/games/GameFilters';

const GameLibrary: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<GameFiltersType>({
    page: 1,
    limit: 12
  });
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    total: 0
  });

  useEffect(() => {
    loadGames();
  }, [filters]);

  const loadGames = async () => {
    setLoading(true);
    try {
      console.log('Loading games with filters:', filters);
      const response = await gameService.getGames(filters);
      console.log('Games API response:', response);

      // API shape: { success, data: { games, totalPages, currentPage, total } }
      const data = response?.data ?? response;

      if (data?.games) {
        setGames(data.games);
        setPagination({
          totalPages: data.totalPages,
          currentPage: data.currentPage,
          total: data.total
        });
        console.log('Successfully loaded games:', data.games.length);
      } else {
        console.error('Invalid response format:', response);
        setGames([]);
      }
    } catch (error) {
      console.error('Error loading games:', error);
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="game-library">
      <div className="container">
        <div className="library-header">
          <h1>Game Library</h1>
          <p>Discover {pagination.total} amazing games</p>
        </div>

        <div className="library-content">
          <aside className="filters-sidebar">
            <GameFilters filters={filters} onFiltersChange={setFilters} />
          </aside>

          <main className="games-main">
            <GameGrid games={games} loading={loading} />

            {!loading && pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={pagination.currentPage === 1}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                >
                  Previous
                </button>

                {Array.from({ length: pagination.totalPages }, (_, idx) => idx + 1).map(page => (
                  <button
                    key={page}
                    className={page === pagination.currentPage ? 'active' : ''}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default GameLibrary;