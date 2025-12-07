const Leaderboard = require('../models/Leaderboard');
const LeaderboardEntry = require('../models/LeaderboardEntry');
const User = require('../models/User');
const Game = require('../models/Game');
const GameTracking = require('../models/GameTracking');
const Review = require('../models/Review');
const ForumPost = require('../models/ForumPost');
const UserAchievement = require('../models/UserAchievement');
const Activity = require('../models/Activity');
const { notificationFactory } = require('./notificationController');
const realtime = require('../realtime');

// @desc    Get all active leaderboards
// @route   GET /api/leaderboards
// @access  Public
exports.getLeaderboards = async (req, res) => {
  try {
    const { type, game, page = 1, limit = 10 } = req.query;

    const filters = {};
    if (type) filters.type = type;
    if (game) filters.game = game;

    const leaderboards = await Leaderboard.getActiveLeaderboards(filters);

    // Get top entries for each leaderboard
    const leaderboardsWithTopEntries = await Promise.all(
      leaderboards.map(async (leaderboard) => {
        const topEntries = await LeaderboardEntry.find({
          leaderboard: leaderboard._id,
          isActive: true
        })
          .populate('user', 'username profile.avatar')
          .sort({ score: -1 })
          .limit(5);

        return {
          ...leaderboard.toObject(),
          topEntries,
          totalEntries: await LeaderboardEntry.countDocuments({
            leaderboard: leaderboard._id,
            isActive: true
          })
        };
      })
    );

    res.json({
      success: true,
      data: {
        leaderboards: leaderboardsWithTopEntries,
        total: leaderboards.length
      }
    });
  } catch (error) {
    console.error('Get leaderboards error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leaderboards',
      error: error.message
    });
  }
};

// @desc    Get leaderboard details with entries
// @route   GET /api/leaderboards/:leaderboardId
// @access  Public
exports.getLeaderboard = async (req, res) => {
  try {
    const { leaderboardId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const leaderboard = await Leaderboard.findById(leaderboardId)
      .populate('game', 'title images.cover');

    if (!leaderboard || !leaderboard.isPublic) {
      return res.status(404).json({
        success: false,
        message: 'Leaderboard not found or not accessible'
      });
    }

    const entriesData = await LeaderboardEntry.getEntries(leaderboardId, page, limit);

    // Get user's rank if authenticated
    let userRank = null;
    if (req.userId) {
      userRank = await LeaderboardEntry.getUserRank(leaderboardId, req.userId);
    }

    res.json({
      success: true,
      data: {
        leaderboard,
        entries: entriesData.entries,
        pagination: {
          totalPages: entriesData.totalPages,
          currentPage: entriesData.currentPage,
          total: entriesData.total
        },
        userRank
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leaderboard',
      error: error.message
    });
  }
};

// @desc    Get user's position in leaderboard
// @route   GET /api/leaderboards/:leaderboardId/rank
// @access  Private
exports.getUserRank = async (req, res) => {
  try {
    const { leaderboardId } = req.params;

    const userRank = await LeaderboardEntry.getUserRank(leaderboardId, req.userId);

    if (!userRank) {
      return res.status(404).json({
        success: false,
        message: 'User not found in leaderboard'
      });
    }

    res.json({
      success: true,
      data: userRank
    });
  } catch (error) {
    console.error('Get user rank error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user rank',
      error: error.message
    });
  }
};

// @desc    Refresh leaderboard scores
// @route   POST /api/leaderboards/:leaderboardId/refresh
// @access  Private/Admin
exports.refreshLeaderboard = async (req, res) => {
  try {
    const { leaderboardId } = req.params;

    const leaderboard = await Leaderboard.findById(leaderboardId);
    if (!leaderboard) {
      return res.status(404).json({
        success: false,
        message: 'Leaderboard not found'
      });
    }

    // Calculate scores based on leaderboard metric
    const scores = await calculateScores(leaderboard);

    // Update or create entries + detect new highscores
    const newHighscores = [];
    for (const score of scores) {
      const existingEntry = await LeaderboardEntry.findOne({
        leaderboard: leaderboardId,
        user: score.userId
      });

      const isNewHighscore = !existingEntry || score.score > existingEntry.score;

      const entry = await LeaderboardEntry.findOneAndUpdate(
        {
          leaderboard: leaderboardId,
          user: score.userId
        },
        {
          score: score.score,
          metadata: score.metadata,
          lastUpdated: new Date()
        },
        {
          upsert: true,
          new: true
        }
      );

      if (isNewHighscore) {
        newHighscores.push({ userId: score.userId, score: score.score, leaderboardId });
      }
    }

    // Create activities for new highscores
    for (const hs of newHighscores) {
      try {
        const user = await User.findById(hs.userId).select('username profile.avatar');
        const gameTitle = leaderboard.game ? (await Game.findById(leaderboard.game).select('title'))?.title : 'Global';
        
        await Activity.create({
          user: hs.userId,
          type: 'NEW_HIGHSCORE',
          data: {
            gameId: leaderboard.game,
            gameName: gameTitle,
            score: hs.score
          },
          visibility: 'PUBLIC'
        });

        // Emit activity_created event
        realtime.io.emit('activity_created', {
          _id: null,
          user: { _id: hs.userId, username: user?.username, profile: user?.profile },
          type: 'NEW_HIGHSCORE',
          data: {
            gameId: leaderboard.game,
            gameName: gameTitle,
            score: hs.score
          },
          visibility: 'PUBLIC',
          createdAt: new Date()
        });
      } catch (activityErr) {
        console.warn('Highscore activity creation failed:', activityErr.message);
      }
    }

    // Update leaderboard refresh timestamp
    leaderboard.lastRefreshed = new Date();
    await leaderboard.save();

    // Recalculate all ranks
    await recalculateRanks(leaderboardId);

    // Emit realtime update for listeners (e.g., dashboards)
    try {
      realtime.emit('leaderboard.updated', { leaderboardId });
    } catch (emitErr) {
      console.error('Realtime emit error (leaderboard.updated):', emitErr);
    }

    res.json({
      success: true,
      message: 'Leaderboard refreshed successfully',
      data: { scoresCalculated: scores.length }
    });
  } catch (error) {
    console.error('Refresh leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while refreshing leaderboard',
      error: error.message
    });
  }
};

