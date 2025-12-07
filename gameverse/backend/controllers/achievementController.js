const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const User = require('../models/User');
const Game = require('../models/Game');
const Activity = require('../models/Activity');
const { notificationFactory } = require('./notificationController');
const realtime = require('../realtime');

// @desc    Get all achievements
// @route   GET /api/achievements
// @access  Public
exports.getAchievements = async (req, res) => {
  try {
    const { type, game, rarity, page = 1, limit = 20 } = req.query;

    const query = { isActive: true };
    if (type) query.type = type;
    if (game) query.game = game;
    if (rarity) query.rarity = rarity;

    const achievements = await Achievement.find(query)
      .populate('game', 'title images.cover')
      .sort({ points: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Achievement.countDocuments(query);

    // Get user's progress if authenticated
    let userProgress = {};
    if (req.userId) {
      const userAchievements = await UserAchievement.find({
        user: req.userId,
        achievement: { $in: achievements.map(a => a._id) }
      });

      userAchievements.forEach(ua => {
        userProgress[ua.achievement.toString()] = {
          isUnlocked: ua.isUnlocked,
          progress: ua.progress,
          unlockedAt: ua.unlockedAt
        };
      });
    }

    res.json({
      success: true,
      data: {
        achievements,
        userProgress,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      }
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching achievements',
      error: error.message
    });
  }
};

// @desc    Get achievement by ID
// @route   GET /api/achievements/:achievementId
// @access  Public
exports.getAchievement = async (req, res) => {
  try {
    const { achievementId } = req.params;

    const achievement = await Achievement.findById(achievementId)
      .populate('game', 'title images.cover description');

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    // Get user's progress if authenticated
    let userProgress = null;
    if (req.userId) {
      userProgress = await UserAchievement.findOne({
        user: req.userId,
        achievement: achievementId
      });
    }

    // Get achievement statistics
    const totalUnlocked = await UserAchievement.countDocuments({
      achievement: achievementId,
      isUnlocked: true
    });

    const totalUsers = await User.countDocuments({ isActive: true });
    const unlockPercentage = totalUsers > 0 ? 
      Math.round((totalUnlocked / totalUsers) * 100) : 0;

    res.json({
      success: true,
      data: {
        achievement,
        userProgress,
        statistics: {
          totalUnlocked,
          unlockPercentage,
          rarity: achievement.rarity
        }
      }
    });
  } catch (error) {
    console.error('Get achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching achievement',
      error: error.message
    });
  }
};

// @desc    Create new achievement (Admin only)
// @route   POST /api/achievements
// @access  Private/Admin
exports.createAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.create(req.body);

    await achievement.populate('game', 'title images.cover');

    res.status(201).json({
      success: true,
      message: 'Achievement created successfully',
      data: { achievement }
    });
  } catch (error) {
    console.error('Create achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating achievement',
      error: error.message
    });
  }
};

// @desc    Update achievement (Admin only)
// @route   PUT /api/achievements/:achievementId
// @access  Private/Admin
exports.updateAchievement = async (req, res) => {
  try {
    const { achievementId } = req.params;

    const achievement = await Achievement.findByIdAndUpdate(
      achievementId,
      req.body,
      { new: true, runValidators: true }
    ).populate('game', 'title images.cover');

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    res.json({
      success: true,
      message: 'Achievement updated successfully',
      data: { achievement }
    });
  } catch (error) {
    console.error('Update achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating achievement',
      error: error.message
    });
  }
};

// @desc    Delete achievement (Admin only)
// @route   DELETE /api/achievements/:achievementId
// @access  Private/Admin
exports.deleteAchievement = async (req, res) => {
  try {
    const { achievementId } = req.params;

    const achievement = await Achievement.findById(achievementId);

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    // Soft delete
    achievement.isActive = false;
    await achievement.save();

    res.json({
      success: true,
      message: 'Achievement deleted successfully'
    });
  } catch (error) {
    console.error('Delete achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting achievement',
      error: error.message
    });
  }
};

