import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { friendService } from '../services/friendService';
import { Friend, FriendRequest } from '../types';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<{ incoming: FriendRequest[]; outgoing: FriendRequest[] }>({
    incoming: [],
    outgoing: []
  });

  useEffect(() => {
    if (user) {
      loadFriendData();
    }
  }, [user]);

  const loadFriendData = async () => {
    try {
      const [friendsResponse, requestsResponse] = await Promise.all([
        friendService.getFriends(),
        friendService.getFriendRequests()
      ]);

      setFriends(friendsResponse?.data?.friends || []);
      setFriendRequests(requestsResponse?.data || { incoming: [], outgoing: [] });
    } catch (error) {
      console.error('Error loading friend data:', error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-page">
      <h1>User Profile</h1>
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar">
            {user.profile?.avatar ? (
              <img src={user.profile.avatar} alt={user.username} />
            ) : (
              <div className="avatar-placeholder">
                {user.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h2>{user.username}</h2>
            <p className="email">{user.email}</p>
            <p className="role">Role: {user.role}</p>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat">
            <span className="stat-number">{friends.length}</span>
            <span className="stat-label">Friends</span>
          </div>
          <div className="stat">
            <span className="stat-number">{friendRequests.incoming.length}</span>
            <span className="stat-label">Pending Requests</span>
          </div>
        </div>

        <div className="profile-section">
          <h3>Bio</h3>
          <p>{user.profile?.bio || 'No bio yet.'}</p>
        </div>

        <div className="profile-section">
          <h3>Gaming Preferences</h3>
          {user.profile?.gamingPreferences?.length > 0 ? (
            <ul>
              {user.profile.gamingPreferences.map((pref: any, index: number) => (
                <li key={index}>
                  {pref.genre} on {pref.platform}
                </li>
              ))}
            </ul>
          ) : (
            <p>No gaming preferences set.</p>
          )}
        </div>

        <div className="profile-section">
          <h3>Connected Accounts</h3>
          <div className="connected-accounts">
            <div>Steam: {user.connectedAccounts?.steam || 'Not connected'}</div>
            <div>Epic Games: {user.connectedAccounts?.epic || 'Not connected'}</div>
            <div>Xbox: {user.connectedAccounts?.xbox || 'Not connected'}</div>
            <div>PlayStation: {user.connectedAccounts?.playstation || 'Not connected'}</div>
          </div>
        </div>

        <div className="profile-section">
          <div className="section-header">
            <h3>Friends</h3>
            <Link to="/friends" className="view-all">View All</Link>
          </div>
          {friends.length === 0 ? (
            <p>No friends yet. <Link to="/friends">Find friends</Link> to start building your network.</p>
          ) : (
            <div className="friends-preview">
              {friends.slice(0, 6).map(friend => (
                <div key={friend.user._id} className="friend-preview">
                  <div className="friend-avatar">
                    {friend.user.profile?.avatar ? (
                      <img src={friend.user.profile.avatar} alt={friend.user.username} />
                    ) : (
                      <div className="avatar-placeholder">
                        {friend.user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="friend-name">{friend.user.username}</span>
                </div>
              ))}
              {friends.length > 6 && (
                <div className="more-friends">
                  +{friends.length - 6} more
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;