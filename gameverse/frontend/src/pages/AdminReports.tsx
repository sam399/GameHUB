import React, { useEffect, useMemo, useState } from 'react';
import { adminService } from '../services/adminService';
import { useSocket } from '../contexts/SocketContext';
import AdminLayout from '../components/admin/AdminLayout';
import { Link } from 'react-router-dom';
import './AdminReports.css';

const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [moderators, setModerators] = useState<any[]>([]);
  const [selectedModerator, setSelectedModerator] = useState<string>('');
  const [resolutionAction, setResolutionAction] = useState<string>('content_removed');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: 'pending',
    severity: '',
    search: '',
  });
  const { socket } = useSocket();

  const loadReports = async () => {
    setLoading(true);
    try {
      const resp = await adminService.getReports({ 
        page, 
        limit: 20,
        status: filters.status || undefined,
        severity: filters.severity || undefined,
      });
      setReports(resp.data?.reports || []);
      setTotalPages(resp.data?.totalPages || 1);
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
  }, [page, filters]);

  useEffect(() => {
    if (!socket) return;

    const onReportCreated = () => loadReports();
    const onReportAssigned = () => loadReports();
    const onReportResolved = () => loadReports();

    socket.on('report.created', onReportCreated);
    socket.on('report.assigned', onReportAssigned);
    socket.on('report.resolved', onReportResolved);

    return () => {
      socket.off('report.created', onReportCreated);
      socket.off('report.assigned', onReportAssigned);
      socket.off('report.resolved', onReportResolved);
    };
  }, [socket]);

  const stats = useMemo(() => {
    return {
      total: reports.length,
      pending: reports.filter(r => r.status === 'pending').length,
      assigned: reports.filter(r => r.status === 'assigned').length,
      resolved: reports.filter(r => r.status === 'resolved').length,
      critical: reports.filter(r => r.severity === 'critical').length,
    };
  }, [reports]);

  const statusBadge = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: 'status-pending',
      assigned: 'status-assigned',
      resolved: 'status-resolved',
    };
    return <span className={`badge ${statusMap[status] || 'status-pending'}`}>{status}</span>;
  };

  const severityBadge = (severity: string) => {
    const severityMap: { [key: string]: string } = {
      low: 'severity-low',
      medium: 'severity-medium',
      high: 'severity-high',
      critical: 'severity-critical',
    };
    return <span className={`severity-badge ${severityMap[severity] || 'severity-low'}`}>{severity}</span>;
  };

  return (
    <AdminLayout>
      <div className='admin-reports'>
        <div className='reports-header'>
          <h2>Content Reports Queue</h2>
          <p className='reports-subtitle'>Review and manage user reports about inappropriate content or behavior</p>
        </div>

        {/* Stats Cards */}
        <div className='reports-stats'>
          <div className='stat-card'>
            <div className='stat-label'>Total Reports</div>
            <div className='stat-value'>{stats.total}</div>
          </div>
          <div className='stat-card pending'>
            <div className='stat-label'>Pending</div>
            <div className='stat-value'>{stats.pending}</div>
          </div>
          <div className='stat-card assigned'>
            <div className='stat-label'>Assigned</div>
            <div className='stat-value'>{stats.assigned}</div>
          </div>
          <div className='stat-card resolved'>
            <div className='stat-label'>Resolved</div>
            <div className='stat-value'>{stats.resolved}</div>
          </div>
          <div className='stat-card critical'>
            <div className='stat-label'>Critical</div>
            <div className='stat-value'>{stats.critical}</div>
          </div>
        </div>

        {/* Filters */}
        <div className='reports-filters'>
          <div className='filter-group'>
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value });
                setPage(1);
              }}
              className='filter-select'
            >
              <option value=''>All</option>
              <option value='pending'>Pending</option>
              <option value='assigned'>Assigned</option>
              <option value='resolved'>Resolved</option>
            </select>
          </div>

          <div className='filter-group'>
            <label>Severity</label>
            <select
              value={filters.severity}
              onChange={(e) => {
                setFilters({ ...filters, severity: e.target.value });
                setPage(1);
              }}
              className='filter-select'
            >
              <option value=''>All</option>
              <option value='low'>Low</option>
              <option value='medium'>Medium</option>
              <option value='high'>High</option>
              <option value='critical'>Critical</option>
            </select>
          </div>

          <div className='filter-group'>
            <label>Search</label>
            <input
              type='text'
              placeholder='Search reason...'
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
                setPage(1);
              }}
              className='filter-input'
            />
          </div>
        </div>

        {/* Reports List */}
        {loading ? (
          <div className='loading-state'>Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className='empty-state'>No reports found</div>
        ) : (
          <>
            <div className='report-list'>
              {reports.map((r: any) => (
                <div className='report-card' key={r._id} data-status={r.status}>
                  <div className='report-head'>
                    <div className='report-title-section'>
                      <strong>{r.reason}</strong>
                      {severityBadge(r.severity)}
                      {statusBadge(r.status)}
                    </div>
                    <div className='report-date'>{new Date(r.createdAt).toLocaleString()}</div>
                  </div>

                  <div className='report-meta'>
                    <div className='meta-item'>
                      <span className='label'>Reporter:</span>
                      <span className='value'>{r.reporter?.username || 'Anonymous'}</span>
                    </div>
                    {r.assignedTo && (
                      <div className='meta-item'>
                        <span className='label'>Assigned to:</span>
                        <span className='value'>{r.assignedTo?.username || 'Moderator'}</span>
                      </div>
                    )}
                    {r.reportedItemType && (
                      <div className='meta-item'>
                        <span className='label'>Type:</span>
                        <span className='value'>{r.reportedItemType}</span>
                      </div>
                    )}
                  </div>

                  {r.description && (
                    <div className='report-description'>
                      <strong>Description:</strong>
                      <p>{r.description}</p>
                    </div>
                  )}

                  <div className='report-actions'>
                    {r.status === 'pending' && (
                      <div className='action-group'>
                        <label>Assign to moderator</label>
                        <div className='action-controls'>
                          <select
                            value={selectedModerator}
                            onChange={(e) => setSelectedModerator(e.target.value)}
                            disabled={!moderators.length || assigningId === r._id}
                            className='action-select'
                          >
                            {!moderators.length && <option value=''>No moderators found</option>}
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
                                alert('Failed to assign report');
                              } finally {
                                setAssigningId(null);
                              }
                            }}
                            className='btn-action btn-primary'
                          >
                            {assigningId === r._id ? 'Assigning...' : 'Assign'}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className='action-group'>
                      <label>Resolve Report</label>
                      <div className='action-controls'>
                        <select
                          value={resolutionAction}
                          onChange={(e) => setResolutionAction(e.target.value)}
                          disabled={resolvingId === r._id}
                          className='action-select'
                        >
                          <option value='content_removed'>Content Removed</option>
                          <option value='user_warned'>User Warned</option>
                          <option value='user_suspended'>User Suspended</option>
                          <option value='user_banned'>User Banned</option>
                          <option value='dismissed'>Dismissed</option>
                        </select>
                        <input
                          type='text'
                          placeholder='Notes (optional)'
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          disabled={resolvingId === r._id}
                          className='action-input'
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
                              alert('Failed to resolve report');
                            } finally {
                              setResolvingId(null);
                            }
                          }}
                          className='btn-action btn-success'
                        >
                          {resolvingId === r._id ? 'Resolving...' : 'Resolve'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className='pagination'>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className='btn-page'
              >
                Previous
              </button>
              <span className='page-info'>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className='btn-page'
              >
                Next
              </button>
            </div>
          </>
        )}

        <div className='admin-links'>
          <Link to='/admin/dashboard'>← Back to Command Center</Link>
          <Link to='/admin/users'>Manage Users</Link>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
