import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import AdminLayout from '../components/admin/AdminLayout';
import { Link } from 'react-router-dom';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const resp = await adminService.getUsers({ limit: 50 });
      const list = resp.data?.users || [];
      setUsers(list || []);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <AdminLayout>
      <div className="admin-users">
        <h2>Admin — Users</h2>
        <div className="admin-links">
          <Link to="/admin/dashboard">← Back to Command Center</Link>
          <Link to="/admin/reports">View Reports</Link>
        </div>
        {loading && <p>Loading users...</p>}
        {!loading && (
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u._id}>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.isActive ? 'Active' : 'Disabled'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
