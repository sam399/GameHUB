import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import { adminService } from '../services/adminService';
import './AdminAuditLogs.css';

interface AuditLog {
  _id: string;
  action: string;
  description: string;
  performedBy: {
    _id: string;
    username: string;
  };
  targetType?: string;
  targetId?: string;
  ipAddress?: string;
  createdAt: string;
}

const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    performedBy: '',
    targetType: '',
    startDate: '',
    endDate: '',
    search: '',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params: any = {
        limit,
        page,
        ...filters,
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const resp = await adminService.getAuditLogs(params);
      const logsData = resp.data?.logs || [];
      setLogs(logsData);
      setTotalPages(resp.data?.totalPages || 1);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page on filter change
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      performedBy: '',
      targetType: '',
      startDate: '',
      endDate: '',
      search: '',
    });
    setPage(1);
  };

  const getActionBadgeClass = (action: string) => {
    if (action.includes('create')) return 'badge-success';
    if (action.includes('delete') || action.includes('ban')) return 'badge-danger';
    if (action.includes('update')) return 'badge-warning';
    return 'badge-info';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout>
      <div className="admin-audit-logs">
        <div className="logs-header">
          <h2>Audit Logs</h2>
          <p className="logs-subtitle">Track all administrative actions and system events</p>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                placeholder="Search description..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Action Type</label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
              >
                <option value="">All Actions</option>
                <option value="user_created">User Created</option>
                <option value="user_updated">User Updated</option>
                <option value="user_deleted">User Deleted</option>
                <option value="report_assigned">Report Assigned</option>
                <option value="report_resolved">Report Resolved</option>
                <option value="content_moderated">Content Moderated</option>
                <option value="system_config">System Config</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Target Type</label>
              <select
                value={filters.targetType}
                onChange={(e) => handleFilterChange('targetType', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="User">User</option>
                <option value="Report">Report</option>
                <option value="Review">Review</option>
                <option value="ForumThread">Forum Thread</option>
                <option value="ForumPost">Forum Post</option>
                <option value="system">System</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <button onClick={clearFilters} className="btn-clear">
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        {loading ? (
          <div className="loading-state">Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <div className="empty-state">No audit logs found</div>
        ) : (
          <>
            <div className="logs-table-container">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Action</th>
                    <th>Description</th>
                    <th>Performed By</th>
                    <th>Target</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id}>
                      <td className="log-date">{formatDate(log.createdAt)}</td>
                      <td>
                        <span className={`action-badge ${getActionBadgeClass(log.action)}`}>
                          {log.action.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="log-description">{log.description}</td>
                      <td className="log-user">
                        {log.performedBy?.username || 'System'}
                      </td>
                      <td className="log-target">
                        {log.targetType ? (
                          <span className="target-type">{log.targetType}</span>
                        ) : (
                          <span className="text-muted">N/A</span>
                        )}
                      </td>
                      <td className="log-ip">{log.ipAddress || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-page"
              >
                Previous
              </button>
              <span className="page-info">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-page"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAuditLogs;
