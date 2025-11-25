import React from 'react';
import AdminLayout from '../components/admin/AdminLayout';

const AdminModeration: React.FC = () => {
  return (
    <AdminLayout>
      <div className="admin-moderation">
        <h2>Moderation</h2>
        <p>This page can host bulk moderation tools (approve/delete content, bulk user actions).</p>
      </div>
    </AdminLayout>
  );
};

export default AdminModeration;
