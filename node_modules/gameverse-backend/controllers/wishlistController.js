const Wishlist = require('../models/Wishlist');
const Game = require('../models/Game');
const { notificationFactory } = require('./notificationController');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.getUserWishlist(req.userId);

    if (!wishlist) {
      // Create empty wishlist if it doesn't exist
      wishlist = await Wishlist.create({ user: req.userId });
      await wishlist.populate('games.game', 'title images.cover price isFree rating platforms genre developer');
    }

    res.json({
      success: true,
      data: { wishlist }
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching wishlist',
      error: error.message
    });
  }
};

// @desc    Add game to wishlist
// @route   POST /api/wishlist/games
// @access  Private
exports.addToWishlist = async (req, res) => {
  try {
    const { gameId, priority = 'medium', notes = '' } = req.body;

    if (!gameId) {
      return res.status(400).json({
        success: false,
        message: 'Game ID is required'
      });
    }

    // Check if game exists
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.userId });
    }

    await wishlist.addGame(gameId, priority, notes);
    await wishlist.populate('games.game', 'title images.cover price isFree rating platforms genre developer');

    res.status(201).json({
      success: true,
      message: 'Game added to wishlist successfully',
      data: { wishlist }
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    if (error.message === 'Game is already in wishlist') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while adding game to wishlist',
      error: error.message
    });
  }
};

// @desc    Remove game from wishlist
// @route   DELETE /api/wishlist/games/:gameId
// @access  Private
exports.removeFromWishlist = async (req, res) => {
  try {
    const { gameId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.userId });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    await wishlist.removeGame(gameId);
    await wishlist.populate('games.game', 'title images.cover price isFree rating platforms genre developer');

    res.json({
      success: true,
      message: 'Game removed from wishlist successfully',
      data: { wishlist }
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing game from wishlist',
      error: error.message
    });
  }
};

// @desc    Update wishlist item
// @route   PUT /api/wishlist/games/:gameId
// @access  Private
exports.updateWishlistItem = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { priority, notes, priceAlert } = req.body;

    const wishlist = await Wishlist.findOne({ user: req.userId });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    const updates = {};
    if (priority) updates.priority = priority;
    if (notes !== undefined) updates.notes = notes;
    if (priceAlert !== undefined) updates.priceAlert = priceAlert;

    await wishlist.updateGame(gameId, updates);
    await wishlist.populate('games.game', 'title images.cover price isFree rating platforms genre developer');

    res.json({
      success: true,
      message: 'Wishlist item updated successfully',
      data: { wishlist }
    });
  } catch (error) {
    console.error('Update wishlist item error:', error);
    if (error.message === 'Game not found in wishlist') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating wishlist item',
      error: error.message
    });
  }
};

// @desc    Toggle wishlist privacy
// @route   PUT /api/wishlist/privacy
// @access  Private
exports.togglePrivacy = async (req, res) => {
  try {
    const { isPublic } = req.body;

    const wishlist = await Wishlist.findOne({ user: req.userId });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    wishlist.isPublic = isPublic;
    await wishlist.save();

    res.json({
      success: true,
      message: `Wishlist is now ${isPublic ? 'public' : 'private'}`,
      data: { isPublic: wishlist.isPublic }
    });
  } catch (error) {
    console.error('Toggle wishlist privacy error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating wishlist privacy',
      error: error.message
    });
  }
};

// @desc    Get public wishlist by user ID
// @route   GET /api/wishlist/user/:userId
// @access  Public
exports.getPublicWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    const wishlist = await Wishlist.findOne({ 
      user: userId, 
      isPublic: true 
    }).populate('games.game', 'title images.cover price isFree rating platforms genre developer')
      .populate('user', 'username profile.avatar');

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Public wishlist not found or user has private wishlist'
      });
    }

    res.json({
      success: true,
      data: { wishlist }
    });
  } catch (error) {
    console.error('Get public wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching public wishlist',
      error: error.message
    });
  }
};

// @desc    Check if game is in user's wishlist
// @route   GET /api/wishlist/check/:gameId
// @access  Private
exports.checkGameInWishlist = async (req, res) => {
  try {
    const { gameId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.userId });

    if (!wishlist) {
      return res.json({
        success: true,
        data: { inWishlist: false }
      });
    }

    const inWishlist = wishlist.games.some(item => 
      item.game.toString() === gameId.toString()
    );

    res.json({
      success: true,
      data: { inWishlist }
    });
  } catch (error) {
    console.error('Check game in wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking game in wishlist',
      error: error.message
    });
  }
};