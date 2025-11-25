import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import { adminService } from '../services/adminService';

const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);

  const loadLogs = async () => {
    try {
      const resp = await adminService.getAuditLogs({ limit: 50 });
      const list = resp.data?.logs || resp.logs || resp.data;
      setLogs(list || []);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <AdminLayout>
      <div className="admin-audit-logs">
        <h2>Audit Logs</h2>
        <ul>
          {logs.map((l: any) => (
            <li key={l._id}>{l.action} — {l.description} — by {l.performedBy?.username || l.performedBy}</li>
          ))}
        </ul>
      </div>
    </AdminLayout>
  );
};

export default AdminAuditLogs;