// Helper function to calculate scores
const calculateScores = async (leaderboard) => {
  const { metric, type, game } = leaderboard;
  let scores = [];

  switch (metric) {
    case 'games_played':
      scores = await calculateGamesPlayed(leaderboard);
      break;
    case 'hours_played':
      scores = await calculateHoursPlayed(leaderboard);
      break;
    case 'achievements':
      scores = await calculateAchievements(leaderboard);
      break;
    case 'review_count':
      scores = await calculateReviewCount(leaderboard);
      break;
    case 'forum_posts':
      scores = await calculateForumPosts(leaderboard);
      break;
    case 'friends_count':
      scores = await calculateFriendsCount(leaderboard);
      break;
    default:
      scores = await calculateCustomMetric(leaderboard);
  }

  return scores;
};

// Specific calculation functions
const calculateGamesPlayed = async (leaderboard) => {
  const { type, game } = leaderboard;
  
  let query = {};
  if (type === 'game_specific' && game) {
    query.game = game;
  }

  const gameStats = await GameTracking.aggregate([
    {
      $match: query
    },
    {
      $group: {
        _id: '$user',
        gamesPlayed: { $sum: 1 },
        hoursPlayed: { $sum: '$hoursPlayed' }
      }
    },
    {
      $sort: { gamesPlayed: -1 }
    }
  ]);

  return gameStats.map(stat => ({
    userId: stat._id,
    score: stat.gamesPlayed,
    metadata: {
      gamesPlayed: stat.gamesPlayed,
      hoursPlayed: stat.hoursPlayed || 0
    }
  }));
};

const calculateHoursPlayed = async (leaderboard) => {
  const { type, game } = leaderboard;
  
  let query = {};
  if (type === 'game_specific' && game) {
    query.game = game;
  }

  const hoursStats = await GameTracking.aggregate([
    {
      $match: query
    },
    {
      $group: {
        _id: '$user',
        totalHours: { $sum: '$hoursPlayed' },
        gamesCount: { $sum: 1 }
      }
    },
    {
      $sort: { totalHours: -1 }
    }
  ]);

  return hoursStats.map(stat => ({
    userId: stat._id,
    score: stat.totalHours,
    metadata: {
      hoursPlayed: stat.totalHours,
      gamesPlayed: stat.gamesCount
    }
  }));
};

const calculateAchievements = async (leaderboard) => {
  const { type, game } = leaderboard;

  const match = { isUnlocked: true };
  if (type === 'game_specific' && game) {
    match.game = game;
  }

  const achievementStats = await UserAchievement.aggregate([
    { $match: match },
    {
      $lookup: {
        from: 'achievements',
        localField: 'achievement',
        foreignField: '_id',
        as: 'achievementData'
      }
    },
    { $unwind: '$achievementData' },
    {
      $group: {
        _id: '$user',
        achievements: { $sum: 1 },
        totalPoints: { $sum: '$achievementData.points' }
      }
    },
    { $sort: { achievements: -1 } }
  ]);

  return achievementStats.map((stat) => ({
    userId: stat._id,
    score: stat.achievements,
    metadata: {
      achievements: stat.achievements,
      totalPoints: stat.totalPoints || 0
    }
  }));
};

