const Game = require('../models/Game');

// @desc    Get all games with filtering and pagination
// @route   GET /api/games
// @access  Public
exports.getGames = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      genre,
      platform,
      search,
      sortBy = 'title',
      sortOrder = 'asc'
    } = req.query;

    // Build filter object
    const filter = { active: true };
    
    if (genre) {
      filter.genre = { $in: genre.split(',') };
    }
    
    if (platform) {
      filter.platforms = { $in: platform.split(',') };
    }
    
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const games = await Game.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-systemRequirements'); // Exclude heavy system requirements by default

    const total = await Game.countDocuments(filter);

    res.json({
      success: true,
      data: {
        games,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      }
    });
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching games',
      error: error.message
    });
  }
};

// @desc    Get single game by ID
// @route   GET /api/games/:id
// @access  Public
exports.getGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    res.json({
      success: true,
      data: { game }
    });
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching game',
      error: error.message
    });
  }
};

// @desc    Create new game (Admin only)
// @route   POST /api/games
// @access  Private/Admin
exports.createGame = async (req, res) => {
  try {
    const game = await Game.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Game created successfully',
      data: { game }
    });
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating game',
      error: error.message
    });
  }
};

// @desc    Update game
// @route   PUT /api/games/:id
// @access  Private/Admin
exports.updateGame = async (req, res) => {
  try {
    const game = await Game.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    res.json({
      success: true,
      message: 'Game updated successfully',
      data: { game }
    });
  } catch (error) {
    console.error('Update game error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating game',
      error: error.message
    });
  }
};

// @desc    Delete game
// @route   DELETE /api/games/:id
// @access  Private/Admin
exports.deleteGame = async (req, res) => {
  try {
    const game = await Game.findByIdAndDelete(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    res.json({
      success: true,
      message: 'Game deleted successfully'
    });
  } catch (error) {
    console.error('Delete game error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting game',
      error: error.message
    });
  }
};

// @desc    Get featured games
// @route   GET /api/games/featured
// @access  Public
exports.getFeaturedGames = async (req, res) => {
  try {
    const games = await Game.find({ 
      featured: true, 
      active: true 
    }).limit(6);

    res.json({
      success: true,
      data: { games }
    });
  } catch (error) {
    console.error('Get featured games error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured games',
      error: error.message
    });
  }
};

// @desc    Get games by genre
// @route   GET /api/games/genre/:genre
// @access  Public
exports.getGamesByGenre = async (req, res) => {
  try {
    const games = await Game.find({ 
      genre: req.params.genre,
      active: true 
    }).limit(12);

    res.json({
      success: true,
      data: { games }
    });
  } catch (error) {
    console.error('Get games by genre error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching games by genre',
      error: error.message
    });
  }
};