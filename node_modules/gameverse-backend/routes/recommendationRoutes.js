const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendationController');
const { protect } = require('../middleware/auth');

// @route   GET /api/recommendations
// @desc    Get personalized game recommendations based on user history
// @access  Private (Needs a logged-in user to calculate preferences)
router.get('/', protect, getRecommendations);

module.exports = router;