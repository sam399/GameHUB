const User = require('../models/User');
const mongoose = require('mongoose');
const realtime = require('../realtime');
const Notification = require('../models/Notification');
const { notificationFactory } = require('./notificationController');
const AuditLog = require('../models/AuditLog');
// @desc    Send friend request
// @route   POST /api/friends/requests
// @access  Private
exports.sendFriendRequest = async (req, res) => {
  try {
    const { toUserId } = req.body;

    if (!toUserId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (toUserId === req.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send friend request to yourself'
      });
    }

    // Check if target user exists
    const targetUser = await User.findById(toUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const currentUser = await User.findById(req.userId);

    // Check if already friends
    const isAlreadyFriend = currentUser.friends.some(
      friend => friend.user.toString() === toUserId
    );
    
    if (isAlreadyFriend) {
      return res.status(400).json({
        success: false,
        message: 'You are already friends with this user'
      });
    }

    // Check if request already exists
    const existingRequest = currentUser.friendRequests.find(
      request => 
        request.from.toString() === req.userId && 
        request.to.toString() === toUserId &&
        request.status === 'pending'
    );

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Friend request already sent'
      });
    }

    // Check if there's a pending request from the target user
    const incomingRequest = currentUser.friendRequests.find(
      request => 
        request.from.toString() === toUserId && 
        request.to.toString() === req.userId &&
        request.status === 'pending'
    );

    if (incomingRequest) {
      // Auto-accept the incoming request
      await this.acceptFriendRequest(req, res);
      return;
    }

    // Add friend request to both users with a generated requestId so we can reference it later
    const requestId = new mongoose.Types.ObjectId();
    const friendRequest = {
      _id: requestId,
      from: req.userId,
      to: toUserId,
      status: 'pending'
    };

    await User.findByIdAndUpdate(toUserId, {
      $push: { friendRequests: friendRequest }
    });

    await User.findByIdAndUpdate(req.userId, {
      $push: { 
        friendRequests: {
          _id: requestId,
          from: toUserId,
          to: req.userId,
          status: 'pending'
        }
      }
    });

    // Persist notification and emit realtime notification to the recipient via factory
    try {
      await notificationFactory.createFriendRequestNotification(req.userId, toUserId, { requestId: requestId.toString() });
    } catch (err) {
      console.error('Realtime notification error (sendFriendRequest):', err);
    }

    // Audit log for friend request
    try {
      await AuditLog.logAction({
        action: 'friend_request_sent',
        performedBy: req.userId,
        targetType: 'user',
        targetId: toUserId,
        description: `Sent friend request to user ${toUserId}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || ''
      });
    } catch (err) {
      console.error('Audit log error (sendFriendRequest):', err);
    }

    res.status(201).json({
      success: true,
      message: 'Friend request sent successfully'
    });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending friend request',
      error: error.message
    });
  }
};

// @desc    Accept friend request
// @route   PUT /api/friends/requests/:requestId/accept
// @access  Private
exports.acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const currentUser = await User.findById(req.userId);
    
    // Find the pending request
    const friendRequest = currentUser.friendRequests.find(
      request => 
        request._id.toString() === requestId && 
        request.to.toString() === req.userId &&
        request.status === 'pending'
    );

    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found'
      });
    }

    const fromUserId = friendRequest.from;

    // Update request status for both users
    await User.updateOne(
      { 
        _id: req.userId, 
        'friendRequests._id': requestId 
      },
      { 
        $set: { 
          'friendRequests.$.status': 'accepted' 
        } 
      }
    );

    await User.updateOne(
      { 
        _id: fromUserId,
        'friendRequests.from': fromUserId,
        'friendRequests.to': req.userId,
        'friendRequests.status': 'pending'
      },
      { 
        $set: { 
          'friendRequests.$.status': 'accepted' 
        } 
      }
    );

    // Add to friends list for both users
    await User.findByIdAndUpdate(req.userId, {
      $push: { 
        friends: { 
          user: fromUserId,
          since: new Date()
        } 
      }
    });

    await User.findByIdAndUpdate(fromUserId, {
      $push: { 
        friends: { 
          user: req.userId,
          since: new Date()
        } 
      }
    });

    // Persist and emit realtime notification to the requester via factory
    try {
      await notificationFactory.createFriendRequestAcceptedNotification(req.userId, fromUserId);
    } catch (err) {
      console.error('Realtime notification error (acceptFriendRequest):', err);
    }

    // Audit log for friend acceptance
    try {
      await AuditLog.logAction({
        action: 'friend_request_accepted',
        performedBy: req.userId,
        targetType: 'user',
        targetId: fromUserId,
        description: `Accepted friend request from user ${fromUserId}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || ''
      });
    } catch (err) {
      console.error('Audit log error (acceptFriendRequest):', err);
    }

    res.json({
      success: true,
      message: 'Friend request accepted successfully'
    });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while accepting friend request',
      error: error.message
    });
  }
};

