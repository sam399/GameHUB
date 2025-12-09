const User = require('../models/User');
const Game = require('../models/Game');
const Review = require('../models/Review');
const ForumThread = require('../models/ForumThread');
const ForumPost = require('../models/ForumPost');
const Report = require('../models/Report');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');
const realtime = require('../realtime');
const Event = require('../models/Event');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    // Get basic counts
    const [
      totalUsers,
      newUsersToday,
      newUsersThisWeek,
      totalGames,
      totalReviews,
      totalThreads,
      totalPosts,
      pendingReports,
      activeModerators
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ createdAt: { $gte: weekAgo } }),
      Game.countDocuments({ active: true }),
      Review.countDocuments({ isActive: true }),
      ForumThread.countDocuments({ isActive: true }),
      ForumPost.countDocuments({ isActive: true }),
      Report.countDocuments({ status: 'pending', isActive: true }),
      User.countDocuments({ 
        role: { $in: ['moderator', 'admin'] },
        isActive: true 
      })
    ]);

    // Get user growth data for chart
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: monthAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Get content statistics
    const contentStats = await Promise.all([
      Review.aggregate([
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalRatings: { $sum: 1 }
          }
        }
      ]),
      ForumThread.aggregate([
        {
          $group: {
            _id: null,
            averagePosts: { $avg: '$postCount' },
            totalViews: { $sum: '$views' }
          }
        }
      ])
    ]);

    // Get recent activities
    const recentActivities = await AuditLog.find({})
      .populate('performedBy', 'username profile.avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          newUsersToday,
          newUsersThisWeek,
          totalGames,
          totalReviews,
          totalThreads,
          totalPosts,
          pendingReports,
          activeModerators
        },
        userGrowth,
        contentStats: {
          averageRating: contentStats[0][0]?.averageRating || 0,
          totalRatings: contentStats[0][0]?.totalRatings || 0,
          averagePostsPerThread: contentStats[1][0]?.averagePosts || 0,
          totalForumViews: contentStats[1][0]?.totalViews || 0
        },
        recentActivities
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard statistics',
      error: error.message
    });
  }
};

// @desc    Get users with pagination and filters
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'banned') query.isActive = false;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    // Log the action
    await AuditLog.logAction({
      action: 'user_viewed',
      performedBy: req.userId,
      targetType: 'system',
      description: `Admin viewed users list (page ${page})`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: {
        users,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
      error: error.message
    });
  }
};

// @desc    Update user role or status
// @route   PUT /api/admin/users/:userId
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, isActive, adminSettings } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const changes = {};
    
    if (role && ['user', 'moderator', 'admin'].includes(role)) {
      changes.role = role;
    }

    if (typeof isActive === 'boolean') {
      changes.isActive = isActive;
    }

    if (adminSettings) {
      changes.adminSettings = { ...user.adminSettings, ...adminSettings };
    }

    const oldUser = { ...user.toObject() };
    Object.assign(user, changes);
    await user.save();

    // Log the action
    await AuditLog.logAction({
      action: 'user_updated',
      performedBy: req.userId,
      targetType: 'user',
      targetId: userId,
      description: `Admin updated user ${user.username}`,
      changes: {
        before: oldUser,
        after: user.toObject()
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user',
      error: error.message
    });
  }
};

// @desc    Get content reports
// @route   GET /api/admin/reports
// @access  Private/Admin
exports.getReports = async (req, res) => {
  try {
    const reportsData = await Report.getReports(req.query);

    res.json({
      success: true,
      data: reportsData
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reports',
      error: error.message
    });
  }
};

// @desc    Assign report to admin/moderator
// @route   PUT /api/admin/reports/:reportId/assign
// @access  Private/Admin
exports.assignReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { assignedTo } = req.body;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await report.assignTo(assignedTo);

    // Log the action
    await AuditLog.logAction({
      action: 'report_assigned',
      performedBy: req.userId,
      targetType: 'report',
      targetId: reportId,
      description: `Report assigned to moderator`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Emit to admin room so other admin clients can update
    try {
      realtime.emitTo('admin_room', 'report.assigned', { reportId, assignedTo });
    } catch (err) {
      console.error('Realtime emit error (assignReport):', err);
    }

    res.json({
      success: true,
      message: 'Report assigned successfully',
      data: { report }
    });
  } catch (error) {
    console.error('Assign report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while assigning report',
      error: error.message
    });
  }
};

