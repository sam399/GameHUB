const Game = require('../models/Game');
const axios = require('axios');

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

    // Check if we should use FreeToGame API
    if (process.env.USE_FREETOGAME === 'true') {
      try {
        // Build FreeToGame API URL
        let apiUrl = `${process.env.FREETOGAME_API_URL}/games`;
        const params = new URLSearchParams();

        if (platform && platform !== 'all') {
          params.append('platform', platform);
        }
        
        if (genre) {
          params.append('category', genre);
        }
        
        if (sortBy) {
          // Map our sort fields to FreeToGame sort options
          const sortMap = {
            'title': 'alphabetical',
            'releaseDate': 'release-date',
            'rating': 'popularity'
          };
          params.append('sort-by', sortMap[sortBy] || 'relevance');
        }

        const queryString = params.toString();
        if (queryString) {
          apiUrl += `?${queryString}`;
        }

        console.log('Calling FreeToGame API:', apiUrl);
        
        const response = await axios.get(apiUrl);

        console.log('API Response status:', response.status);
        console.log('Found', response.data?.length || 0, 'games from FreeToGame API');

        // Transform FreeToGame data to our format
        let results = Array.isArray(response.data) ? response.data : [];
        
        // Apply search filter manually if provided
        if (search) {
          const searchLower = search.toLowerCase();
          results = results.filter(game => 
            game.title?.toLowerCase().includes(searchLower) ||
            game.short_description?.toLowerCase().includes(searchLower)
          );
        }
        
        // Paginate results manually
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedResults = results.slice(startIndex, endIndex);

        const games = paginatedResults.map(game => ({
          _id: game.id?.toString(),
          title: game.title,
          description: game.short_description || 'No description available',
          genre: game.genre ? [game.genre] : [],
          platforms: game.platform ? [game.platform] : [],
          releaseDate: game.release_date || null,
          developer: game.developer || 'Unknown',
          publisher: game.publisher || 'Unknown',
          rating: 0, // FreeToGame doesn't provide ratings
          images: {
            cover: game.thumbnail || '',
            screenshots: game.screenshots?.map(s => s.image) || []
          },
          gameUrl: game.game_url || '',
          metacriticScore: null,
          active: true
        }));

        return res.json({
          success: true,
          data: {
            games,
            totalPages: Math.ceil(results.length / limit),
            currentPage: parseInt(page),
            total: results.length
          }
        });
      } catch (apiError) {
        console.error('FreeToGame API error:', {
          message: apiError.message,
          response: apiError.response?.data,
          status: apiError.response?.status
        });
        console.log('Falling back to local database...');
        // Fall through to local database query
      }
    }

    // Check if we should use RapidAPI
    if (process.env.USE_RAPIDAPI === 'true') {
      try {
        // Build All Games Search DB API parameters
        const params = {
          l: 'english',
          use_store_query: 1,
          use_search_spellcheck: 1,
          search_creators_and_tags: 1,
          realm: 1,
          cc: 'US',
          f: 'games'
        };

        if (search) {
          params.term = search;
        } else {
          params.term = genre || platform || 'popular'; // Default search term
        }

        console.log('Calling All Games Search DB API with params:', params);
        
        const response = await axios.get('https://all-games-search-db.p.rapidapi.com/search/suggest', {
          params,
          headers: {
            'X-RapidAPI-Key': process.env.RAWG_API_KEY,
            'X-RapidAPI-Host': process.env.RAPIDAPI_HOST
          }
        });

        console.log('API Response status:', response.status);
        console.log('API Response is array:', Array.isArray(response.data));
        console.log('API Response sample:', response.data?.[0] || 'No data');

        // Transform All Games Search DB data to our format
        // The API returns an array directly
        const results = Array.isArray(response.data) ? response.data : (response.data?.data?.games || response.data?.games || []);
        
        console.log('Found', results.length, 'games from API');
        
        // Paginate results manually
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedResults = results.slice(startIndex, endIndex);

        const games = paginatedResults.map(game => ({
          _id: game.id?.toString() || game.appid?.toString() || Math.random().toString(),
          title: game.name || 'Unknown Game',
          description: game.short_description || game.description || 'No description available',
          genre: game.genres?.map(g => g.description || g) || [],
          platforms: game.platforms || [],
          releaseDate: game.release_date || null,
          developer: game.developers?.join(', ') || 'Unknown',
          publisher: game.publishers?.join(', ') || 'Unknown',
          rating: game.rating || 0,
          images: {
            cover: game.header_image || game.capsule_image || '',
            screenshots: game.screenshots?.map(s => s.path_full || s.path_thumbnail) || []
          },
          metacriticScore: game.metacritic?.score || null,
          active: true
        }));

        return res.json({
          success: true,
          data: {
            games,
            totalPages: Math.ceil(results.length / limit),
            currentPage: parseInt(page),
            total: results.length
          }
        });
      } catch (apiError) {
        console.error('RapidAPI error details:', {
          message: apiError.message,
          response: apiError.response?.data,
          status: apiError.response?.status
        });
        console.log('Falling back to local database...');
        // Fall through to local database query
      }
    }

    // Local database query (fallback or when USE_RAPIDAPI is false)
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