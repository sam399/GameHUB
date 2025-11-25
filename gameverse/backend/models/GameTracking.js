const mongoose = require('mongoose');

const gameTrackingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Game tracking must belong to a user']
  },
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: [true, 'Game tracking must have a game']
  },
  status: {
    type: String,
    enum: ['playing', 'completed', 'paused', 'dropped', 'planning'],
    default: 'planning',
    required: [true, 'Status is required']
  },
  rating: {
    type: Number,
    min: [0, 'Rating cannot be less than 0'],
    max: [10, 'Rating cannot exceed 10']
  },
  hoursPlayed: {
    type: Number,
    min: [0, 'Hours played cannot be negative'],
    default: 0
  },
  progress: {
    type: Number,
    min: [0, 'Progress cannot be less than 0'],
    max: [100, 'Progress cannot exceed 100'],
    default: 0
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  lastPlayed: {
    type: Date
  },
  achievements: [{
    achievementId: String,
    name: String,
    description: String,
    unlockedAt: {
      type: Date,
      default: Date.now
    },
    icon: String
  }],
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  platform: {
    type: String
  },
  playSessions: [{
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date
    },
    duration: {
      type: Number, // in minutes
      min: [0, 'Duration cannot be negative']
    },
    notes: {
      type: String,
      maxlength: [500, 'Session notes cannot exceed 500 characters']
    }
  }],
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Compound index to ensure one tracking entry per user per game
gameTrackingSchema.index({ user: 1, game: 1 }, { unique: true });

// Virtual for total play sessions duration
gameTrackingSchema.virtual('totalPlayTime').get(function() {
  return this.playSessions.reduce((total, session) => total + (session.duration || 0), 0);
});

// Method to add play session
gameTrackingSchema.methods.addPlaySession = async function(startTime, endTime = null, notes = '') {
  const duration = endTime ? 
    Math.round((endTime - startTime) / (1000 * 60)) : // Convert to minutes
    null;

  this.playSessions.push({
    startTime,
    endTime,
    duration,
    notes
  });

  this.lastPlayed = new Date();
  this.hoursPlayed = Math.round(this.totalPlayTime / 60 * 100) / 100; // Convert to hours

  return await this.save();
};

// Method to update progress
gameTrackingSchema.methods.updateProgress = async function(newProgress, notes = '') {
  this.progress = Math.min(100, Math.max(0, newProgress));
  
  if (this.progress === 100 && this.status !== 'completed') {
    this.status = 'completed';
    this.endDate = new Date();
  }
  
  if (notes) {
    this.notes = notes;
  }

  return await this.save();
};

// Method to update status
gameTrackingSchema.methods.updateStatus = async function(newStatus, notes = '') {
  this.status = newStatus;
  
  if (newStatus === 'playing' && !this.startDate) {
    this.startDate = new Date();
  }
  
  if (newStatus === 'completed' && !this.endDate) {
    this.endDate = new Date();
    this.progress = 100;
  }

  if (notes) {
    this.notes = notes;
  }

  return await this.save();
};

// Static method to get user's game library
gameTrackingSchema.statics.getUserLibrary = async function(userId, filters = {}) {
  const { status, platform, isFavorite, sortBy = 'lastPlayed', sortOrder = 'desc' } = filters;
  
  const query = { user: userId };
  
  if (status) query.status = status;
  if (platform) query.platform = platform;
  if (isFavorite !== undefined) query.isFavorite = isFavorite;

  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return await this.find(query)
    .populate('game', 'title images.cover price isFree rating platforms genre developer releaseDate')
    .sort(sort);
};

module.exports = mongoose.model('GameTracking', gameTrackingSchema);