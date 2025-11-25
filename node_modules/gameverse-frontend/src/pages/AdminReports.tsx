import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import { useSocket } from '../contexts/SocketContext';
import AdminLayout from '../components/admin/AdminLayout';
import { Link } from 'react-router-dom';

const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const loadReports = async () => {
    try {
      const resp = await adminService.getReports({ limit: 50 });
      const list = resp.data?.reports || resp.reports || resp.data;
      setReports(list || []);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onReportCreated = (data: any) => {
      console.log('AdminReports: report.created', data);
      loadReports();
    };

    const onReportAssigned = (data: any) => {
      console.log('AdminReports: report.assigned', data);
      loadReports();
    };

    const onReportResolved = (data: any) => {
      console.log('AdminReports: report.resolved', data);
      loadReports();
    };

    socket.on('report.created', onReportCreated);
    socket.on('report.assigned', onReportAssigned);
    socket.on('report.resolved', onReportResolved);

    return () => {
      socket.off('report.created', onReportCreated);
      socket.off('report.assigned', onReportAssigned);
      socket.off('report.resolved', onReportResolved);
    };
  }, [socket]);

  return (
    <AdminLayout>
      <div className="admin-reports">
        <h2>Admin — Reports</h2>
        <div className="admin-links">
          <Link to="/admin/dashboard">Back to Dashboard</Link>
          <Link to="/admin/users">Manage Users</Link>
        </div>
        {loading && <p>Loading reports...</p>}
        {!loading && (
          <ul>
            {reports.map((r: any) => (
              <li key={r._id}>
                <div className="admin-report-meta">
                  <strong>{r.reason}</strong> — {r.severity} — status: {r.status}
                  <div>Reporter: {r.reporter?.username || r.reporter}</div>
                </div>
                <div className="admin-report-actions">
                  <button onClick={async () => {
                    const assignedTo = window.prompt('Assign to userId (enter user id):');
                    if (!assignedTo) return;
                    try {
                      await adminService.assignReport(r._id, assignedTo);
                      alert('Assigned');
                      loadReports();
                    } catch (err) {
                      console.error('Assign failed', err);
                      alert('Assign failed');
                    }
                  }}>Assign</button>
                  <button onClick={async () => {
                    const action = window.prompt('Resolution action (content_removed, user_warned, user_suspended, user_banned):');
                    if (!action) return;
                    const notes = window.prompt('Notes (optional):') || '';
                    try {
                      await adminService.resolveReport(r._id, { action, notes });
                      alert('Resolved');
                      loadReports();
                    } catch (err) {
                      console.error('Resolve failed', err);
                      alert('Resolve failed');
                    }
                  }}>Resolve</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
