const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: [
      'user_created',
      'user_viewed',
      'user_updated',
      'user_deleted',
      'user_banned',
      'friend_request_sent',
      'friend_request_accepted',
      'friend_request_cancelled',
      'friend_removed',
      'wishlist_privacy_changed',
      'game_created',
      'game_updated',
      'game_deleted',
      'review_created',
      'review_updated',
      'review_deleted',
      'post_created',
      'post_updated',
      'post_deleted',
      'thread_created',
      'thread_updated',
      'thread_deleted',
      'report_created',
      'report_assigned',
      'report_resolved',
      'content_moderated',
      'system_settings_updated'
    ]
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Performed by is required']
  },
  targetType: {
    type: String,
    enum: ['User', 'Game', 'Review', 'ForumThread', 'ForumPost', 'system']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetType'
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  changes: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient querying
auditLogSchema.index({ performedBy: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });

// Static method to log actions
auditLogSchema.statics.logAction = async function(actionData) {
  return await this.create(actionData);
};

// Static method to get logs with filters
auditLogSchema.statics.getLogs = async function(filters = {}) {
  const {
    action,
    performedBy,
    targetType,
    startDate,
    endDate,
    page = 1,
    limit = 50,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = filters;

  const query = {};
  
  if (action) query.action = action;
  if (performedBy) query.performedBy = performedBy;
  if (targetType) query.targetType = targetType;
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const logs = await this.find(query)
    .populate('performedBy', 'username profile.avatar role')
    .populate('targetId')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await this.countDocuments(query);

  return {
    logs,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    total
  };
};

module.exports = mongoose.model('AuditLog', auditLogSchema);