const calculateReviewCount = async (leaderboard) => {
  const { type, game } = leaderboard;
  
  let query = { isActive: true };
  if (type === 'game_specific' && game) {
    query.game = game;
  }

  const reviewStats = await Review.aggregate([
    {
      $match: query
    },
    {
      $group: {
        _id: '$user',
        reviews: { $sum: 1 },
        averageRating: { $avg: '$rating' }
      }
    },
    {
      $sort: { reviews: -1 }
    }
  ]);

  return reviewStats.map(stat => ({
    userId: stat._id,
    score: stat.reviews,
    metadata: {
      reviews: stat.reviews,
      averageRating: stat.averageRating || 0
    }
  }));
};

const calculateForumPosts = async (leaderboard) => {
  const postStats = await ForumPost.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: '$author',
        posts: { $sum: 1 }
      }
    },
    {
      $sort: { posts: -1 }
    }
  ]);

  return postStats.map(stat => ({
    userId: stat._id,
    score: stat.posts,
    metadata: {
      forumPosts: stat.posts
    }
  }));
};

const calculateFriendsCount = async (leaderboard) => {
  const userStats = await User.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $project: {
        friendsCount: { $size: '$friends' }
      }
    },
    {
      $sort: { friendsCount: -1 }
    }
  ]);

  return userStats.map(stat => ({
    userId: stat._id,
    score: stat.friendsCount,
    metadata: {
      friends: stat.friendsCount
    }
  }));
};

const calculateCustomMetric = async (leaderboard) => {
  // Implement custom metric calculation based on leaderboard configuration
  // This would depend on your specific requirements
  return [];
};

// Simple interval-based refresh honoring refreshInterval
// This is a lightweight in-process scheduler; replace with a proper job runner in production.
const scheduleLeaderboardRefresh = (() => {
  const timers = new Map();

  const intervalToMs = (interval) => {
    switch (interval) {
      case 'realtime': return 30_000; // 30s
      case 'hourly': return 60 * 60 * 1000;
      case 'daily': return 24 * 60 * 60 * 1000;
      case 'weekly': return 7 * 24 * 60 * 60 * 1000;
      default: return null; // manual
    }
  };

  const refreshOne = async (leaderboardId) => {
    try {
      const lb = await Leaderboard.findById(leaderboardId);
      if (!lb || !lb.isActive) return;
      const intervalMs = intervalToMs(lb.refreshInterval);
      if (!intervalMs) return;

      // Recalculate scores and ranks using existing helper
      const scores = await calculateScores(lb);
      for (const score of scores) {
        await LeaderboardEntry.findOneAndUpdate(
          { leaderboard: lb._id, user: score.userId },
          { score: score.score, metadata: score.metadata, lastUpdated: new Date() },
          { upsert: true, new: true }
        );
      }
      lb.lastRefreshed = new Date();
      await lb.save();
      await recalculateRanks(lb._id);
      try { realtime.emit('leaderboard.updated', { leaderboardId: lb._id }); } catch (e) { /* noop */ }
    } catch (err) {
      console.error('Scheduled leaderboard refresh error:', err);
    }
  };

  return {
    start: async () => {
      const leaderboards = await Leaderboard.find({ isActive: true, isPublic: true });
      leaderboards.forEach((lb) => {
        const ms = intervalToMs(lb.refreshInterval);
        if (!ms) return; // manual
        if (timers.has(lb._id.toString())) return;
        const id = setInterval(() => refreshOne(lb._id), ms);
        timers.set(lb._id.toString(), id);
      });
    },
    stop: () => {
      timers.forEach((id) => clearInterval(id));
      timers.clear();
    }
  };
})();

// Kick off scheduler on module load
scheduleLeaderboardRefresh.start();

// Helper function to recalculate ranks
const recalculateRanks = async (leaderboardId) => {
  const entries = await LeaderboardEntry.find({
    leaderboard: leaderboardId,
    isActive: true
  }).sort({ score: -1 });

  for (let i = 0; i < entries.length; i++) {
    entries[i].rank = i + 1;
    await entries[i].save();
  }
};

// @desc    Get user's achievements
// @route   GET /api/leaderboards/achievements/user
// @access  Private
exports.getUserAchievements = async (req, res) => {
  try {
    const { game, unlocked, type } = req.query;

    const filters = {};
    if (game) filters.game = game;
    if (unlocked !== undefined) filters.isUnlocked = unlocked === 'true';

    const achievementsData = await UserAchievement.getUserAchievements(req.userId, filters);

    res.json({
      success: true,
      data: achievementsData
    });
  } catch (error) {
    console.error('Get user achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user achievements',
      error: error.message
    });
  }
};