// @desc    Reject friend request
// @route   PUT /api/friends/requests/:requestId/reject
// @access  Private
exports.rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const currentUser = await User.findById(req.userId);
    
    // Find the pending request
    const friendRequest = currentUser.friendRequests.find(
      request => 
        request._id.toString() === requestId && 
        request.to.toString() === req.userId &&
        request.status === 'pending'
    );

    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found'
      });
    }

    const fromUserId = friendRequest.from;

    // Update request status for both users
    await User.updateOne(
      { 
        _id: req.userId, 
        'friendRequests._id': requestId 
      },
      { 
        $set: { 
          'friendRequests.$.status': 'rejected' 
        } 
      }
    );

    await User.updateOne(
      { 
        _id: fromUserId,
        'friendRequests.from': fromUserId,
        'friendRequests.to': req.userId,
        'friendRequests.status': 'pending'
      },
      { 
        $set: { 
          'friendRequests.$.status': 'rejected' 
        } 
      }
    );

    res.json({
      success: true,
      message: 'Friend request rejected successfully'
    });
  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting friend request',
      error: error.message
    });
  }
};

// @desc    Cancel friend request
// @route   DELETE /api/friends/requests/:requestId
// @access  Private
exports.cancelFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const currentUser = await User.findById(req.userId);
    
    // Find the pending request
    const friendRequest = currentUser.friendRequests.find(
      request => 
        request._id.toString() === requestId && 
        request.from.toString() === req.userId &&
        request.status === 'pending'
    );

    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found'
      });
    }

    const toUserId = friendRequest.to;

    // Remove request from both users
    await User.findByIdAndUpdate(req.userId, {
      $pull: { 
        friendRequests: { 
          _id: requestId 
        } 
      }
    });

    await User.findByIdAndUpdate(toUserId, {
      $pull: { 
        friendRequests: { 
          from: req.userId,
          to: toUserId,
          status: 'pending'
        } 
      }
    });

    // Persist and emit cancelled notification via factory
    try {
      await notificationFactory.createFriendRequestCancelledNotification(toUserId, req.userId);
    } catch (err) {
      console.error('Realtime notification error (cancelFriendRequest):', err);
    }

    res.json({
      success: true,
      message: 'Friend request cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel friend request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling friend request',
      error: error.message
    });
  }
};

// @desc    Remove friend
// @route   DELETE /api/friends/:friendId
// @access  Private
exports.removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;

    const currentUser = await User.findById(req.userId);
    
    // Check if they are friends
    const isFriend = currentUser.friends.some(
      friend => friend.user.toString() === friendId
    );

    if (!isFriend) {
      return res.status(400).json({
        success: false,
        message: 'User is not in your friends list'
      });
    }

    // Remove from friends list for both users
    await User.findByIdAndUpdate(req.userId, {
      $pull: { 
        friends: { 
          user: friendId 
        } 
      }
    });

    await User.findByIdAndUpdate(friendId, {
      $pull: { 
        friends: { 
          user: req.userId 
        } 
      }
    });

    // Remove any friend requests between them
    await User.findByIdAndUpdate(req.userId, {
      $pull: { 
        friendRequests: { 
          $or: [
            { from: friendId },
            { to: friendId }
          ]
        } 
      }
    });

    await User.findByIdAndUpdate(friendId, {
      $pull: { 
        friendRequests: { 
          $or: [
            { from: req.userId },
            { to: req.userId }
          ]
        } 
      }
    });

    // Persist and emit friend-removed notification via factory
    try {
      await notificationFactory.createFriendRemovedNotification(friendId, req.userId);
    } catch (err) {
      console.error('Realtime notification error (removeFriend):', err);
    }

    res.json({
      success: true,
      message: 'Friend removed successfully'
    });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing friend',
      error: error.message
    });
  }
};

