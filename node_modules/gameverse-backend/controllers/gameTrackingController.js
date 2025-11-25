const GameTracking = require('../models/GameTracking');
const Game = require('../models/Game');

// @desc    Get user's game library
// @route   GET /api/library
// @access  Private
exports.getUserLibrary = async (req, res) => {
  try {
    const { status, platform, isFavorite, sortBy, sortOrder } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (platform) filters.platform = platform;
    if (isFavorite !== undefined) filters.isFavorite = isFavorite === 'true';

    const library = await GameTracking.getUserLibrary(req.userId, {
      ...filters,
      sortBy,
      sortOrder
    });

    // Calculate statistics
    const stats = {
      total: library.length,
      playing: library.filter(item => item.status === 'playing').length,
      completed: library.filter(item => item.status === 'completed').length,
      planning: library.filter(item => item.status === 'planning').length,
      totalHours: library.reduce((sum, item) => sum + (item.hoursPlayed || 0), 0),
      favorites: library.filter(item => item.isFavorite).length
    };

    res.json({
      success: true,
      data: {
        library,
        stats
      }
    });
  } catch (error) {
    console.error('Get user library error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching game library',
      error: error.message
    });
  }
};

// @desc    Track a game
// @route   POST /api/library/games
// @access  Private
exports.trackGame = async (req, res) => {
  try {
    const { gameId, status = 'planning', platform, notes } = req.body;

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

    // Check if already tracking
    const existingTracking = await GameTracking.findOne({
      user: req.userId,
      game: gameId
    });

    if (existingTracking) {
      return res.status(400).json({
        success: false,
        message: 'Game is already being tracked'
      });
    }

    const trackingData = {
      user: req.userId,
      game: gameId,
      status,
      platform,
      notes
    };

    if (status === 'playing') {
      trackingData.startDate = new Date();
    }

    const gameTracking = await GameTracking.create(trackingData);
    await gameTracking.populate('game', 'title images.cover price isFree rating platforms genre developer');

    res.status(201).json({
      success: true,
      message: 'Game added to library successfully',
      data: { gameTracking }
    });
  } catch (error) {
    console.error('Track game error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Game is already being tracked'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while tracking game',
      error: error.message
    });
  }
};

// @desc    Update game tracking
// @route   PUT /api/library/games/:gameId
// @access  Private
exports.updateGameTracking = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { status, rating, hoursPlayed, progress, platform, isFavorite, notes } = req.body;

    const gameTracking = await GameTracking.findOne({
      user: req.userId,
      game: gameId
    });

    if (!gameTracking) {
      return res.status(404).json({
        success: false,
        message: 'Game tracking not found'
      });
    }

    const updates = {};
    if (status) updates.status = status;
    if (rating !== undefined) updates.rating = rating;
    if (hoursPlayed !== undefined) updates.hoursPlayed = hoursPlayed;
    if (progress !== undefined) updates.progress = progress;
    if (platform !== undefined) updates.platform = platform;
    if (isFavorite !== undefined) updates.isFavorite = isFavorite;
    if (notes !== undefined) updates.notes = notes;

    // Handle status-specific logic
    if (status === 'playing' && !gameTracking.startDate) {
      updates.startDate = new Date();
    }

    if (status === 'completed') {
      updates.endDate = new Date();
      updates.progress = 100;
    }

    Object.assign(gameTracking, updates);
    await gameTracking.save();
    await gameTracking.populate('game', 'title images.cover price isFree rating platforms genre developer');

    res.json({
      success: true,
      message: 'Game tracking updated successfully',
      data: { gameTracking }
    });
  } catch (error) {
    console.error('Update game tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating game tracking',
      error: error.message
    });
  }
};

// @desc    Remove game from library
// @route   DELETE /api/library/games/:gameId
// @access  Private
exports.removeFromLibrary = async (req, res) => {
  try {
    const { gameId } = req.params;

    const result = await GameTracking.findOneAndDelete({
      user: req.userId,
      game: gameId
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Game tracking not found'
      });
    }

    res.json({
      success: true,
      message: 'Game removed from library successfully'
    });
  } catch (error) {
    console.error('Remove from library error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing game from library',
      error: error.message
    });
  }
};

// @desc    Add play session
// @route   POST /api/library/games/:gameId/sessions
// @access  Private
exports.addPlaySession = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { startTime, endTime, notes } = req.body;

    const gameTracking = await GameTracking.findOne({
      user: req.userId,
      game: gameId
    });

    if (!gameTracking) {
      return res.status(404).json({
        success: false,
        message: 'Game tracking not found'
      });
    }

    const start = startTime ? new Date(startTime) : new Date();
    const end = endTime ? new Date(endTime) : null;

    await gameTracking.addPlaySession(start, end, notes);
    await gameTracking.populate('game', 'title images.cover price isFree rating platforms genre developer');

    res.status(201).json({
      success: true,
      message: 'Play session added successfully',
      data: { gameTracking }
    });
  } catch (error) {
    console.error('Add play session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding play session',
      error: error.message
    });
  }
};

// @desc    Get game tracking details
// @route   GET /api/library/games/:gameId
// @access  Private
exports.getGameTracking = async (req, res) => {
  try {
    const { gameId } = req.params;

    const gameTracking = await GameTracking.findOne({
      user: req.userId,
      game: gameId
    }).populate('game', 'title images.cover price isFree rating platforms genre developer releaseDate');

    if (!gameTracking) {
      return res.status(404).json({
        success: false,
        message: 'Game tracking not found'
      });
    }

    res.json({
      success: true,
      data: { gameTracking }
    });
  } catch (error) {
    console.error('Get game tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching game tracking',
      error: error.message
    });
  }
};

// @desc    Get user's gaming statistics
// @route   GET /api/library/stats
// @access  Private
exports.getGamingStats = async (req, res) => {
  try {
    const library = await GameTracking.getUserLibrary(req.userId);

    const stats = {
      totalGames: library.length,
      totalHours: library.reduce((sum, item) => sum + (item.hoursPlayed || 0), 0),
      averageRating: 0,
      statusBreakdown: {},
      genreBreakdown: {},
      platformBreakdown: {},
      recentActivity: []
    };

    // Calculate status breakdown
    const statusCounts = {};
    library.forEach(item => {
      statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
    });
    stats.statusBreakdown = statusCounts;

    // Calculate genre breakdown
    const genreCounts = {};
    library.forEach(item => {
      if (item.game.genre) {
        item.game.genre.forEach(genre => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      }
    });
    stats.genreBreakdown = genreCounts;

    // Calculate platform breakdown
    const platformCounts = {};
    library.forEach(item => {
      if (item.platform) {
        platformCounts[item.platform] = (platformCounts[item.platform] || 0) + 1;
      }
    });
    stats.platformBreakdown = platformCounts;

    // Calculate average rating
    const ratedGames = library.filter(item => item.rating && item.rating > 0);
    if (ratedGames.length > 0) {
      stats.averageRating = ratedGames.reduce((sum, item) => sum + item.rating, 0) / ratedGames.length;
    }

    // Get recent activity (last 10 play sessions across all games)
    const recentSessions = [];
    library.forEach(item => {
      item.playSessions.forEach(session => {
        recentSessions.push({
          game: item.game.title,
          gameId: item.game._id,
          duration: session.duration,
          startTime: session.startTime,
          notes: session.notes
        });
      });
    });

    stats.recentActivity = recentSessions
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      .slice(0, 10);

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get gaming stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching gaming statistics',
      error: error.message
    });
  }
};