const Activity = require('../models/Activity');
const User = require('../models/User');
const redisCache = require('../utils/redisCache');

const NEWS_CACHE_KEY = 'feed:rawg_news';
const NEWS_CACHE_TTL = 60 * 60; // 1 hour in seconds

// Fallback mock news data
const getMockNews = () => [
  {
    type: 'EXTERNAL_NEWS',
    title: 'Trending: Elden Ring - Shadow of the Erdtree',
    image: 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc8xk1.jpg',
    link: 'https://rawg.io',
    createdAt: new Date().toISOString()
  },
  {
    type: 'EXTERNAL_NEWS',
    title: 'Trending: Baldur\'s Gate 3',
    image: 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/sckbxh.jpg',
    link: 'https://rawg.io',
    createdAt: new Date().toISOString()
  },
  {
    type: 'EXTERNAL_NEWS',
    title: 'Trending: Cyberpunk 2077: Phantom Liberty',
    image: 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/scmhfj.jpg',
    link: 'https://rawg.io',
    createdAt: new Date().toISOString()
  },
  {
    type: 'EXTERNAL_NEWS',
    title: 'Trending: The Legend of Zelda: Tears of the Kingdom',
    image: 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc3zg1.jpg',
    link: 'https://rawg.io',
    createdAt: new Date().toISOString()
  },
  {
    type: 'EXTERNAL_NEWS',
    title: 'Trending: Starfield',
    image: 'https://images.igdb.com/igdb/image/upload/t_screenshot_big/scs2wc.jpg',
    link: 'https://rawg.io',
    createdAt: new Date().toISOString()
  }
];

const getExternalNews = async () => {
  return redisCache.getOrCompute(NEWS_CACHE_KEY, NEWS_CACHE_TTL, async () => {
    try {
      // Use database games instead of external API
      const Game = require('../models/Game');
      const games = await Game.find({ active: true, featured: true })
        .sort({ 'rating.average': -1 })
        .limit(5);

      return games.map((game) => ({
        type: 'EXTERNAL_NEWS',
        title: `Trending: ${game.title}`,
        image: game.images?.cover,
        link: `/games/${game._id}`,
        createdAt: game.updatedAt
      }));
    } catch (err) {
      console.error('News generation error:', err.message);
      return getMockNews();
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