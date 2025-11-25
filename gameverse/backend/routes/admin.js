const express = require('express');
const {
  getDashboardStats,
  getUsers,
  updateUser,
  getReports,
  assignReport,
  resolveReport,
  getAuditLogs,
  getAnalytics,
  bulkModerate
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require admin or moderator role
router.use(protect);
router.use(authorize('admin', 'moderator'));

// Dashboard and analytics
router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);

// User management
router.get('/users', getUsers);
router.put('/users/:userId', updateUser);

// Report management
router.get('/reports', getReports);
router.put('/reports/:reportId/assign', assignReport);
router.put('/reports/:reportId/resolve', resolveReport);

// Audit logs
router.get('/audit-logs', getAuditLogs);

// Bulk actions
router.post('/moderate/bulk', bulkModerate);

module.exports = router;