const mongoose = require('mongoose');

const userAchievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  achievement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement',
    required: [true, 'Achievement reference is required']
  },
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game'
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    current: {
      type: Number,
      default: 0
    },
    target: {
      type: Number,
      required: [true, 'Target value is required']
    },
    percentage: {
      type: Number,
      default: 0,
      min: [0, 'Percentage cannot be less than 0'],
      max: [100, 'Percentage cannot exceed 100']
    }
  },
  isUnlocked: {
    type: Boolean,
    default: false
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound unique index
userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });

// Index for efficient querying
userAchievementSchema.index({ user: 1, isUnlocked: 1 });
userAchievementSchema.index({ user: 1, game: 1, isUnlocked: 1 });

// Pre-save middleware to update progress percentage
userAchievementSchema.pre('save', function(next) {
  if (this.progress.current && this.progress.target) {
    this.progress.percentage = Math.min(
      100,
      Math.round((this.progress.current / this.progress.target) * 100)
    );
    
    // Check if achievement should be unlocked
    if (!this.isUnlocked && this.progress.percentage >= 100) {
      this.isUnlocked = true;
      this.unlockedAt = new Date();
    }
  }
  next();
});

// Method to update progress
userAchievementSchema.methods.updateProgress = async function(newProgress) {
  this.progress.current = newProgress;
  await this.save();
  
  if (this.isUnlocked) {
    // Update user's total achievement points
    const Achievement = mongoose.model('Achievement');
    const achievement = await Achievement.findById(this.achievement);
    
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(this.user, {
      $inc: { 'profile.achievementPoints': achievement.points }
    });
  }
  
  return this;
};

// Static method to get user's achievements
userAchievementSchema.statics.getUserAchievements = async function(userId, filters = {}) {
  const query = {
    user: userId,
    isActive: true
  };
  
  if (filters.game) query.game = filters.game;
  if (filters.isUnlocked !== undefined) query.isUnlocked = filters.isUnlocked;
  if (filters.type) {
    // This would require joining with Achievement model
  }
  
  const achievements = await this.find(query)
    .populate('achievement', 'name description icon points rarity')
    .populate('game', 'title images.cover')
    .sort({ unlockedAt: -1 });
  
  // Calculate statistics
  const unlocked = achievements.filter(a => a.isUnlocked).length;
  const total = achievements.length;
  const totalPoints = achievements
    .filter(a => a.isUnlocked)
    .reduce((sum, a) => sum + (a.achievement?.points || 0), 0);
  
  return {
    achievements,
    stats: {
      unlocked,
      total,
      completion: total > 0 ? Math.round((unlocked / total) * 100) : 0,
      totalPoints
    }
  };
};

module.exports = mongoose.model('UserAchievement', userAchievementSchema);