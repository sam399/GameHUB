const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['ACHIEVEMENT_UNLOCKED', 'GAME_REVIEWED', 'NEW_HIGHSCORE', 'GAME_ADDED'],
    required: true
  },
  data: {
    // Flexible object to store related data (e.g., gameName, achievementTitle, rating)
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
    gameName: String,
    achievementName: String,
    reviewRating: Number,
    score: Number
  },
  visibility: {
    type: String,
    enum: ['PUBLIC', 'FRIENDS_ONLY', 'PRIVATE'],
    default: 'PUBLIC'
  }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);