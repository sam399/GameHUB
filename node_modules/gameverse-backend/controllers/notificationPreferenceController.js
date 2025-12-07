const NotificationPreference = require('../models/NotificationPreference');

// @desc    Get user's notification preferences
// @route   GET /api/notification-preferences
// @access  Private
exports.getPreferences = async (req, res) => {
  try {
    let preferences = await NotificationPreference.findOne({ user: req.userId });

    // Create default preferences if none exist
    if (!preferences) {
      preferences = await NotificationPreference.create({ user: req.userId });
    }

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching preferences',
      error: error.message
    });
  }
};

// @desc    Update notification preferences
// @route   PUT /api/notification-preferences
// @access  Private
exports.updatePreferences = async (req, res) => {
  try {
    const { activities, system, delivery, email_digest, quiet_hours } = req.body;

    let preferences = await NotificationPreference.findOne({ user: req.userId });

    if (!preferences) {
      preferences = new NotificationPreference({ user: req.userId });
    }

    // Update only provided fields
    if (activities) preferences.activities = { ...preferences.activities, ...activities };
    if (system) preferences.system = { ...preferences.system, ...system };
    if (delivery) preferences.delivery = { ...preferences.delivery, ...delivery };
    if (email_digest) preferences.email_digest = { ...preferences.email_digest, ...email_digest };
    if (quiet_hours) preferences.quiet_hours = { ...preferences.quiet_hours, ...quiet_hours };

    await preferences.save();

    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating preferences',
      error: error.message
    });
  }
};

// @desc    Update activity type preferences
// @route   PATCH /api/notification-preferences/activities
// @access  Private
exports.updateActivityPreferences = async (req, res) => {
  try {
    let preferences = await NotificationPreference.findOne({ user: req.userId });

    if (!preferences) {
      preferences = new NotificationPreference({ user: req.userId });
    }

    preferences.activities = { ...preferences.activities, ...req.body };
    await preferences.save();

    res.json({
      success: true,
      message: 'Activity preferences updated',
      data: preferences.activities
    });
  } catch (error) {
    console.error('Update activity preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update delivery method preferences
// @route   PATCH /api/notification-preferences/delivery
// @access  Private
exports.updateDeliveryPreferences = async (req, res) => {
  try {
    let preferences = await NotificationPreference.findOne({ user: req.userId });

    if (!preferences) {
      preferences = new NotificationPreference({ user: req.userId });
    }

    preferences.delivery = { ...preferences.delivery, ...req.body };
    await preferences.save();

    res.json({
      success: true,
      message: 'Delivery preferences updated',
      data: preferences.delivery
    });
  } catch (error) {
    console.error('Update delivery preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update email digest preferences
// @route   PATCH /api/notification-preferences/digest
// @access  Private
exports.updateDigestPreferences = async (req, res) => {
  try {
    let preferences = await NotificationPreference.findOne({ user: req.userId });

    if (!preferences) {
      preferences = new NotificationPreference({ user: req.userId });
    }

    preferences.email_digest = { ...preferences.email_digest, ...req.body };
    await preferences.save();

    res.json({
      success: true,
      message: 'Email digest preferences updated',
      data: preferences.email_digest
    });
  } catch (error) {
    console.error('Update digest preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
