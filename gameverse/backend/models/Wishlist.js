const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Wishlist must belong to a user'],
    unique: true
  },
  games: [{
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: [true, 'Wishlist item must have a game']
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    priceAlert: {
      isActive: {
        type: Boolean,
        default: false
      },
      targetPrice: {
        type: Number,
        min: [0, 'Target price cannot be negative']
      },
      currentPrice: {
        type: Number,
        min: [0, 'Current price cannot be negative']
      }
    }
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update lastUpdated when games are modified
wishlistSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Method to add game to wishlist
wishlistSchema.methods.addGame = async function(gameId, priority = 'medium', notes = '') {
  const existingGame = this.games.find(item => 
    item.game.toString() === gameId.toString()
  );

  if (existingGame) {
    throw new Error('Game is already in wishlist');
  }

  this.games.push({
    game: gameId,
    priority,
    notes
  });

  return await this.save();
};

// Method to remove game from wishlist
wishlistSchema.methods.removeGame = async function(gameId) {
  this.games = this.games.filter(item => 
    item.game.toString() !== gameId.toString()
  );
  
  return await this.save();
};

// Method to update game in wishlist
wishlistSchema.methods.updateGame = async function(gameId, updates) {
  const gameItem = this.games.find(item => 
    item.game.toString() === gameId.toString()
  );

  if (!gameItem) {
    throw new Error('Game not found in wishlist');
  }

  Object.keys(updates).forEach(key => {
    if (key in gameItem) {
      gameItem[key] = updates[key];
    }
  });

  return await this.save();
};

// Static method to get user's wishlist with populated games
wishlistSchema.statics.getUserWishlist = async function(userId) {
  return await this.findOne({ user: userId })
    .populate('games.game', 'title images.cover price isFree rating platforms genre developer')
    .populate('user', 'username profile.avatar');
};

// Index for efficient querying
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ 'games.game': 1 });

module.exports = mongoose.model('Wishlist', wishlistSchema);