const express = require('express');
const {
  getLeaderboards,
  getLeaderboard,
  getUserRank,
  refreshLeaderboard,
  getUserAchievements,
  checkAchievements,
  getAchievementLeaderboard
} = require('../controllers/leaderboardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getLeaderboards);
router.get('/:leaderboardId', getLeaderboard);
router.get('/achievements/global', getAchievementLeaderboard);

// Protected routes
router.get('/:leaderboardId/rank', protect, getUserRank);
router.get('/achievements/user', protect, getUserAchievements);
router.post('/achievements/check', protect, checkAchievements);

// Admin routes
router.post('/:leaderboardId/refresh', protect, authorize('admin'), refreshLeaderboard);

module.exports = router;