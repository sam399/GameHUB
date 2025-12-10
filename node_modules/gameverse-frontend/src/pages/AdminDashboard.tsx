import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import { useSocket } from '../contexts/SocketContext';
import AdminLayout from '../components/admin/AdminLayout';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const { socket } = useSocket();

  const loadStats = async () => {
    try {
      const resp = await adminService.getDashboardStats();
      setStats(resp.data || resp);
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onReportCreated = (data: any) => {
      console.log('Admin dashboard: report.created', data);
      loadStats();
    };

    socket.on('report.created', onReportCreated);
    return () => {
      socket.off('report.created', onReportCreated);
    };
  }, [socket]);

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <h2>🎮 Command Center</h2>
        <div className="admin-links">
          <Link to="/admin/users">Manage Users</Link>
          <Link to="/admin/reports">View Reports</Link>
          <Link to="/admin/analytics">Analytics</Link>
          <Link to="/admin/audit-logs">Audit Logs</Link>
        </div>
        {!stats && <p>Loading stats...</p>}
        {stats && (
          <div>
            <p><strong>Users:</strong> {stats.usersCount ?? stats.data?.overview?.totalUsers ?? stats.data?.usersCount}</p>
            <p><strong>Active Reports:</strong> {stats.reportsCount ?? stats.data?.overview?.pendingReports ?? stats.data?.reportsCount}</p>
            <p><strong>Open Moderation Tasks:</strong> {stats.openTasks ?? stats.data?.overview?.openTasks ?? stats.data?.openTasks}</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
