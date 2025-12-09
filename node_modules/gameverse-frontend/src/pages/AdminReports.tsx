import React, { useEffect, useMemo, useState } from 'react';
import { adminService } from '../services/adminService';
import { useSocket } from '../contexts/SocketContext';
import AdminLayout from '../components/admin/AdminLayout';
import { Link } from 'react-router-dom';

const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [moderators, setModerators] = useState<any[]>([]);
  const [selectedModerator, setSelectedModerator] = useState<string>('');
  const [resolutionAction, setResolutionAction] = useState<string>('content_removed');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const { socket } = useSocket();

  const loadReports = async () => {
    try {
      const resp = await adminService.getReports({ limit: 50 });
      const list = resp.data?.reports || [];
      setReports(list || []);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  const loadModerators = async () => {
    try {
      const resp = await adminService.getUsers({ role: 'moderator', limit: 100 });
      const list = resp.data?.users || [];
      setModerators(list);
      if (list.length && !selectedModerator) {
        setSelectedModerator(list[0]._id);
      }
    } catch (err) {
      console.error('Failed to load moderators', err);
    }
  };

  useEffect(() => {
    loadReports();
    loadModerators();
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

  const statusBadge = useMemo(() => {
    return (status: string) => {
      const cls = status === 'resolved' ? 'status-resolved' : status === 'assigned' ? 'status-assigned' : 'status-pending';
      return <span className={`badge ${cls}`}>{status}</span>;
    };
  }, []);

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
          <div className="report-list">
            {reports.map((r: any) => (
              <div className="report-card" key={r._id}>
                <div className="report-head">
                  <div>
                    <strong>{r.reason}</strong> — {r.severity} {statusBadge(r.status)}
                    <div className="muted">Reporter: {r.reporter?.username || r.reporter}</div>
                    {r.assignedTo && <div className="muted">Assigned to: {r.assignedTo?.username || r.assignedTo}</div>}
                  </div>
                  <div className="muted">Created: {new Date(r.createdAt).toLocaleString()}</div>
                </div>

                <div className="report-actions">
                  <div className="inline-form">
                    <label>Assign to moderator</label>
                    <select
                      value={selectedModerator}
                      onChange={(e) => setSelectedModerator(e.target.value)}
                      disabled={!moderators.length || assigningId === r._id}
                    >
                      {!moderators.length && <option value="">No moderators found</option>}
                      {moderators.map((m) => (
                        <option key={m._id} value={m._id}>{m.username}</option>
                      ))}
                    </select>
                    <button
                      disabled={!selectedModerator || assigningId === r._id}
                      onClick={async () => {
                        if (!selectedModerator) return;
                        setAssigningId(r._id);
                        try {
                          await adminService.assignReport(r._id, selectedModerator);
                          await loadReports();
                        } catch (err) {
                          console.error('Assign failed', err);
                          alert('Assign failed');
                        } finally {
                          setAssigningId(null);
                        }
                      }}
                    >
                      {assigningId === r._id ? 'Assigning...' : 'Assign'}
                    </button>
                  </div>

                  <div className="inline-form">
                    <label>Resolve</label>
                    <select
                      value={resolutionAction}
                      onChange={(e) => setResolutionAction(e.target.value)}
                      disabled={resolvingId === r._id}
                    >
                      <option value="content_removed">Content Removed</option>
                      <option value="user_warned">User Warned</option>
                      <option value="user_suspended">User Suspended</option>
                      <option value="user_banned">User Banned</option>
                      <option value="dismissed">Dismissed</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Notes (optional)"
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      disabled={resolvingId === r._id}
                    />
                    <button
                      disabled={resolvingId === r._id}
                      onClick={async () => {
                        setResolvingId(r._id);
                        try {
                          await adminService.resolveReport(r._id, { action: resolutionAction, notes: resolutionNotes });
                          setResolutionNotes('');
                          await loadReports();
                        } catch (err) {
                          console.error('Resolve failed', err);
                          alert('Resolve failed');
                        } finally {
                          setResolvingId(null);
                        }
                      }}
                    >
                      {resolvingId === r._id ? 'Resolving...' : 'Resolve'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
