import React, { useState, useEffect } from 'react';
import { libraryService } from '../services/libraryService';
import { GameTracking, LibraryStats } from '../types';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './MyLibrary.css';

const MyLibrary: React.FC = () => {
  const { user } = useAuth();
  const [library, setLibrary] = useState<GameTracking[]>([]);
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('lastPlayed');

  useEffect(() => {
    loadLibrary();
  }, [filterStatus, sortBy]);

  const loadLibrary = async () => {
    setLoading(true);
    try {
      const filters: any = {
        sortBy,
        sortOrder: 'desc'
      };

      if (filterStatus !== 'all') {
        filters.status = filterStatus;
      }

      const response = await libraryService.getUserLibrary(filters);
      setLibrary(response.data.library || []);
      setStats(response.data.stats || null);
    } catch (error) {
      console.error('Error loading library:', error);
      setLibrary([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      playing: '#667eea',
      completed: '#48bb78',
      planning: '#ed8936',
      'on-hold': '#ecc94b',
      dropped: '#f56565'
    };
    return colors[status] || '#718096';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      playing: 'Currently Playing',
      completed: 'Completed',
      planning: 'Plan to Play',
      'on-hold': 'On Hold',
      dropped: 'Dropped'
    };
    return labels[status] || status;
  };

  if (!user) {
    return (
      <div className="my-library">
        <div className="container">
          <div className="auth-prompt">
            <h2>Sign in to view your library</h2>
            <Link to="/login" className="btn-primary">Sign In</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-library">
      <div className="container">
        <div className="library-header">
          <div className="header-content">
            <h1>My Game Library</h1>
            <p className="subtitle">Track your gaming journey</p>
          </div>

          {stats && (
            <div className="library-stats">
              <div className="stat-card">
                <div className="stat-value">{stats.totalGames || 0}</div>
                <div className="stat-label">Total Games</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.completed || 0}</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.currentlyPlaying || 0}</div>
                <div className="stat-label">Playing</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.totalHoursPlayed?.toFixed(0) || 0}h</div>
                <div className="stat-label">Hours Played</div>
              </div>
            </div>
          )}
        </div>

        <div className="library-controls">
          <div className="filters">
            <label>Filter by Status:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Games</option>
              <option value="playing">Currently Playing</option>
              <option value="completed">Completed</option>
              <option value="planning">Plan to Play</option>
              <option value="on-hold">On Hold</option>
              <option value="dropped">Dropped</option>
            </select>
          </div>

          <div className="sort">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="lastPlayed">Last Played</option>
              <option value="dateAdded">Date Added</option>
              <option value="rating">My Rating</option>
              <option value="hoursPlayed">Hours Played</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your library...</p>
          </div>
        ) : library.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>Your library is empty</h3>
            <p>Start tracking games to build your collection</p>
            <Link to="/games" className="btn-primary">Browse Games</Link>
          </div>
        ) : (
          <div className="library-grid">
            {library.map((item) => (
              <div key={item._id} className="library-card">
                <Link to={`/games/${item.game._id}`} className="card-image">
                  <img 
                    src={item.game.images?.cover || item.game.coverImage} 
                    alt={item.game.title}
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300x400?text=No+Image';
                    }}
                  />
                  <div className="status-badge" style={{ backgroundColor: getStatusColor(item.status) }}>
                    {getStatusLabel(item.status)}
                  </div>
                  {item.isFavorite && (
                    <div className="favorite-badge">⭐</div>
                  )}
                </Link>

                <div className="card-content">
                  <Link to={`/games/${item.game._id}`}>
                    <h3 className="game-title">{item.game.title}</h3>
                  </Link>

                  <div className="game-meta">
                    {item.platform && (
                      <span className="platform-tag">{item.platform}</span>
                    )}
                    {item.rating && (
                      <span className="rating">⭐ {item.rating}/5</span>
                    )}
                  </div>

                  {item.hoursPlayed > 0 && (
                    <div className="hours-played">
                      🎮 {item.hoursPlayed.toFixed(1)} hours played
                    </div>
                  )}

                  {item.progress > 0 && (
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${item.progress}%` }}
                      ></div>
                      <span className="progress-text">{item.progress}% Complete</span>
                    </div>
                  )}

                  {item.notes && (
                    <div className="notes">
                      <p>{item.notes}</p>
                    </div>
                  )}

                  {item.lastPlayed && (
                    <div className="last-played">
                      Last played: {new Date(item.lastPlayed).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLibrary;