// @desc    Check for new achievements
// @route   POST /api/leaderboards/achievements/check
// @access  Private
exports.checkAchievements = async (req, res) => {
  try {
    const { gameId } = req.body;

    // Get user statistics
    const userStats = await getUserStatistics(req.userId, gameId);

    // Get eligible achievements
    const Achievement = require('../models/Achievement');
    const eligibleAchievements = await Achievement.getEligibleAchievements(userStats, gameId);

    const newlyUnlocked = [];

    // Check each achievement
    for (const achievement of eligibleAchievements) {
      const existing = await UserAchievement.findOne({
        user: req.userId,
        achievement: achievement._id
      });

      if (!existing) {
        // Create new user achievement
        const userAchievement = await UserAchievement.create({
          user: req.userId,
          achievement: achievement._id,
          game: gameId,
          progress: {
            current: userStats[achievement.criteria.type] || 0,
            target: achievement.criteria.target
          },
          isUnlocked: true,
          unlockedAt: new Date()
        });

        newlyUnlocked.push(userAchievement);

        // Send notification
        await notificationFactory.createSystemAlertNotification(
          req.userId,
          'Achievement Unlocked!',
          `You unlocked the "${achievement.name}" achievement!`,
          {
            achievementId: achievement._id,
            achievementName: achievement.name,
            points: achievement.points
          }
        );
      }
    }

    res.json({
      success: true,
      data: {
        newlyUnlocked,
        totalChecked: eligibleAchievements.length
      }
    });
  } catch (error) {
    console.error('Check achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking achievements',
      error: error.message
    });
  }
};

// Helper function to get user statistics
const getUserStatistics = async (userId, gameId = null) => {
  const stats = {
    gamesPlayed: 0,
    hoursPlayed: 0,
    reviewCount: 0,
    forumPosts: 0,
    friendsCount: 0,
    achievementCount: 0
  };

  // Games played
  const gameQuery = { user: userId };
  if (gameId) gameQuery.game = gameId;

  const gameStats = await GameTracking.aggregate([
    {
      $match: gameQuery
    },
    {
      $group: {
        _id: null,
        gamesPlayed: { $sum: 1 },
        hoursPlayed: { $sum: '$hoursPlayed' }
      }
    }
  ]);

  if (gameStats.length > 0) {
    stats.gamesPlayed = gameStats[0].gamesPlayed;
    stats.hoursPlayed = gameStats[0].hoursPlayed || 0;
  }

  // Review count
  const reviewQuery = { user: userId, isActive: true };
  if (gameId) reviewQuery.game = gameId;

  const reviewCount = await Review.countDocuments(reviewQuery);
  stats.reviewCount = reviewCount;

  // Forum posts
  const forumCount = await ForumPost.countDocuments({
    author: userId,
    isActive: true
  });
  stats.forumPosts = forumCount;

  // Friends count
  const user = await User.findById(userId).select('friends');
  stats.friendsCount = user?.friends?.length || 0;

  // Achievement count
  const achievementCount = await UserAchievement.countDocuments({
    user: userId,
    isUnlocked: true
  });
  stats.achievementCount = achievementCount;

  return stats;
};

// @desc    Get achievement leaderboard
// @route   GET /api/leaderboards/achievements/global
// @access  Public
exports.getAchievementLeaderboard = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const achievementStats = await UserAchievement.aggregate([
      {
        $match: { isUnlocked: true, isActive: true }
      },
      {
        $lookup: {
          from: 'achievements',
          localField: 'achievement',
          foreignField: '_id',
          as: 'achievementData'
        }
      },
      {
        $unwind: '$achievementData'
      },
      {
        $group: {
          _id: '$user',
          achievements: { $sum: 1 },
          totalPoints: { $sum: '$achievementData.points' }
        }
      },
      {
        $sort: { totalPoints: -1 }
      },
      {
        $skip: (page - 1) * limit
      },
      {
        $limit: limit * 1
      }
    ]);

    // Get total count
    const totalCount = await UserAchievement.distinct('user', {
      isUnlocked: true,
      isActive: true
    });

    // Populate user data
    const populatedStats = await Promise.all(
      achievementStats.map(async (stat) => {
        const user = await User.findById(stat._id)
          .select('username profile.avatar');
        
        return {
          ...stat,
          user
        };
      })
    );

    res.json({
      success: true,
      data: {
        leaderboard: populatedStats,
        pagination: {
          totalPages: Math.ceil(totalCount.length / limit),
          currentPage: parseInt(page),
          total: totalCount.length
        }
      }
    });
  } catch (error) {
    console.error('Get achievement leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching achievement leaderboard',
      error: error.message
    });
  }
};