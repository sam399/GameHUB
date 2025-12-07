const express = require('express');
const {
  getAchievements,
  getAchievement,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  getAchievementCategories,
  updateUserAchievementProgress,
  getRecentAchievements
} = require('../controllers/achievementController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAchievements);
router.get('/categories', getAchievementCategories);
router.get('/recent', getRecentAchievements);
router.get('/:achievementId', getAchievement);

// Protected routes
router.put('/user/:achievementId/progress', protect, updateUserAchievementProgress);

// Admin routes
router.post('/', protect, authorize('admin'), createAchievement);
router.put('/:achievementId', protect, authorize('admin'), updateAchievement);
router.delete('/:achievementId', protect, authorize('admin'), deleteAchievement);

module.exports = router;