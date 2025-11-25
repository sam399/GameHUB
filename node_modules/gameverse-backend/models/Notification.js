const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Notification must belong to a user'],
    index: true
  },
  type: {
    type: String,
    required: [true, 'Notification type is required']
  },
  title: {
    type: String,
    maxlength: 100
  },
  message: {
    type: String,
    maxlength: 500
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Default expiration helper (30 days)
notificationSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    this.expiresAt = d;
  }
  next();
});

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

notificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  await this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);