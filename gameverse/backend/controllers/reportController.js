const Report = require('../models/Report');
const { notificationFactory } = require('./notificationController');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const realtime = require('../realtime');

// @desc    Create a report
// @route   POST /api/reports
// @access  Private
exports.createReport = async (req, res) => {
  try {
    const {
      reportedItemType,
      reportedItem,
      reason,
      description,
      severity = 'medium',
      evidence = []
    } = req.body;

    // Validate required fields
    if (!reportedItemType || !reportedItem || !reason || !description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if user has already reported this item
    const existingReport = await Report.findOne({
      reporter: req.userId,
      reportedItemType,
      reportedItem,
      status: { $in: ['pending', 'under_review'] }
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this item'
      });
    }

    const report = await Report.create({
      reporter: req.userId,
      reportedItemType,
      reportedItem,
      reason,
      description,
      severity,
      evidence
    });

    await report.populate('reporter', 'username profile.avatar');
    await report.populate('reportedItem');

    // Notify admins about new report, persist audit log, and emit realtime event
    console.log(`New report created: ${report._id} by ${req.userId}`);

    try {
      const mapTargetType = (t) => {
        switch ((t || '').toLowerCase()) {
          case 'user': return 'user';
          case 'game': return 'game';
          case 'post': return 'forum_post';
          case 'thread': return 'forum_thread';
          default: return undefined;
        }
      };

      await AuditLog.logAction({
        action: 'report_created',
        performedBy: req.userId,
        targetType: mapTargetType(reportedItemType) || undefined,
        targetId: reportedItem || undefined,
        description: `Report ${report._id} created for ${reportedItemType} ${reportedItem}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || ''
      });

      // Emit to admin room so admin dashboards can update in realtime
      realtime.emitTo('admin_room', 'report.created', {
        reportId: report._id,
        severity,
        reporter: req.userId,
        reportedItemType,
        reportedItem
      });
    } catch (err) {
      console.error('Reporting audit/realtime error:', err);
    }

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: { report }
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating report',
      error: error.message
    });
  }
};

// @desc    Get user's reports
// @route   GET /api/reports/user
// @access  Private
exports.getUserReports = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query = { reporter: req.userId };
    if (status) query.status = status;

    const reports = await Report.find(query)
      .populate('reportedItem')
      .populate('assignedTo', 'username profile.avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      data: {
        reports,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      }
    });
  } catch (error) {
    console.error('Get user reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user reports',
      error: error.message
    });
  }
};

// @desc    Get report by ID
// @route   GET /api/reports/:reportId
// @access  Private
exports.getReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await Report.findById(reportId)
      .populate('reporter', 'username profile.avatar')
      .populate('assignedTo', 'username profile.avatar')
      .populate('resolution.resolvedBy', 'username')
      .populate('reportedItem');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if user is reporter or admin/moderator
    const isReporter = report.reporter._id.toString() === req.userId.toString();
    const user = await User.findById(req.userId);
    const isAdmin = user && ['admin', 'moderator'].includes(user.role);

    if (!isReporter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this report'
      });
    }

    res.json({
      success: true,
      data: { report }
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching report',
      error: error.message
    });
  }
};