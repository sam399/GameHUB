const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Achievement name is required'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    required: [true, 'Achievement type is required'],
    enum: ['game', 'social', 'content', 'progression', 'special']
  },
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: function() {
      return this.type === 'game';
    }
  },
  icon: {
    type: String,
    required: [true, 'Icon is required'],
    default: '🏅'
  },
  color: {
    type: String,
    default: '#ffc107'
  },
  points: {
    type: Number,
    required: [true, 'Points are required'],
    min: [1, 'Points must be at least 1'],
    max: [1000, 'Points cannot exceed 1000'],
    default: 10
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  criteria: {
    type: {
      type: String,
      required: [true, 'Criteria type is required'],
      enum: ['games_played', 'hours_played', 'review_count', 'forum_posts', 'friends_count', 'achievement_count', 'custom']
    },
    target: {
      type: Number,
      required: [true, 'Target value is required'],
      min: [1, 'Target must be at least 1']
    },
    comparison: {
      type: String,
      enum: ['greater_than', 'equals', 'less_than'],
      default: 'greater_than'
    },
    customCondition: String
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
achievementSchema.index({ type: 1, isActive: 1 });
achievementSchema.index({ game: 1, type: 1 });
achievementSchema.index({ rarity: 1 });

// Method to check if user meets achievement criteria
achievementSchema.methods.checkCriteria = function(userStats) {
  const { type, target, comparison, customCondition } = this.criteria;
  
  let userValue;
  
  switch (type) {
    case 'games_played':
      userValue = userStats.gamesPlayed || 0;
      break;
    case 'hours_played':
      userValue = userStats.hoursPlayed || 0;
      break;
    case 'review_count':
      userValue = userStats.reviewCount || 0;
      break;
    case 'forum_posts':
      userValue = userStats.forumPosts || 0;
      break;
    case 'friends_count':
      userValue = userStats.friendsCount || 0;
      break;
    case 'achievement_count':
      userValue = userStats.achievementCount || 0;
      break;
    case 'custom':
      // Custom condition evaluation would go here
      // This could be more complex based on your needs
      return false;
  }
  
  switch (comparison) {
    case 'greater_than':
      return userValue >= target;
    case 'equals':
      return userValue === target;
    case 'less_than':
      return userValue <= target;
    default:
      return false;
  }
};

// Static method to get achievements for user based on stats
achievementSchema.statics.getEligibleAchievements = async function(userStats, gameId = null) {
  const query = {
    isActive: true,
    $or: [
      { type: { $ne: 'game' } },
      { game: gameId }
    ]
  };
  
  if (gameId) {
    query.game = gameId;
  }
  
  const achievements = await this.find(query);
  
  return achievements.filter(achievement => 
    achievement.checkCriteria(userStats)
  );
};

module.exports = mongoose.model('Achievement', achievementSchema);