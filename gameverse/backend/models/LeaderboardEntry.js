const mongoose = require('mongoose');

const leaderboardEntrySchema = new mongoose.Schema({
  leaderboard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Leaderboard',
    required: [true, 'Leaderboard reference is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score cannot be negative']
  },
  rank: {
    type: Number,
    min: [1, 'Rank must be at least 1']
  },
  metadata: {
    gamesPlayed: Number,
    hoursPlayed: Number,
    achievements: Number,
    reviews: Number,
    forumPosts: Number,
    friends: Number,
    customData: mongoose.Schema.Types.Mixed
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound unique index to prevent duplicate entries
leaderboardEntrySchema.index({ leaderboard: 1, user: 1 }, { unique: true });

// Index for efficient ranking queries
leaderboardEntrySchema.index({ leaderboard: 1, score: -1 });
leaderboardEntrySchema.index({ leaderboard: 1, rank: 1 });

// Pre-save middleware to calculate rank
leaderboardEntrySchema.pre('save', async function(next) {
  if (this.isModified('score')) {
    await this.calculateRank();
  }
  next();
});

// Method to calculate rank
leaderboardEntrySchema.methods.calculateRank = async function() {
  const LeaderboardEntry = mongoose.model('LeaderboardEntry');
  
  const higherScores = await LeaderboardEntry.countDocuments({
    leaderboard: this.leaderboard,
    score: { $gt: this.score },
    isActive: true
  });
  
  this.rank = higherScores + 1;
  
  // Update ranks for entries with same or lower scores
  await LeaderboardEntry.updateMany(
    {
      leaderboard: this.leaderboard,
      score: { $lte: this.score },
      _id: { $ne: this._id },
      isActive: true
    },
    { $inc: { rank: 1 } }
  );
};

// Static method to get leaderboard entries with pagination
leaderboardEntrySchema.statics.getEntries = async function(leaderboardId, page = 1, limit = 20) {
  const entries = await this.find({
    leaderboard: leaderboardId,
    isActive: true
  })
    .populate('user', 'username profile.avatar')
    .sort({ rank: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await this.countDocuments({
    leaderboard: leaderboardId,
    isActive: true
  });

  return {
    entries,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    total
  };
};

// Static method to get user's position in leaderboard
leaderboardEntrySchema.statics.getUserRank = async function(leaderboardId, userId) {
  const entry = await this.findOne({
    leaderboard: leaderboardId,
    user: userId,
    isActive: true
  })
    .populate('user', 'username profile.avatar');

  if (!entry) return null;

  const totalEntries = await this.countDocuments({
    leaderboard: leaderboardId,
    isActive: true
  });

  return {
    entry,
    totalEntries,
    percentile: Math.round((entry.rank / totalEntries) * 100)
  };
};

module.exports = mongoose.model('LeaderboardEntry', leaderboardEntrySchema);