const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User');
const realtime = require('../realtime');

// ----------------------- API Handlers -----------------------
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const filter = {
      user: req.userId,
      isActive: true
    };

    if (unreadOnly === 'true' || unreadOnly === true) filter.isRead = false;

    const notifications = await Notification.find(filter)
      .populate('data.senderId', 'username profile.avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ user: req.userId, isRead: false, isActive: true });

    res.json({
      success: true,
      data: {
        notifications,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
        unreadCount
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching notifications', error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.notificationId, user: req.userId });
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

    notification.isRead = true;
    await notification.save();

    const io = req.app.get('io');
    if (io) io.to(`user_${req.userId}`).emit('notification_read', { notificationId: notification._id });

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ success: false, message: 'Server error while marking notification as read', error: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.userId, isRead: false, isActive: true }, { $set: { isRead: true } });

    const io = req.app.get('io');
    if (io) io.to(`user_${req.userId}`).emit('all_notifications_read');

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ success: false, message: 'Server error while marking all notifications as read', error: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.notificationId, user: req.userId });
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

    notification.isActive = false;
    await notification.save();

    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting notification', error: error.message });
  }
};

exports.getNotificationStats = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({ user: req.userId, isRead: false, isActive: true });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = await Notification.countDocuments({ user: req.userId, createdAt: { $gte: today }, isActive: true });
    const totalCount = await Notification.countDocuments({ user: req.userId, isActive: true });

    const typeStats = await Notification.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.userId), isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({ success: true, data: { unreadCount, todayCount, totalCount, typeStats } });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching notification statistics', error: error.message });
  }
};

// ----------------------- Notification Factory -----------------------
exports.notificationFactory = {
  async createFriendRequestNotification(fromUserId, toUserId, extra = {}) {
    const fromUser = await User.findById(fromUserId).select('username profile.avatar');
    const n = await Notification.create({
      user: toUserId,
      type: 'friend_request',
      title: 'New Friend Request',
      message: `${fromUser.username} sent you a friend request`,
      data: { senderId: fromUserId, ...extra }
    });

    // Emit via realtime helper
    realtime.emitTo(`user_${toUserId}`, 'friend_request:received', { notification: n, from: { _id: fromUser._id, username: fromUser.username, profile: fromUser.profile }, requestId: extra.requestId });
    return n;
  },

  async createFriendRequestAcceptedNotification(fromUserId, toUserId) {
    const fromUser = await User.findById(fromUserId).select('username profile.avatar');
    const n = await Notification.create({
      user: toUserId,
      type: 'friend_request_accepted',
      title: 'Friend Request Accepted',
      message: `${fromUser.username} accepted your friend request`,
      data: { senderId: fromUserId }
    });

    realtime.emitTo(`user_${toUserId}`, 'friend_request:accepted', { notification: n, by: { _id: fromUser._id, username: fromUser.username, profile: fromUser.profile } });
    return n;
  },
  
  async createFriendRequestCancelledNotification(toUserId, byUserId) {
    const byUser = await User.findById(byUserId).select('username profile.avatar');
    const n = await Notification.create({
      user: toUserId,
      type: 'friend_request_cancelled',
      title: 'Friend Request Cancelled',
      message: `${byUser.username} cancelled a friend request`,
      data: { senderId: byUserId }
    });

    realtime.emitTo(`user_${toUserId}`, 'friend_request:cancelled', { notification: n, by: { _id: byUser._id, username: byUser.username } });
    return n;
  },

  async createFriendRemovedNotification(toUserId, byUserId) {
    const byUser = await User.findById(byUserId).select('username profile.avatar');
    const n = await Notification.create({
      user: toUserId,
      type: 'friend_removed',
      title: 'Friend Removed',
      message: `${byUser.username} removed you as a friend`,
      data: { senderId: byUserId }
    });

    realtime.emitTo(`user_${toUserId}`, 'friend:removed', { notification: n, by: { _id: byUser._id, username: byUser.username } });
    return n;
  },

  async createNewMessageNotification(userId, chatId, senderId) {
    const sender = await User.findById(senderId).select('username profile.avatar');
    const n = await Notification.create({
      user: userId,
      type: 'new_message',
      title: 'New Message',
      message: `${sender.username} sent you a message`,
      data: { senderId, chatId }
    });

    realtime.emitTo(`user_${userId}`, 'new_message', { notification: n, chatId, sender: { _id: sender._id, username: sender.username, profile: sender.profile } });
    return n;
  },

  async createForumReplyNotification(userId, threadId, postId, replierId) {
    const replier = await User.findById(replierId).select('username profile.avatar');
    const n = await Notification.create({
      user: userId,
      type: 'forum_reply',
      title: 'Forum Reply',
      message: `${replier.username} replied to your thread`,
      data: { senderId: replierId, threadId, postId }
    });

    realtime.emitTo(`user_${userId}`, 'forum_reply', { notification: n, threadId, postId });
    return n;
  },

  async createGameRecommendationNotification(userId, gameId, reason) {
    const n = await Notification.create({
      user: userId,
      type: 'game_recommendation',
      title: 'Game Recommendation',
      message: `We found a game you might like: ${reason}`,
      data: { gameId, customData: { reason } }
    });

    realtime.emitTo(`user_${userId}`, 'game_recommendation', { notification: n });
    return n;
  },

  async createSystemAlertNotification(userId, title, message, customData = {}) {
    const n = await Notification.create({
      user: userId,
      type: 'system_alert',
      title,
      message,
      data: { customData }
    });

    realtime.emitTo(`user_${userId}`, 'system_alert', { notification: n });
    return n;
  }
};
