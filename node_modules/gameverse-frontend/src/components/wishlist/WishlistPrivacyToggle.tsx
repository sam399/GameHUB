import React, { useEffect, useState } from 'react';
import { wishlistService } from '../../services/wishlistService';
import { Link } from 'react-router-dom';

interface Props {
  userId?: string;
}

const WishlistPrivacyToggle: React.FC<Props> = ({ userId }) => {
  const [isPublic, setIsPublic] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await wishlistService.getWishlist();
        const wishlist = res?.data?.wishlist;
        if (!mounted) return;
        setIsPublic(wishlist?.isPublic ?? true);
      } catch (err) {
        console.error('Error loading wishlist privacy', err);
        if (mounted) setIsPublic(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const togglePrivacy = async () => {
    if (loading || isPublic === null) return;
    try {
      setLoading(true);
      const newVal = !isPublic;
      const res = await wishlistService.togglePrivacy(newVal);
      const updated = res?.data?.isPublic;
      setIsPublic(updated ?? newVal);
    } catch (err) {
      console.error('Failed to toggle wishlist privacy', err);
      alert('Failed to update wishlist privacy.');
    } finally {
      setLoading(false);
    }
  };

  const publicUrl = userId ? `/wishlist/user/${userId}` : '/wishlist';

  return (
    <div className="wishlist-privacy">
      <div className="privacy-status">
        {isPublic === null ? 'Loading...' : (
          isPublic ? 'Your wishlist is public — others can view it.' : 'Your wishlist is private — only you can view it.'
        )}
      </div>

      <div className="privacy-controls">
        <button
          className="privacy-toggle-button"
          onClick={togglePrivacy}
          disabled={loading || isPublic === null}
        >
          {loading ? 'Saving...' : (isPublic ? 'Make Private' : 'Make Public')}
        </button>

        <Link
          to={publicUrl}
          target="_blank"
          rel="noreferrer"
          className="privacy-link"
          aria-disabled={isPublic === false}
        >
          View Public Wishlist
        </Link>
      </div>
    </div>
  );
};

export default WishlistPrivacyToggle;
