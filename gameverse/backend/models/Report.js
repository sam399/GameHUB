const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Report must have a reporter']
  },
  reportedItemType: {
    type: String,
    required: [true, 'Report type is required'],
    enum: ['user', 'game', 'review', 'forum_thread', 'forum_post', 'message']
  },
  reportedItem: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Reported item is required'],
    refPath: 'reportedItemType'
  },
  reason: {
    type: String,
    required: [true, 'Report reason is required'],
    enum: [
      'spam',
      'harassment',
      'inappropriate_content',
      'false_information',
      'hate_speech',
      'other'
    ]
  },
  description: {
    type: String,
    required: [true, 'Report description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'resolved', 'dismissed'],
    default: 'pending'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolution: {
    action: {
      type: String,
      enum: [
        'content_removed',
        'user_warned',
        'user_suspended',
        'user_banned',
        'no_action',
        'other'
      ]
    },
    notes: {
      type: String,
      maxlength: [1000, 'Resolution notes cannot exceed 1000 characters']
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: {
      type: Date
    }
  },
  evidence: [{
    type: {
      type: String,
      enum: ['screenshot', 'text', 'link']
    },
    content: String,
    description: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reportedItemType: 1, reportedItem: 1 });
reportSchema.index({ reporter: 1 });

// Static method to get reports with filters
reportSchema.statics.getReports = async function(filters = {}) {
  const {
    status,
    severity,
    reportedItemType,
    assignedTo,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = filters;

  const query = { isActive: true };
  
  if (status) query.status = status;
  if (severity) query.severity = severity;
  if (reportedItemType) query.reportedItemType = reportedItemType;
  if (assignedTo) query.assignedTo = assignedTo;

  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const reports = await this.find(query)
    .populate('reporter', 'username profile.avatar')
    .populate('assignedTo', 'username profile.avatar')
    .populate('resolution.resolvedBy', 'username')
    .populate('reportedItem')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await this.countDocuments(query);

  return {
    reports,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    total
  };
};

// Method to assign report to admin/moderator
reportSchema.methods.assignTo = async function(adminId) {
  this.assignedTo = adminId;
  this.status = 'under_review';
  return await this.save();
};

// Method to resolve report
reportSchema.methods.resolve = async function(action, notes, resolvedBy) {
  this.status = 'resolved';
  this.resolution = {
    action,
    notes,
    resolvedBy,
    resolvedAt: new Date()
  };
  return await this.save();
};

module.exports = mongoose.model('Report', reportSchema);