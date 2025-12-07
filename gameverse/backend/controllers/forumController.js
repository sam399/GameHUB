const ForumCategory = require('../models/ForumCategory');
const ForumThread = require('../models/ForumThread');
const ForumPost = require('../models/ForumPost');
const Activity = require('../models/Activity');
const User = require('../models/User');
const realtime = require('../realtime');

// @desc    Get all forum categories
// @route   GET /api/forum/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await ForumCategory.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 });

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories',
      error: error.message
    });
  }
};

// @desc    Get threads by category
// @route   GET /api/forum/categories/:categoryId/threads
// @access  Public
exports.getThreadsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 20, sortBy = 'lastPost.date', sortOrder = 'desc' } = req.query;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Always show pinned threads first
    const finalSort = { isPinned: -1, ...sort };

    const threads = await ForumThread.find({ 
      category: categoryId, 
      isActive: true 
    })
      .populate('author', 'username profile.avatar')
      .populate('lastPost.author', 'username')
      .sort(finalSort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ForumThread.countDocuments({ 
      category: categoryId, 
      isActive: true 
    });

    res.json({
      success: true,
      data: {
        threads,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      }
    });
  } catch (error) {
    console.error('Get threads error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching threads',
      error: error.message
    });
  }
};

// @desc    Get single thread with posts
// @route   GET /api/forum/threads/:threadId
// @access  Public
exports.getThread = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Increment thread views
    await ForumThread.findByIdAndUpdate(threadId, { $inc: { views: 1 } });

    const thread = await ForumThread.findById(threadId)
      .populate('author', 'username profile.avatar')
      .populate('category', 'name color');

    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found'
      });
    }

    const posts = await ForumPost.find({ 
      thread: threadId, 
      isActive: true 
    })
      .populate('author', 'username profile.avatar')
      .populate('parentPost', 'content author')
      .sort({ createdAt: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalPosts = await ForumPost.countDocuments({ 
      thread: threadId, 
      isActive: true 
    });

    res.json({
      success: true,
      data: {
        thread,
        posts,
        totalPages: Math.ceil(totalPosts / limit),
        currentPage: parseInt(page),
        total: totalPosts
      }
    });
  } catch (error) {
    console.error('Get thread error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching thread',
      error: error.message
    });
  }
};

// @desc    Create a new thread
// @route   POST /api/forum/categories/:categoryId/threads
// @access  Private
exports.createThread = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    // Check if category exists
    const category = await ForumCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const thread = await ForumThread.create({
      ...req.body,
      category: categoryId,
      author: req.userId
    });

    await thread.populate('author', 'username profile.avatar');
    await thread.populate('category', 'name color');

    // Update category counts
    await category.updateCounts();

    res.status(201).json({
      success: true,
      message: 'Thread created successfully',
      data: { thread }
    });
  } catch (error) {
    console.error('Create thread error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating thread',
      error: error.message
    });
  }
};

// @desc    Create a new post in thread
// @route   POST /api/forum/threads/:threadId/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    const { threadId } = req.params;
    
    // Check if thread exists and is not locked
    const thread = await ForumThread.findById(threadId);
    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found'
      });
    }

    if (thread.isLocked) {
      return res.status(403).json({
        success: false,
        message: 'Thread is locked'
      });
    }

    const post = await ForumPost.create({
      ...req.body,
      thread: threadId,
      author: req.userId
    });

    await post.populate('author', 'username profile.avatar');

    // Create activity for the feed
    try {
      await Activity.create({
        user: req.userId,
        type: 'GAME_ADDED',
        data: {
          gameId: null,
          gameName: thread.title,
          reviewRating: null
        },
        visibility: 'PUBLIC'
      });

      // Emit activity_created event
      const user = await User.findById(req.userId).select('username profile.avatar');
      realtime.io.emit('activity_created', {
        _id: null,
        user: { _id: req.userId, username: user?.username, profile: user?.profile },
        type: 'GAME_ADDED',
        data: {
          gameId: null,
          gameName: `Forum post in: ${thread.title}`,
          reviewRating: null
        },
        visibility: 'PUBLIC',
        createdAt: new Date()
      });
    } catch (activityErr) {
      console.warn('Forum post activity creation failed:', activityErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating post',
      error: error.message
    });
  }
};

// @desc    Update a post
// @route   PUT /api/forum/posts/:postId
// @access  Private
exports.updatePost = async (req, res) => {
  try {
    const post = await ForumPost.findOne({
      _id: req.params.postId,
      author: req.userId
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or not authorized'
      });
    }

    post.content = req.body.content;
    post.isEdited = true;
    post.editedAt = new Date();

    await post.save();
    await post.populate('author', 'username profile.avatar');

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: { post }
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating post',
      error: error.message
    });
  }
};

// @desc    Delete a post
// @route   DELETE /api/forum/posts/:postId
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const post = await ForumPost.findOne({
      _id: req.params.postId,
      author: req.userId
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or not authorized'
      });
    }

    // Soft delete
    post.isActive = false;
    await post.save();

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting post',
      error: error.message
    });
  }
};

// @desc    Like/unlike a post
// @route   POST /api/forum/posts/:postId/like
// @access  Private
exports.likePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const userId = req.userId;
    const hasLiked = post.likes.includes(userId);

    if (hasLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      success: true,
      message: hasLiked ? 'Post unliked' : 'Post liked',
      data: {
        likes: post.likes.length,
        hasLiked: !hasLiked
      }
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while liking post',
      error: error.message
    });
  }
};

// @desc    Search forum threads
// @route   GET /api/forum/search
// @access  Public
exports.searchThreads = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const threads = await ForumThread.find(
      { $text: { $search: q }, isActive: true },
      { score: { $meta: 'textScore' } }
    )
      .populate('author', 'username profile.avatar')
      .populate('category', 'name color')
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ForumThread.countDocuments({ 
      $text: { $search: q }, 
      isActive: true 
    });

    res.json({
      success: true,
      data: {
        threads,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      }
    });
  } catch (error) {
    console.error('Search threads error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching threads',
      error: error.message
    });
  }
};