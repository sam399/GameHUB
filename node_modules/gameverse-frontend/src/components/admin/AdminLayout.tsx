import React from 'react';
import { Link } from 'react-router-dom';
import './admin.css';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <h3>Admin</h3>
        <nav>
          <ul>
            <li><Link to="/admin/dashboard">Dashboard</Link></li>
            <li><Link to="/admin/users">Users</Link></li>
            <li><Link to="/admin/reports">Reports</Link></li>
            <li><Link to="/admin/audit-logs">Audit Logs</Link></li>
            <li><Link to="/admin/moderation">Moderation</Link></li>
          </ul>
        </nav>
      </aside>
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
