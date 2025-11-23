const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get user's chats
// @route   GET /api/chats
// @access  Private
exports.getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.userId,
      isActive: true
    })
      .populate('participants', 'username profile.avatar')
      .populate('lastMessage')
      .populate('groupAdmin', 'username')
      .sort({ updatedAt: -1 });

    // Format chats with display names and avatars
    const formattedChats = chats.map(chat => ({
      ...chat.toObject(),
      displayName: chat.getDisplayName(req.userId),
      displayAvatar: chat.getDisplayAvatar(req.userId)
    }));

    res.json({
      success: true,
      data: { chats: formattedChats }
    });
  } catch (error) {
    console.error('Get user chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chats',
      error: error.message
    });
  }
};

// @desc    Get or create one-on-one chat
// @route   POST /api/chats/one-on-one
// @access  Private
exports.getOrCreateOneOnOneChat = async (req, res) => {
  try {
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required'
      });
    }

    // Check if participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      isGroupChat: false,
      participants: { $all: [req.userId, participantId], $size: 2 }
    })
      .populate('participants', 'username profile.avatar')
      .populate('lastMessage');

    if (!chat) {
      // Create new one-on-one chat
      chat = await Chat.create({
        isGroupChat: false,
        participants: [req.userId, participantId]
      });

      await chat.populate('participants', 'username profile.avatar');
    }

    const formattedChat = {
      ...chat.toObject(),
      displayName: chat.getDisplayName(req.userId),
      displayAvatar: chat.getDisplayAvatar(req.userId)
    };

    res.json({
      success: true,
      data: { chat: formattedChat }
    });
  } catch (error) {
    console.error('Create one-on-one chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating chat',
      error: error.message
    });
  }
};

// @desc    Create group chat
// @route   POST /api/chats/group
// @access  Private
exports.createGroupChat = async (req, res) => {
  try {
    const { name, participants } = req.body;

    if (!name || !participants || participants.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Group name and at least 2 participants are required'
      });
    }

    // Add current user to participants
    const allParticipants = [...new Set([req.userId, ...participants])];

    const chat = await Chat.create({
      name,
      isGroupChat: true,
      participants: allParticipants,
      groupAdmin: req.userId
    });

    await chat.populate('participants', 'username profile.avatar');
    await chat.populate('groupAdmin', 'username');

    res.status(201).json({
      success: true,
      message: 'Group chat created successfully',
      data: { chat }
    });
  } catch (error) {
    console.error('Create group chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating group chat',
      error: error.message
    });
  }
};

// @desc    Get chat messages
// @route   GET /api/chats/:chatId/messages
// @access  Private
exports.getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if user is participant of the chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.userId
    });

    if (!chat) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat'
      });
    }

    const messages = await Message.find({ 
      chat: chatId,
      isActive: true 
    })
      .populate('sender', 'username profile.avatar')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments({ 
      chat: chatId,
      isActive: true 
    });

    // Mark messages as read
    await Message.updateMany(
      {
        chat: chatId,
        sender: { $ne: req.userId },
        'readBy.user': { $ne: req.userId }
      },
      {
        $push: {
          readBy: {
            user: req.userId,
            readAt: new Date()
          }
        }
      }
    );

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Return in chronological order
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      }
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching messages',
      error: error.message
    });
  }
};

// @desc    Send message
// @route   POST /api/chats/:chatId/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, replyTo } = req.body;

    // Check if user is participant of the chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.userId
    });

    if (!chat) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat'
      });
    }

    const message = await Message.create({
      sender: req.userId,
      content,
      chat: chatId,
      replyTo
    });

    await message.populate('sender', 'username profile.avatar');
    await message.populate('replyTo');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending message',
      error: error.message
    });
  }
};

// @desc    Update message
// @route   PUT /api/messages/:messageId
// @access  Private
exports.updateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findOne({
      _id: messageId,
      sender: req.userId
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or not authorized'
      });
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();

    await message.save();
    await message.populate('sender', 'username profile.avatar');
    await message.populate('replyTo');

    res.json({
      success: true,
      message: 'Message updated successfully',
      data: { message }
    });
  } catch (error) {
    console.error('Update message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating message',
      error: error.message
    });
  }
};

// @desc    Delete message
// @route   DELETE /api/messages/:messageId
// @access  Private
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findOne({
      _id: req.params.messageId,
      sender: req.userId
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or not authorized'
      });
    }

    // Soft delete
    message.isActive = false;
    await message.save();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting message',
      error: error.message
    });
  }
};

// @desc    Search users for chat
// @route   GET /api/chats/search-users
// @access  Private
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

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
      .select('username profile.avatar email')
      .limit(10);

    res.json({
      success: true,
      data: { users }
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