// @desc    Resolve report
// @route   PUT /api/admin/reports/:reportId/resolve
// @access  Private/Admin
exports.resolveReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { action, notes } = req.body;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await report.resolve(action, notes, req.userId);

    // Take action based on resolution
    if (action === 'content_removed') {
      await handleContentRemoval(report);
    } else if (action === 'user_warned') {
      await handleUserWarning(report);
    } else if (action === 'user_suspended') {
      await handleUserSuspension(report);
    } else if (action === 'user_banned') {
      await handleUserBan(report);
    }

    // Log the action
    await AuditLog.logAction({
      action: 'report_resolved',
      performedBy: req.userId,
      targetType: 'report',
      targetId: reportId,
      description: `Report resolved with action: ${action}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Emit to admin room so dashboards update in realtime
    try {
      realtime.emitTo('admin_room', 'report.resolved', { reportId, action, resolver: req.userId });
    } catch (err) {
      console.error('Realtime emit error (resolveReport):', err);
    }

    res.json({
      success: true,
      message: 'Report resolved successfully',
      data: { report }
    });
  } catch (error) {
    console.error('Resolve report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resolving report',
      error: error.message
    });
  }
};

// Helper functions for report resolution actions
const handleContentRemoval = async (report) => {
  const { reportedItemType, reportedItem } = report;
  
  switch (reportedItemType) {
    case 'review':
      await Review.findByIdAndUpdate(reportedItem, { isActive: false });
      break;
    case 'forum_thread':
      await ForumThread.findByIdAndUpdate(reportedItem, { isActive: false });
      break;
    case 'forum_post':
      await ForumPost.findByIdAndUpdate(reportedItem, { isActive: false });
      break;
    // Add other content types as needed
  }
};

const handleUserWarning = async (report) => {
  // Implement user warning logic
  // This could involve sending a notification to the user
};

const handleUserSuspension = async (report) => {
  const reporter = await User.findById(report.reporter);
  if (reporter) {
    // Implement temporary suspension logic
    // This could involve setting a suspension expiration date
  }
};

const handleUserBan = async (report) => {
  const reporter = await User.findById(report.reporter);
  if (reporter) {
    reporter.isActive = false;
    await reporter.save();
  }
};

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
// @access  Private/Admin
exports.getAuditLogs = async (req, res) => {
  try {
    const logsData = await AuditLog.getLogs(req.query);

    res.json({
      success: true,
      data: logsData
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching audit logs',
      error: error.message
    });
  }
};

// @desc    Get system analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // User analytics
    const userAnalytics = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            }
          },
          newUsers: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Content analytics
    const [reviewStats, threadStats, gameStats] = await Promise.all([
      Review.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$createdAt'
                }
              }
            },
            newReviews: { $sum: 1 },
            avgRating: { $avg: '$rating' }
          }
        },
        {
          $sort: { '_id.date': 1 }
        }
      ]),
      ForumThread.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$createdAt'
                }
              }
            },
            newThreads: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.date': 1 }
        }
      ]),
      Game.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$createdAt'
                }
              }
            },
            newGames: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.date': 1 }
        }
      ])
    ]);

    // Report analytics
    const reportAnalytics = await Report.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            }
          },
          newReports: { $sum: 1 },
          resolvedReports: {
            $sum: {
              $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        userAnalytics,
        reviewStats,
        threadStats,
        gameStats,
        reportAnalytics,
        period
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics',
      error: error.message
    });
  }
};

// @desc    Bulk content moderation
// @route   POST /api/admin/moderate/bulk
// @access  Private/Admin
exports.bulkModerate = async (req, res) => {
  try {
    const { action, itemType, itemIds, reason } = req.body;

    if (!action || !itemType || !itemIds || !Array.isArray(itemIds)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request parameters'
      });
    }

    let model;
    switch (itemType) {
      case 'review':
        model = Review;
        break;
      case 'forum_thread':
        model = ForumThread;
        break;
      case 'forum_post':
        model = ForumPost;
        break;
      case 'user':
        model = User;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid item type'
        });
    }

    const updateData = {};
    if (action === 'delete') {
      updateData.isActive = false;
    } else if (action === 'approve') {
      updateData.isActive = true;
    }

    const result = await model.updateMany(
      { _id: { $in: itemIds } },
      { $set: updateData }
    );

    // Log the action
    await AuditLog.logAction({
      action: 'content_moderated',
      performedBy: req.userId,
      targetType: 'system',
      description: `Bulk moderation: ${action} ${itemIds.length} ${itemType}(s)`,
      changes: {
        action,
        itemType,
        itemCount: itemIds.length,
        reason
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: `Successfully ${action}d ${result.modifiedCount} ${itemType}(s)`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Bulk moderate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while performing bulk moderation',
      error: error.message
    });
  }
};

// @desc    Get System Analytics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // 1. Basic Counts (Parallel execution for speed)
    const [userCount, reviewCount, activeEventCount] = await Promise.all([
      User.countDocuments(),
      Review.countDocuments(),
      Event.countDocuments({ status: { $in: ['UPCOMING', 'ONGOING'] } })
    ]);

    // 2. Aggregation: Users joined per month (Last 6 months, grouped by year/month)
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const userGrowthChart = userGrowth.map(item => ({
      month: `${monthNames[item._id.month - 1]} '${String(item._id.year).slice(-2)}`,
      users: item.count
    }));

    // 3. Aggregation: Games per Genre (top 6)
    const genreDistributionAgg = await Game.aggregate([
      { $unwind: '$genre' },
      { $group: { _id: '$genre', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    const genreDistribution = genreDistributionAgg.map(item => ({
      name: item._id,
      value: item.count
    }));

    res.status(200).json({
      success: true,
      data: {
        counts: { users: userCount, reviews: reviewCount, activeEvents: activeEventCount },
        charts: {
          userGrowth: userGrowthChart,
          genreDistribution
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};