import React, { useState, useEffect } from 'react';
import { Game } from '../../types';
import { wishlistService } from '../../services/wishlistService';

interface WishlistButtonProps {
  game: Game;
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ 
  game, 
  size = 'medium', 
  showText = false 
}) => {
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkWishlistStatus();
  }, [game._id]);

  const checkWishlistStatus = async () => {
    try {
      const response = await wishlistService.checkGameInWishlist(game._id);
      setInWishlist(response.data.inWishlist);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      if (inWishlist) {
        await wishlistService.removeFromWishlist(game._id);
        setInWishlist(false);
      } else {
        await wishlistService.addToWishlist(game._id);
        setInWishlist(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      alert('Failed to update wishlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small': return '1rem';
      case 'large': return '1.5rem';
      default: return '1.2rem';
    }
  };

  if (checking) {
    return (
      <button className="wishlist-button loading" disabled>
        <span className="wishlist-icon">⭐</span>
        {showText && 'Loading...'}
      </button>
    );
  }

  return (
    <button 
      className={`wishlist-button ${inWishlist ? 'in-wishlist' : ''} ${loading ? 'loading' : ''}`}
      onClick={handleWishlistToggle}
      disabled={loading}
      title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <span 
        className="wishlist-icon"
        style={{ fontSize: getButtonSize() }}
      >
        {inWishlist ? '★' : '☆'}
      </span>
      {showText && (
        <span className="wishlist-text">
          {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
        </span>
      )}
    </button>
  );
};

export default WishlistButton;