// @desc    Get achievement categories
// @route   GET /api/achievements/categories
// @access  Public
exports.getAchievementCategories = async (req, res) => {
  try {
    const categories = await Achievement.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalPoints: { $sum: '$points' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get game-specific achievements count
    const gameAchievements = await Achievement.aggregate([
      {
        $match: { 
          isActive: true,
          type: 'game',
          game: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$game',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Populate game information
    const gameAchievementsWithDetails = await Promise.all(
      gameAchievements.map(async (ga) => {
        const game = await Game.findById(ga._id)
          .select('title images.cover');
        return {
          ...ga,
          game
        };
      })
    );

    res.json({
      success: true,
      data: {
        categories,
        topGames: gameAchievementsWithDetails
      }
    });
  } catch (error) {
    console.error('Get achievement categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching achievement categories',
      error: error.message
    });
  }
};

// @desc    Update user achievement progress
// @route   PUT /api/achievements/user/:achievementId/progress
// @access  Private
exports.updateUserAchievementProgress = async (req, res) => {
  try {
    const { achievementId } = req.params;
    const { progress } = req.body;

    const achievement = await Achievement.findById(achievementId);
    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found' });
    }

    const target = achievement.criteria?.target || 1;

    let userAchievement = await UserAchievement.findOne({
      user: req.userId,
      achievement: achievementId
    });

    const wasUnlocked = userAchievement?.isUnlocked;

    if (!userAchievement) {
      userAchievement = await UserAchievement.create({
        user: req.userId,
        achievement: achievementId,
        game: achievement.game || undefined,
        progress: {
          current: progress || 0,
          target,
          percentage: Math.min(100, Math.round(((progress || 0) / target) * 100))
        },
        isUnlocked: progress >= target,
        unlockedAt: progress >= target ? new Date() : undefined
      });
    } else {
      userAchievement.progress.current = progress;
      userAchievement.progress.target = target;
      await userAchievement.save();
    }

    const updatedAchievement = userAchievement;

    // If newly unlocked, send notification + realtime event + activity
    if (!wasUnlocked && updatedAchievement.isUnlocked) {
      try {
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
        realtime.emitTo(`user_${req.userId}`, 'achievement_unlocked', {
          achievementId: achievement._id,
          name: achievement.name,
          points: achievement.points
        });

        // Create activity for the feed
        const user = await User.findById(req.userId).select('username profile.avatar');
        const game = await Game.findById(achievement.game).select('title');
        
        await Activity.create({
          user: req.userId,
          type: 'ACHIEVEMENT_UNLOCKED',
          data: {
            gameId: achievement.game,
            gameName: game?.title || 'Unknown',
            achievementName: achievement.name
          },
          visibility: 'PUBLIC'
        });

        // Emit activity_created event to all connected users
        realtime.io.emit('activity_created', {
          _id: null,
          user: { _id: req.userId, username: user?.username, profile: user?.profile },
          type: 'ACHIEVEMENT_UNLOCKED',
          data: {
            gameId: achievement.game,
            gameName: game?.title || 'Unknown',
            achievementName: achievement.name
          },
          visibility: 'PUBLIC',
          createdAt: new Date()
        });
      } catch (notifyErr) {
        console.error('Achievement notification/activity error:', notifyErr);
      }
    }

    res.json({
      success: true,
      message: 'Achievement progress updated successfully',
      data: { userAchievement: updatedAchievement }
    });
  } catch (error) {
    console.error('Update user achievement progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating achievement progress',
      error: error.message
    });
  }
};

// @desc    Get recent achievements unlocked
// @route   GET /api/achievements/recent
// @access  Public
exports.getRecentAchievements = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recentAchievements = await UserAchievement.find({
      isUnlocked: true,
      isActive: true
    })
      .populate('user', 'username profile.avatar')
      .populate('achievement', 'name description icon points')
      .populate('game', 'title images.cover')
      .sort({ unlockedAt: -1 })
      .limit(limit * 1);

    res.json({
      success: true,
      data: { recentAchievements }
    });
  } catch (error) {
    console.error('Get recent achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recent achievements',
      error: error.message
    });
  }
};
// Note: legacy unlockAchievement stub removed; unlocks are handled via progress updates and checkAchievements.