// @desc    Get user's friends
// @route   GET /api/friends
// @access  Private
exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('friends.user', 'username profile.avatar profile.bio')
      .select('friends');

    res.json({
      success: true,
      data: { 
        friends: user.friends 
      }
    });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching friends',
      error: error.message
    });
  }
};

// @desc    Get pending friend requests
// @route   GET /api/friends/requests
// @access  Private
exports.getFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('friendRequests.from', 'username profile.avatar')
      .populate('friendRequests.to', 'username profile.avatar')
      .select('friendRequests');

    const pendingRequests = user.friendRequests.filter(
      request => request.status === 'pending'
    );

    const incomingRequests = pendingRequests.filter(
      request => request.to.toString() === req.userId
    );

    const outgoingRequests = pendingRequests.filter(
      request => request.from.toString() === req.userId
    );

    res.json({
      success: true,
      data: { 
        incoming: incomingRequests,
        outgoing: outgoingRequests
      }
    });
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching friend requests',
      error: error.message
    });
  }
};

// @desc    Search users for adding friends
// @route   GET /api/friends/search
// @access  Private
exports.searchUsers = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const users = await User.find({
      _id: { $ne: req.userId },
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ],
      isActive: true
    })
      .select('username profile.avatar profile.bio friends')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Add friendship status to each user
    const currentUser = await User.findById(req.userId);
    const usersWithStatus = users.map(user => {
      const isFriend = currentUser.friends.some(
        friend => friend.user.toString() === user._id.toString()
      );
      
      const hasPendingRequest = currentUser.friendRequests.some(
        request => 
          (request.from.toString() === req.userId && 
           request.to.toString() === user._id.toString() &&
           request.status === 'pending') ||
          (request.from.toString() === user._id.toString() && 
           request.to.toString() === req.userId &&
           request.status === 'pending')
      );

      const incomingRequest = currentUser.friendRequests.find(
        request => 
          request.from.toString() === user._id.toString() && 
          request.to.toString() === req.userId &&
          request.status === 'pending'
      );

      const outgoingRequest = currentUser.friendRequests.find(
        request => 
          request.from.toString() === req.userId && 
          request.to.toString() === user._id.toString() &&
          request.status === 'pending'
      );

      return {
        ...user.toObject(),
        friendshipStatus: {
          isFriend,
          hasPendingRequest,
          incomingRequest: incomingRequest ? incomingRequest._id : null,
          outgoingRequest: outgoingRequest ? outgoingRequest._id : null
        }
      };
    });

    const total = await User.countDocuments({
      _id: { $ne: req.userId },
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ],
      isActive: true
    });

    res.json({
      success: true,
      data: {
        users: usersWithStatus,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching users',
      error: error.message
    });
  }
};

// @desc    Get friend suggestions
// @route   GET /api/friends/suggestions
// @access  Private
exports.getFriendSuggestions = async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    const friendIds = currentUser.friends.map(friend => friend.user.toString());
    
    // Get pending friend requests
    const pendingRequests = await FriendRequest.find({
      $or: [
        { from: req.userId },
        { to: req.userId }
      ],
      status: 'pending'
    });

    const requestUserIds = new Set();
    pendingRequests.forEach(request => {
      requestUserIds.add(request.from.toString());
      requestUserIds.add(request.to.toString());
    });
    
    // Get users who are not friends and not the current user
    const suggestedUsers = await User.find({
      _id: { 
        $ne: req.userId,
        $nin: friendIds
      },
      isActive: true
    })
      .select('username profile.avatar profile.bio')
      .limit(10)
      .sort({ createdAt: -1 });

    // Add friendship status to each suggestion
    const suggestions = suggestedUsers.map(user => {
      const userId = user._id.toString();
      const outgoingRequest = pendingRequests.find(
        req => req.from.toString() === req.userId.toString() && req.to.toString() === userId
      );
      const incomingRequest = pendingRequests.find(
        req => req.from.toString() === userId && req.to.toString() === req.userId.toString()
      );

      return {
        _id: user._id,
        username: user.username,
        profile: user.profile,
        friendshipStatus: {
          isFriend: false,
          hasPendingRequest: !!outgoingRequest || !!incomingRequest,
          outgoingRequest: outgoingRequest?._id,
          incomingRequest: incomingRequest?._id
        }
      };
    });

    res.json({
      success: true,
      data: { suggestions }
    });
  } catch (error) {
    console.error('Get friend suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching friend suggestions',
      error: error.message
    });
  }
};
