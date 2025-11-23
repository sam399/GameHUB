import React from 'react';
import { FriendRequest } from '../../types';
import { friendService } from '../../services/friendService';

interface FriendRequestCardProps {
  request: FriendRequest;
  type: 'incoming' | 'outgoing';
  onUpdate: () => void;
}

const FriendRequestCard: React.FC<FriendRequestCardProps> = ({ 
  request, 
  type, 
  onUpdate 
}) => {
  const user = type === 'incoming' ? request.from : request.to;

  const handleAccept = async () => {
    try {
      await friendService.acceptFriendRequest(request._id);
      onUpdate();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      alert('Failed to accept friend request. Please try again.');
    }
  };

  const handleReject = async () => {
    try {
      await friendService.rejectFriendRequest(request._id);
      onUpdate();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      alert('Failed to reject friend request. Please try again.');
    }
  };

  const handleCancel = async () => {
    try {
      await friendService.cancelFriendRequest(request._id);
      onUpdate();
    } catch (error) {
      console.error('Error cancelling friend request:', error);
      alert('Failed to cancel friend request. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="friend-request-card">
      <div className="request-info">
        <div className="user-avatar">
          {user.profile.avatar ? (
            <img src={user.profile.avatar} alt={user.username} />
          ) : (
            <div className="avatar-placeholder">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="request-details">
          <h4 className="user-name">{user.username}</h4>
          <p className="request-meta">
            {type === 'incoming' ? 'Sent you a friend request' : 'You sent a friend request'}
          </p>
          <p className="request-date">
            {formatDate(request.createdAt)}
          </p>
        </div>
      </div>

      <div className="request-actions">
        {type === 'incoming' ? (
          <>
            <button 
              className="accept-btn"
              onClick={handleAccept}
            >
              Accept
            </button>
            <button 
              className="reject-btn"
              onClick={handleReject}
            >
              Reject
            </button>
          </>
        ) : (
          <button 
            className="cancel-btn"
            onClick={handleCancel}
          >
            Cancel Request
          </button>
        )}
      </div>
    </div>
  );
};

export default FriendRequestCard;