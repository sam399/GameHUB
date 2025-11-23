const Notification = require('../models/Notification');

// Get notifications for current user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.userId }).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: { notifications } });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.updateOne({ _id: id, user: req.userId }, { $set: { read: true } });
    res.json({ success: true });
  } catch (err) {
    console.error('Mark notification as read error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Mark all notifications as read
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.userId, read: false }, { $set: { read: true } });
    res.json({ success: true });
  } catch (err) {
    console.error('Mark all notifications read error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Create a notification (internal use)
exports.createNotification = async (data) => {
  try {
    const n = new Notification(data);
    await n.save();
    return n;
  } catch (err) {
    console.error('Create notification error:', err);
    return null;
  }
};
