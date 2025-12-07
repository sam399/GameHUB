const mongoose = require('mongoose');
const Review = require('../models/Review');
const Game = require('../models/Game');
const Activity = require('../models/Activity');
const realtime = require('../realtime');

// @desc    Get reviews for a game
// @route   GET /api/games/:gameId/reviews
// @access  Public
exports.getGameReviews = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reviews = await Review.find({ 
      game: gameId, 
      isActive: true 
    })
      .populate('user', 'username profile.avatar')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ 
      game: gameId, 
      isActive: true 
    });

    res.json({
      success: true,
      data: {
        reviews,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews',
      error: error.message
    });
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/user
// @access  Private
exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.userId })
      .populate('game', 'title images.cover')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { reviews }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user reviews',
      error: error.message
    });
  }
};

// @desc    Create a review
// @route   POST /api/games/:gameId/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { gameId } = req.params;
    
    // Check if game exists
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    // Check if user already reviewed this game
    const existingReview = await Review.findOne({
      user: req.userId,
      game: gameId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this game'
      });
    }

    const review = await Review.create({
      user: req.userId,
      game: gameId,
      ...req.body
    });

    await review.populate('user', 'username profile.avatar');
    // Fetch updated game rating after review save and emit realtime events
    try {
      const updatedGame = await Game.findById(gameId).select('rating');
      realtime.emit('review:created', { gameId, review });
      realtime.emit('game:ratingUpdated', { gameId, rating: updatedGame ? updatedGame.rating : null });

      // Create activity for the feed
      await Activity.create({
        user: req.userId,
        type: 'GAME_REVIEWED',
        data: {
          gameId: game._id,
          gameName: game.title,
          reviewRating: req.body.rating
        },
        visibility: 'PUBLIC'
      });
      
      // Emit activity_created event to all connected users
      realtime.io.emit('activity_created', {
        _id: null, // Will be populated by client if needed
        user: { _id: req.userId, username: req.user.username, profile: req.user.profile },
        type: 'GAME_REVIEWED',
        data: {
          gameId: game._id,
          gameName: game.title,
          reviewRating: req.body.rating
        },
        visibility: 'PUBLIC',
        createdAt: new Date()
      });
    } catch (err) {
      console.warn('Realtime/activity emit after create failed:', err && err.message ? err.message : err);
    }

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: { review }
    });
  } catch (error) {
    console.error('Create review error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this game'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while creating review',
      error: error.message
    });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or not authorized'
      });
    }

    // Update review
    Object.keys(req.body).forEach(key => {
      review[key] = req.body[key];
    });
    
    review.isEdited = true;
    review.editedAt = new Date();

    await review.save();
    await review.populate('user', 'username profile.avatar');
    try {
      const updatedGame = await Game.findById(review.game).select('rating');
      realtime.emit('review:updated', { gameId: review.game, review });
      realtime.emit('game:ratingUpdated', { gameId: review.game, rating: updatedGame ? updatedGame.rating : null });
    } catch (err) {
      console.warn('Realtime emit after update failed:', err && err.message ? err.message : err);
    }

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: { review }
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating review',
      error: error.message
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or not authorized'
      });
    }

    // Soft delete
    review.isActive = false;
    await review.save();

    try {
      const updatedGame = await Game.findById(review.game).select('rating');
      realtime.emit('review:deleted', { gameId: review.game, reviewId: review._id });
      realtime.emit('game:ratingUpdated', { gameId: review.game, rating: updatedGame ? updatedGame.rating : null });
    } catch (err) {
      console.warn('Realtime emit after delete failed:', err && err.message ? err.message : err);
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting review',
      error: error.message
    });
  }
};

// @desc    Like/Dislike a review
// @route   POST /api/reviews/:id/react
// @access  Private
exports.reactToReview = async (req, res) => {
  try {
    const { reaction } = req.body; // 'like' or 'dislike'
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const userId = req.userId;

    // Remove from opposite reaction first
    if (reaction === 'like') {
      review.dislikes.pull(userId);
      if (review.likes.includes(userId)) {
        review.likes.pull(userId);
      } else {
        review.likes.push(userId);
      }
    } else if (reaction === 'dislike') {
      review.likes.pull(userId);
      if (review.dislikes.includes(userId)) {
        review.dislikes.pull(userId);
      } else {
        review.dislikes.push(userId);
      }
    }

    // Update helpful count
    review.helpful = review.likes.length - review.dislikes.length;
    await review.save();

    // Emit realtime reaction event
    try {
      realtime.emit('review:reaction', {
        gameId: review.game,
        reviewId: review._id,
        likes: review.likes.length,
        dislikes: review.dislikes.length,
        helpful: review.helpful,
        userReaction: review.likes.includes(userId) ? 'like' : review.dislikes.includes(userId) ? 'dislike' : 'none'
      });
    } catch (err) {
      console.warn('Realtime emit after reaction failed:', err && err.message ? err.message : err);
    }

    res.json({
      success: true,
      message: 'Reaction updated successfully',
      data: { 
        likes: review.likes.length,
        dislikes: review.dislikes.length,
        helpful: review.helpful,
        userReaction: review.likes.includes(userId) ? 'like' : 
                     review.dislikes.includes(userId) ? 'dislike' : 'none'
      }
    });
  } catch (error) {
    console.error('React to review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while reacting to review',
      error: error.message
    });
  }
};

// @desc    Get review statistics for a game
// @route   GET /api/games/:gameId/reviews/stats
// @access  Public
exports.getReviewStats = async (req, res) => {
  try {
    const { gameId } = req.params;

    const stats = await Review.aggregate([
      {
        $match: { 
          game: mongoose.Types.ObjectId(gameId),
          isActive: true 
        }
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: -1 }
      }
    ]);

    const totalReviews = await Review.countDocuments({
      game: gameId,
      isActive: true
    });

    // Format stats
    const ratingDistribution = Array.from({ length: 5 }, (_, i) => ({
      rating: 5 - i,
      count: stats.find(s => s._id === 5 - i)?.count || 0,
      percentage: totalReviews > 0 ? 
        Math.round((stats.find(s => s._id === 5 - i)?.count || 0) / totalReviews * 100) : 0
    }));

    res.json({
      success: true,
      data: {
        totalReviews,
        ratingDistribution
      }
    });
  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching review statistics',
      error: error.message
    });
  }
};

// Legacy/deprecated code below - addReview was replaced with createReview
// Keeping for reference but not exported