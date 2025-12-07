const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Leaderboard name is required'],
    unique: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  type: {
    type: String,
    required: [true, 'Leaderboard type is required'],
    enum: ['global', 'game_specific', 'weekly', 'monthly', 'event']
  },
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: function() {
      return this.type === 'game_specific';
    }
  },
  metric: {
    type: String,
    required: [true, 'Metric is required'],
    enum: ['games_played', 'hours_played', 'achievements', 'review_count', 'forum_posts', 'friends_count', 'custom']
  },
  customMetric: {
    name: String,
    calculation: String // Could be a formula or description
  },
  scoringType: {
    type: String,
    required: [true, 'Scoring type is required'],
    enum: ['highest', 'lowest', 'accumulative'],
    default: 'highest'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  maxEntries: {
    type: Number,
    default: 100,
    min: [10, 'Maximum entries must be at least 10'],
    max: [1000, 'Maximum entries cannot exceed 1000']
  },
  refreshInterval: {
    type: String,
    enum: ['realtime', 'hourly', 'daily', 'weekly', 'manual'],
    default: 'daily'
  },
  lastRefreshed: {
    type: Date,
    default: Date.now
  },
  icon: {
    type: String,
    default: '🏆'
  },
  color: {
    type: String,
    default: '#667eea'
  }
}, {
  timestamps: true
});

// Index for efficient querying
leaderboardSchema.index({ type: 1, isActive: 1 });
leaderboardSchema.index({ game: 1, type: 1 });
leaderboardSchema.index({ startDate: 1, endDate: 1 });

// Method to check if leaderboard is currently active
leaderboardSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  if (!this.isActive) return false;
  if (this.startDate && now < this.startDate) return false;
  if (this.endDate && now > this.endDate) return false;
  return true;
};

// Static method to get active leaderboards
leaderboardSchema.statics.getActiveLeaderboards = async function(filters = {}) {
  const now = new Date();
  
  const query = {
    isActive: true,
    isPublic: true,
    startDate: { $lte: now },
    $or: [
      { endDate: { $exists: false } },
      { endDate: { $gte: now } }
    ]
  };

  if (filters.type) query.type = filters.type;
  if (filters.game) query.game = filters.game;

  return await this.find(query)
    .populate('game', 'title images.cover')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Leaderboard', leaderboardSchema);