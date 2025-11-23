import React, { useState } from 'react';
import { UserWithFriendship } from '../../types';
import { friendService } from '../../services/friendService';

interface UserSearchCardProps {
  user: UserWithFriendship;
  onUpdate: () => void;
}

const UserSearchCard: React.FC<UserSearchCardProps> = ({ user, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  const handleSendRequest = async () => {
    setLoading(true);
    try {
      await friendService.sendFriendRequest(user._id);
      onUpdate();
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Failed to send friend request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!user.friendshipStatus.outgoingRequest) return;
    
    setLoading(true);
    try {
      await friendService.cancelFriendRequest(user.friendshipStatus.outgoingRequest);
      onUpdate();
    } catch (error) {
      console.error('Error cancelling friend request:', error);
      alert('Failed to cancel friend request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!user.friendshipStatus.incomingRequest) return;
    
    setLoading(true);
    try {
      await friendService.acceptFriendRequest(user.friendshipStatus.incomingRequest);
      onUpdate();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      alert('Failed to accept friend request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getActionButton = () => {
    const { isFriend, hasPendingRequest, incomingRequest, outgoingRequest } = user.friendshipStatus;

    if (isFriend) {
      return (
        <button className="friend-status" disabled>
          Friends
        </button>
      );
    }

    if (incomingRequest) {
      return (
        <button 
          className="accept-btn"
          onClick={handleAcceptRequest}
          disabled={loading}
        >
          {loading ? 'Accepting...' : 'Accept Request'}
        </button>
      );
    }

    if (outgoingRequest) {
      return (
        <button 
          className="cancel-request-btn"
          onClick={handleCancelRequest}
          disabled={loading}
        >
          {loading ? 'Cancelling...' : 'Cancel Request'}
        </button>
      );
    }

    return (
      <button 
        className="add-friend-btn"
        onClick={handleSendRequest}
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Add Friend'}
      </button>
    );
  };

  return (
    <div className="user-search-card">
      <div className="user-info">
        <div className="user-avatar">
          {user.profile.avatar ? (
            <img src={user.profile.avatar} alt={user.username} />
          ) : (
            <div className="avatar-placeholder">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="user-details">
          <h4 className="user-name">{user.username}</h4>
          {user.profile.bio && (
            <p className="user-bio">{user.profile.bio}</p>
          )}
        </div>
      </div>

      <div className="user-actions">
        {getActionButton()}
      </div>
    </div>
  );
};

export default UserSearchCard;