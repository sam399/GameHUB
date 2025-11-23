import React from 'react';
import { Link } from 'react-router-dom';
import { Friend } from '../../types';
import { friendService } from '../../services/friendService';

interface FriendCardProps {
  friend: Friend;
  onRemove?: (friendId: string) => void;
}

const FriendCard: React.FC<FriendCardProps> = ({ friend, onRemove }) => {
  const handleRemoveFriend = async () => {
    if (window.confirm(`Are you sure you want to remove ${friend.user.username} from your friends?`)) {
      try {
        await friendService.removeFriend(friend.user._id);
        onRemove?.(friend.user._id);
      } catch (error) {
        console.error('Error removing friend:', error);
        alert('Failed to remove friend. Please try again.');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="friend-card">
      <div className="friend-info">
        <div className="friend-avatar">
          {friend.user.profile.avatar ? (
            <img src={friend.user.profile.avatar} alt={friend.user.username} />
          ) : (
            <div className="avatar-placeholder">
              {friend.user.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="friend-details">
          <Link to={`/profile/${friend.user._id}`} className="friend-name">
            {friend.user.username}
          </Link>
          {friend.user.profile.bio && (
            <p className="friend-bio">{friend.user.profile.bio}</p>
          )}
          <p className="friend-since">
            Friends since {formatDate(friend.since)}
          </p>
        </div>
      </div>

      <div className="friend-actions">
        <button 
          className="chat-btn"
          onClick={() => {/* Navigate to chat */}}
          title="Start Chat"
        >
          💬
        </button>
        <button 
          className="remove-btn"
          onClick={handleRemoveFriend}
          title="Remove Friend"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default FriendCard;