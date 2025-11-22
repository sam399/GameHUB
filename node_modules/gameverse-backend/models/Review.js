const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user']
  },
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: [true, 'Review must belong to a game']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Review content is required'],
    maxlength: [2000, 'Content cannot exceed 2000 characters']
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  helpful: {
    type: Number,
    default: 0
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Prevent duplicate reviews from same user for same game
reviewSchema.index({ user: 1, game: 1 }, { unique: true });

// Update game rating when review is saved
reviewSchema.post('save', async function() {
  await this.constructor.updateGameRating(this.game);
});

// Update game rating when review is deleted
reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await doc.constructor.updateGameRating(doc.game);
  }
});

// Static method to update game rating
reviewSchema.statics.updateGameRating = async function(gameId) {
  const stats = await this.aggregate([
    {
      $match: { game: gameId, isActive: true }
    },
    {
      $group: {
        _id: '$game',
        averageRating: { $avg: '$rating' },
        ratingCount: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    const Game = mongoose.model('Game');
    await Game.findByIdAndUpdate(gameId, {
      'rating.average': Math.round(stats[0].averageRating * 10) / 10,
      'rating.count': stats[0].ratingCount
    });
  } else {
    const Game = mongoose.model('Game');
    await Game.findByIdAndUpdate(gameId, {
      'rating.average': 0,
      'rating.count': 0
    });
  }
};

// Method to check if user has liked/disliked
reviewSchema.methods.hasLiked = function(userId) {
  return this.likes.includes(userId);
};

reviewSchema.methods.hasDisliked = function(userId) {
  return this.dislikes.includes(userId);
};

module.exports = mongoose.model('Review', reviewSchema);