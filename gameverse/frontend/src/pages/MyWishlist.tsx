import React, { useState, useEffect } from 'react';
import { wishlistService } from '../services/wishlistService';
import { Wishlist } from '../types';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import WishlistPrivacyToggle from '../components/wishlist/WishlistPrivacyToggle';
import './MyWishlist.css';

const MyWishlist: React.FC = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('dateAdded');

  useEffect(() => {
    if (user) {
      loadWishlist();
    }
  }, [user]);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const response = await wishlistService.getWishlist();
      setWishlist(response.data.wishlist);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setWishlist(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (gameId: string) => {
    if (!confirm('Remove this game from your wishlist?')) return;

    try {
      await wishlistService.removeFromWishlist(gameId);
      await loadWishlist();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Failed to remove game. Please try again.');
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: '#f56565',
      medium: '#ed8936',
      low: '#48bb78'
    };
    return colors[priority] || '#718096';
  };

  const sortedGames = wishlist?.games ? [...wishlist.games].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
               (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
      case 'price':
        return (a.game.price || 0) - (b.game.price || 0);
      case 'title':
        return a.game.title.localeCompare(b.game.title);
      case 'dateAdded':
      default:
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    }
  }) : [];

  if (!user) {
    return (
      <div className="my-wishlist">
        <div className="container">
          <div className="auth-prompt">
            <h2>Sign in to view your wishlist</h2>
            <Link to="/login" className="btn-primary">Sign In</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-wishlist">
      <div className="container">
        <div className="wishlist-header">
          <div className="header-content">
            <h1>My Wishlist</h1>
            <p className="subtitle">Games you want to play</p>
          </div>

          {user && <WishlistPrivacyToggle userId={user._id} />}
        </div>

        <div className="wishlist-info">
          <div className="info-card">
            <div className="info-value">{wishlist?.games?.length || 0}</div>
            <div className="info-label">Games in Wishlist</div>
          </div>
          <div className="info-card">
            <div className="info-value">
              ${wishlist?.games?.reduce((sum, item) => sum + (item.game.price || 0), 0).toFixed(2) || '0.00'}
            </div>
            <div className="info-label">Total Value</div>
          </div>
          <div className="info-card">
            <div className="info-value">
              {wishlist?.games?.filter(item => item.priority === 'high').length || 0}
            </div>
            <div className="info-label">High Priority</div>
          </div>
        </div>

        <div className="wishlist-controls">
          <div className="sort">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="dateAdded">Date Added</option>
              <option value="priority">Priority</option>
              <option value="price">Price</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your wishlist...</p>
          </div>
        ) : !wishlist || wishlist.games.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⭐</div>
            <h3>Your wishlist is empty</h3>
            <p>Add games you want to play to your wishlist</p>
            <Link to="/games" className="btn-primary">Browse Games</Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {sortedGames.map((item) => (
              <div key={item.game._id} className="wishlist-card">
                <Link to={`/games/${item.game._id}`} className="card-image">
                  <img 
                    src={item.game.images?.cover || item.game.coverImage} 
                    alt={item.game.title}
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300x400?text=No+Image';
                    }}
                  />
                  <div 
                    className="priority-badge" 
                    style={{ backgroundColor: getPriorityColor(item.priority) }}
                  >
                    {item.priority.toUpperCase()}
                  </div>
                </Link>

                <div className="card-content">
                  <Link to={`/games/${item.game._id}`}>
                    <h3 className="game-title">{item.game.title}</h3>
                  </Link>

                  <div className="game-meta">
                    <span className="developer">{item.game.developer}</span>
                  </div>

                  <div className="price-info">
                    {item.game.isFree || item.game.price === 0 ? (
                      <span className="price-free">Free to Play</span>
                    ) : (
                      <span className="price">${item.game.price?.toFixed(2)}</span>
                    )}
                  </div>

                  {item.notes && (
                    <div className="notes">
                      <p>{item.notes}</p>
                    </div>
                  )}

                  <div className="card-footer">
                    <span className="date-added">
                      Added {new Date(item.addedAt).toLocaleDateString()}
                    </span>
                    <button 
                      className="btn-remove"
                      onClick={() => handleRemove(item.game._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyWishlist;
