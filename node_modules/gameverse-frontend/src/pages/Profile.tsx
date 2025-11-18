import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-page">
      <h1>User Profile</h1>
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar">
            {user.profile.avatar ? (
              <img src={user.profile.avatar} alt={user.username} />
            ) : (
              <div className="avatar-placeholder">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h2>{user.username}</h2>
            <p className="email">{user.email}</p>
            <p className="role">Role: {user.role}</p>
          </div>
        </div>
        
        <div className="profile-section">
          <h3>Bio</h3>
          <p>{user.profile.bio || 'No bio yet.'}</p>
        </div>

        <div className="profile-section">
          <h3>Gaming Preferences</h3>
          {user.profile.gamingPreferences.length > 0 ? (
            <ul>
              {user.profile.gamingPreferences.map((pref, index) => (
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
            <div>Steam: {user.connectedAccounts.steam || 'Not connected'}</div>
            <div>Epic Games: {user.connectedAccounts.epic || 'Not connected'}</div>
            <div>Xbox: {user.connectedAccounts.xbox || 'Not connected'}</div>
            <div>PlayStation: {user.connectedAccounts.playstation || 'Not connected'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;