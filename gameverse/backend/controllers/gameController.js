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

    // Database query - all games now come from MongoDB
    const filter = { active: true };
    
    if (genre) {
      filter.genre = { $in: genre.split(',') };
    }
    
    if (platform && platform !== 'all') {
      filter.platforms = { $in: platform.split(',') };
    }
    
    if (search) {
      // Use regex for case-insensitive search if text index doesn't exist
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    if (sortBy === 'rating') {
      sort['rating.average'] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

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
      data: game
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

// @desc    Get featured games
// @route   GET /api/games/featured
// @access  Public
exports.getFeaturedGames = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const games = await Game.find({ featured: true, active: true })
      .sort({ 'rating.average': -1 })
      .limit(parseInt(limit))
      .select('-systemRequirements');

    res.json({
      success: true,
      data: games
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
    const { genre } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const filter = {
      genre: { $in: [genre] },
      active: true
    };

    const games = await Game.find(filter)
      .sort({ 'rating.average': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-systemRequirements');

    const total = await Game.countDocuments(filter);

    res.json({
      success: true,
      data: {
        games,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
        genre
      }
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

// @desc    Create a new game (Admin only)
// @route   POST /api/games
// @access  Private/Admin
exports.createGame = async (req, res) => {
  try {
    const game = await Game.create(req.body);

    res.status(201).json({
      success: true,
      data: game,
      message: 'Game created successfully'
    });
  } catch (error) {
    console.error('Create game error:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating game',
      error: error.message
    });
  }
};

// @desc    Update a game (Admin only)
// @route   PUT /api/games/:id
// @access  Private/Admin
exports.updateGame = async (req, res) => {
  try {
    const game = await Game.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    res.json({
      success: true,
      data: game,
      message: 'Game updated successfully'
    });
  } catch (error) {
    console.error('Update game error:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating game',
      error: error.message
    });
  }
};

// @desc    Delete a game (Admin only)
// @route   DELETE /api/games/:id
// @access  Private/Admin
exports.deleteGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    // Soft delete by setting active to false
    game.active = false;
    await game.save();

    res.json({
      success: true,
      message: 'Game deleted successfully'
    });
  } catch (error) {
    console.error('Delete game error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting game',
      error: error.message
    });
  }
};

// @desc    Get all unique genres
// @route   GET /api/games/meta/genres
// @access  Public
exports.getGenres = async (req, res) => {
  try {
    const genres = await Game.distinct('genre', { active: true });
    
    res.json({
      success: true,
      data: genres.sort()
    });
  } catch (error) {
    console.error('Get genres error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching genres',
      error: error.message
    });
  }
};

// @desc    Get all unique platforms
// @route   GET /api/games/meta/platforms
// @access  Public
exports.getPlatforms = async (req, res) => {
  try {
    const platforms = await Game.distinct('platforms', { active: true });
    
    res.json({
      success: true,
      data: platforms.sort()
    });
  } catch (error) {
    console.error('Get platforms error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching platforms',
      error: error.message
    });
  }
};

// @desc    Get game statistics
// @route   GET /api/games/meta/stats
// @access  Public
exports.getGameStats = async (req, res) => {
  try {
    const totalGames = await Game.countDocuments({ active: true });
    const freeGames = await Game.countDocuments({ active: true, isFree: true });
    const paidGames = await Game.countDocuments({ active: true, isFree: false });
    const featuredGames = await Game.countDocuments({ active: true, featured: true });
    
    // Get genre distribution
    const genreDistribution = await Game.aggregate([
      { $match: { active: true } },
      { $unwind: '$genre' },
      { $group: { _id: '$genre', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Get platform distribution
    const platformDistribution = await Game.aggregate([
      { $match: { active: true } },
      { $unwind: '$platforms' },
      { $group: { _id: '$platforms', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        totalGames,
        freeGames,
        paidGames,
        featuredGames,
        genreDistribution: genreDistribution.map(g => ({ genre: g._id, count: g.count })),
        platformDistribution: platformDistribution.map(p => ({ platform: p._id, count: p.count }))
      }
    });
  } catch (error) {
    console.error('Get game stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching game statistics',
      error: error.message
    });
  }
};
