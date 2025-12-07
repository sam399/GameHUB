const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPreferences,
  updatePreferences,
  updateActivityPreferences,
  updateDeliveryPreferences,
  updateDigestPreferences
} = require('../controllers/notificationPreferenceController');

// All routes require authentication
router.use(protect);

// @route   GET /api/notification-preferences
// @desc    Get user's notification preferences
// @access  Private
router.get('/', getPreferences);

// @route   PUT /api/notification-preferences
// @desc    Update all notification preferences
// @access  Private
router.put('/', updatePreferences);

// @route   PATCH /api/notification-preferences/activities
// @desc    Update activity type preferences
// @access  Private
router.patch('/activities', updateActivityPreferences);

// @route   PATCH /api/notification-preferences/delivery
// @desc    Update delivery method preferences
// @access  Private
router.patch('/delivery', updateDeliveryPreferences);

// @route   PATCH /api/notification-preferences/digest
// @desc    Update email digest preferences
// @access  Private
router.patch('/digest', updateDigestPreferences);

module.exports = router;
