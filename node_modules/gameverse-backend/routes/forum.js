const express = require('express');
const {
  getCategories,
  getThreadsByCategory,
  getThread,
  createThread,
  createPost,
  updatePost,
  deletePost,
  likePost,
  searchThreads
} = require('../controllers/forumController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/categories', getCategories);
router.get('/categories/:categoryId/threads', getThreadsByCategory);
router.get('/threads/:threadId', getThread);
router.get('/search', searchThreads);

// Protected routes
router.post('/categories/:categoryId/threads', protect, createThread);
router.post('/threads/:threadId/posts', protect, createPost);
router.put('/posts/:postId', protect, updatePost);
router.delete('/posts/:postId', protect, deletePost);
router.post('/posts/:postId/like', protect, likePost);

module.exports = router;