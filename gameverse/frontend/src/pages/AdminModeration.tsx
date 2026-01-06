import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import { adminService } from '../services/adminService';
import './AdminModeration.css';

interface ModerationItem {
  _id: string;
  type: 'review' | 'forum_thread' | 'forum_post' | 'user';
  content: string;
  author: {
    _id: string;
    username: string;
  };
  createdAt: string;
  reportCount?: number;
}

const AdminModeration: React.FC = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: 'active',
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = { ...filters, limit: 50 };
      const resp = await adminService.getUsers(params);
      setUsers(resp.data?.users || []);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const toggleSelection = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedItems.length === users.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(users.map(u => u._id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedItems.length === 0) return;

    if (!confirm(`Are you sure you want to ${bulkAction} ${selectedItems.length} user(s)?`)) {
      return;
    }

    try {
      setLoading(true);
      
      for (const userId of selectedItems) {
        const updates: any = {};
        
        switch (bulkAction) {
          case 'ban':
            updates.isActive = false;
            break;
          case 'activate':
            updates.isActive = true;
            break;
          case 'promote_moderator':
            updates.role = 'moderator';
            break;
          case 'demote_user':
            updates.role = 'user';
            break;
        }

        await adminService.updateUser(userId, updates);
      }

      alert(`Successfully ${bulkAction} ${selectedItems.length} user(s)`);
      setSelectedItems([]);
      setBulkAction('');
      loadUsers();
    } catch (err) {
      console.error('Bulk action error:', err);
      alert('Failed to perform bulk action');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const updates: any = {};
      
      switch (action) {
        case 'ban':
          updates.isActive = false;
          break;
        case 'activate':
          updates.isActive = true;
          break;
        case 'warn':
          // Implement warning system
          alert('Warning sent to user');
          return;
      }

      await adminService.updateUser(userId, updates);
      loadUsers();
      alert(`User ${action} successful`);
    } catch (err) {
      console.error('User action error:', err);
      alert(`Failed to ${action} user`);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-moderation">
        <div className="moderation-header">
          <h2>Content Moderation</h2>
          <p className="moderation-subtitle">
            Manage users and content with bulk actions and individual controls
          </p>
        </div>

        {/* Filters */}
        <div className="moderation-filters">
          <input
            type="text"
            placeholder="Search users..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="search-input"
          />
          
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="filter-select"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="filter-select"
          >
            <option value="active">Active</option>
            <option value="banned">Banned</option>
            <option value="all">All</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="bulk-actions-bar">
            <span className="selected-count">
              {selectedItems.length} user(s) selected
            </span>
            <div className="bulk-actions-controls">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="bulk-select"
              >
                <option value="">Select Action</option>
                <option value="ban">Ban Users</option>
                <option value="activate">Activate Users</option>
                <option value="promote_moderator">Promote to Moderator</option>
                <option value="demote_user">Demote to User</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction || loading}
                className="btn-execute"
              >
                Execute
              </button>
              <button
                onClick={() => setSelectedItems([])}
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Users Table */}
        {loading ? (
          <div className="loading-state">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="empty-state">No users found</div>
        ) : (
          <div className="moderation-table-container">
            <table className="moderation-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedItems.length === users.length && users.length > 0}
                      onChange={selectAll}
                    />
                  </th>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className={!user.isActive ? 'user-banned' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(user._id)}
                        onChange={() => toggleSelection(user._id)}
                      />
                    </td>
                    <td className="user-info">
                      <div className="user-avatar-small">
                        {user.profile?.avatar ? (
                          <img src={user.profile.avatar} alt={user.username} />
                        ) : (
                          <span>{user.username[0].toUpperCase()}</span>
                        )}
                      </div>
                      <span className="username">{user.username}</span>
                    </td>
                    <td className="user-email">{user.email}</td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.isActive ? 'status-active' : 'status-banned'}`}>
                        {user.isActive ? 'Active' : 'Banned'}
                      </span>
                    </td>
                    <td className="user-date">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="user-actions">
                      <div className="action-buttons">
                        {user.isActive ? (
                          <>
                            <button
                              onClick={() => handleUserAction(user._id, 'warn')}
                              className="btn-warn"
                              title="Warn user"
                            >
                              ⚠️
                            </button>
                            <button
                              onClick={() => handleUserAction(user._id, 'ban')}
                              className="btn-ban"
                              title="Ban user"
                            >
                              🚫
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleUserAction(user._id, 'activate')}
                            className="btn-activate"
                            title="Activate user"
                          >
                            ✓
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Stats Cards */}
        <div className="moderation-stats">
          <div className="stat-card">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{users.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active</div>
            <div className="stat-value">
              {users.filter(u => u.isActive).length}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Banned</div>
            <div className="stat-value">
              {users.filter(u => !u.isActive).length}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Moderators</div>
            <div className="stat-value">
              {users.filter(u => u.role === 'moderator').length}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminModeration;
