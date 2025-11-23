import React, { useState, useEffect } from 'react';
import { Friend, FriendRequest } from '../types';
import FindFriends from './FindFriends';
import { friendService } from '../services/friendService';
import FriendCard from '../components/friends/FriendCard';
import FriendRequestCard from '../components/friends/FriendRequestCard';

const Friends: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'suggestions'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<{ incoming: FriendRequest[]; outgoing: FriendRequest[] }>({
    incoming: [],
    outgoing: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [friendsResponse, requestsResponse] = await Promise.all([
        friendService.getFriends(),
        friendService.getFriendRequests()
      ]);
      
      setFriends(friendsResponse.data.friends);
      setRequests(requestsResponse.data);
    } catch (error) {
      console.error('Error loading friends data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = (friendId: string) => {
    setFriends(prev => prev.filter(friend => friend.user._id !== friendId));
  };

  if (loading) {
    return (
      <div className="friends-page">
        <div className="loading">Loading friends...</div>
      </div>
    );
  }

  return (
    <div className="friends-page">
      <div className="friends-header">
        <h1>Friends</h1>
        <p>Connect with other gamers and build your gaming community</p>
      </div>

      <div className="friends-tabs">
        <button 
          className={`tab ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          Friends ({friends.length})
        </button>
        <button 
          className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Requests ({requests.incoming.length + requests.outgoing.length})
        </button>
        <button 
          className={`tab ${activeTab === 'suggestions' ? 'active' : ''}`}
          onClick={() => setActiveTab('suggestions')}
        >
          Suggestions
        </button>
      </div>

      <div className="friends-content">
        {activeTab === 'friends' && (
          <div className="friends-list">
            {friends.length === 0 ? (
              <div className="empty-state">
                <h3>No friends yet</h3>
                <p>Start adding friends to see them here!</p>
              </div>
            ) : (
              friends.map(friend => (
                <FriendCard
                  key={friend.user._id}
                  friend={friend}
                  onRemove={handleRemoveFriend}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="requests-content">
            <div className="requests-section">
              <h3>Incoming Requests ({requests.incoming.length})</h3>
              {requests.incoming.length === 0 ? (
                <p className="no-requests">No incoming friend requests</p>
              ) : (
                requests.incoming.map(request => (
                  <FriendRequestCard
                    key={request._id}
                    request={request}
                    type="incoming"
                    onUpdate={loadData}
                  />
                ))
              )}
            </div>

            <div className="requests-section">
              <h3>Outgoing Requests ({requests.outgoing.length})</h3>
              {requests.outgoing.length === 0 ? (
                <p className="no-requests">No outgoing friend requests</p>
              ) : (
                requests.outgoing.map(request => (
                  <FriendRequestCard
                    key={request._id}
                    request={request}
                    type="outgoing"
                    onUpdate={loadData}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="suggestions-content">
            <FindFriends onFriendAdded={loadData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;