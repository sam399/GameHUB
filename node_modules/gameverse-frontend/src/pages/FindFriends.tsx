import React, { useState, useEffect } from 'react';
import { UserWithFriendship } from '../types';
import { friendService } from '../services/friendService';
import UserSearchCard from '../components/friends/UserSearchCard';

interface FindFriendsProps {
  onFriendAdded?: () => void;
}

const FindFriends: React.FC<FindFriendsProps> = ({ onFriendAdded }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserWithFriendship[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsers();
    } else {
      setUsers([]);
      setShowSuggestions(true);
    }
  }, [searchQuery]);

  const loadSuggestions = async () => {
    try {
      const response = await friendService.getFriendSuggestions();
      setSuggestions(response.data.suggestions as any[]);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const searchUsers = async () => {
    setLoading(true);
    try {
      const response = await friendService.searchUsers(searchQuery);
      setUsers(response.data.users);
      setShowSuggestions(false);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserUpdate = () => {
    onFriendAdded?.();
    if (searchQuery.trim()) {
      searchUsers();
    } else {
      loadSuggestions();
    }
  };

  return (
    <div className="find-friends">
      <div className="search-section">
        <h3>Find Friends</h3>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by username or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {loading && <div className="search-loading">Searching...</div>}
        </div>
      </div>

      <div className="users-results">
        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions-section">
            <h4>Friend Suggestions</h4>
            {suggestions.map(user => (
              <UserSearchCard
                key={user._id}
                user={user}
                onUpdate={handleUserUpdate}
              />
            ))}
          </div>
        )}

        {!showSuggestions && (
          <div className="search-results">
            <h4>
              {users.length > 0 
                ? `Found ${users.length} users` 
                : 'No users found'
              }
            </h4>
            {users.map(user => (
              <UserSearchCard
                key={user._id}
                user={user}
                onUpdate={handleUserUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindFriends;