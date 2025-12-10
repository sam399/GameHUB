import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { friendService } from '../services/friendService';
import { wishlistService } from '../services/wishlistService';
import WishlistPrivacyToggle from '../components/wishlist/WishlistPrivacyToggle';
import TwoFactorSetup from '../components/profile/TwoFactorSetup';
import { Friend, FriendRequest } from '../types';
import { useSocket } from '../contexts/SocketContext';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<{ incoming: FriendRequest[]; outgoing: FriendRequest[] }>({
    incoming: [],
    outgoing: []
  });
  const [loading, setLoading] = useState(false);
  const [isWishlistPublic, setIsWishlistPublic] = useState<boolean | null>(null);
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const { refreshNotifications } = useSocket();

  useEffect(() => {
    if (user) {
      loadFriendData();
      loadWishlistPrivacy();
    }
  }, [user]);

  const loadWishlistPrivacy = async () => {
    try {
      setPrivacyLoading(true);
      const res = await wishlistService.getWishlist();
      // service returns an object where the API body is in `res.data`
      const wishlist = res?.data?.wishlist;
      setIsWishlistPublic(wishlist?.isPublic ?? true);
    } catch (error) {
      console.error('Error loading wishlist privacy:', error);
      setIsWishlistPublic(null);
    } finally {
      setPrivacyLoading(false);
    }
  };

  const loadFriendData = async () => {
    try {
      setLoading(true);
      const [friendsResponse, requestsResponse] = await Promise.all([
        friendService.getFriends(),
        friendService.getFriendRequests()
      ]);

      setFriends(friendsResponse?.data?.friends || []);
      setFriendRequests(requestsResponse?.data || { incoming: [], outgoing: [] });
    } catch (error) {
      console.error('Error loading friend data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      await friendService.acceptFriendRequest(requestId);
      await loadFriendData();
      try { await refreshNotifications(); } catch (e) { /* ignore */ }
    } catch (err) {
      console.error('Failed to accept friend request', err);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await friendService.rejectFriendRequest(requestId);
      await loadFriendData();
      try { await refreshNotifications(); } catch (e) { /* ignore */ }
    } catch (err) {
      console.error('Failed to reject friend request', err);
    }
  };

  const handleCancel = async (requestId: string) => {
    try {
      await friendService.cancelFriendRequest(requestId);
      await loadFriendData();
      try { await refreshNotifications(); } catch (e) { /* ignore */ }
    } catch (err) {
      console.error('Failed to cancel friend request', err);
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
          <h3>Friend Requests</h3>
          <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <h4>Incoming</h4>
              {loading ? <div>Loading...</div> : (
                friendRequests.incoming.length === 0 ? <div>No incoming requests</div> : (
                  <div>
                    {friendRequests.incoming.map(req => (
                      <div key={req._id} style={{ display: 'flex', justifyContent: 'space-between', padding: 8, borderBottom: '1px solid #eee' }}>
                        <div>
                          <strong>{req.from?.username || 'Unknown'}</strong>
                          <div style={{ fontSize: 12, color: '#666' }}>{req.createdAt ? new Date(req.createdAt).toLocaleString() : ''}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={async () => { await handleAccept(req._id); }} style={{ background: '#0b8', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 4 }}>Accept</button>
                          <button onClick={async () => { await handleReject(req._id); }} style={{ background: '#eee', border: 'none', padding: '6px 10px', borderRadius: 4 }}>Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

            <div style={{ flex: 1 }}>
              <h4>Outgoing</h4>
              {loading ? <div>Loading...</div> : (
                friendRequests.outgoing.length === 0 ? <div>No outgoing requests</div> : (
                  <div>
                    {friendRequests.outgoing.map(req => (
                      <div key={req._id} style={{ display: 'flex', justifyContent: 'space-between', padding: 8, borderBottom: '1px solid #eee' }}>
                        <div>
                          <strong>{req.to?.username || 'Unknown'}</strong>
                          <div style={{ fontSize: 12, color: '#666' }}>{req.createdAt ? new Date(req.createdAt).toLocaleString() : ''}</div>
                        </div>
                        <div>
                          <button onClick={async () => { await handleCancel(req._id); }} style={{ background: '#f66', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 4 }}>Cancel</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
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
          <h3>Wishlist</h3>
          {/* Extracted wishlist privacy toggle into a small component */}
          {/* @ts-ignore - dynamic import / no default export typing issues avoided by direct import */}
          <WishlistPrivacyToggle userId={user._id} />
        </div>

        <div className="profile-section">
          <h3>Security Settings</h3>
          <TwoFactorSetup />
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