const Activity = require('../models/Activity');
const User = require('../models/User');
const axios = require('axios');
const redisCache = require('../utils/redisCache');

const NEWS_CACHE_KEY = 'feed:rawg_news';
const NEWS_CACHE_TTL = 60 * 60; // 1 hour in seconds

const getExternalNews = async () => {
  return redisCache.getOrCompute(NEWS_CACHE_KEY, NEWS_CACHE_TTL, async () => {
    try {
      const apiKey = process.env.RAWG_API_KEY;
      if (!apiKey) {
        console.warn('RAWG_API_KEY not set; skipping external news');
        return [];
      }

      const response = await axios.get('https://api.rawg.io/api/games', {
        params: {
          key: apiKey,
          dates: '2024-01-01,2025-12-31',
          ordering: '-added',
          page_size: 5
        },
        timeout: 5000
      });

      return (response.data.results || []).map((game) => ({
        type: 'EXTERNAL_NEWS',
        title: `Trending: ${game.name}`,
        image: game.background_image,
        link: `/game/${game.id}`,
        createdAt: game.released
      }));
    } catch (err) {
      console.error('External news API error:', err.message);
      return [];
    }
  });
};

// @desc    Get aggregated News and Activity Feed
// @route   GET /api/feed
// @access  Private
exports.getFeed = async (req, res) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // 1. Get List of Friend IDs
    const currentUser = await User.findById(userId);
    const friendIds = currentUser.friends.map(f => f.user);
    friendIds.push(userId); // Include self

    // 2. Fetch Internal Activities (Database) with pagination
    const skip = (page - 1) * limit;
    const internalActivities = await Activity.find({
      user: { $in: friendIds },
      visibility: { $ne: 'PRIVATE' }
    })
    .populate('user', 'username profile.avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

    // Get total count for pagination
    const total = await Activity.countDocuments({
      user: { $in: friendIds },
      visibility: { $ne: 'PRIVATE' }
    });

    // 3. Fetch External Gaming News (cached)
    const externalNews = await getExternalNews();

    // 4. Return merged feed with pagination
    res.status(200).json({
      success: true,
      activities: internalActivities,
      news: externalNews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};