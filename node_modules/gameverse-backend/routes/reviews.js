const express = require('express');
const {
  getGameReviews,
  getUserReviews,
  createReview,
  updateReview,
  deleteReview,
  reactToReview,
  getReviewStats
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/games/:gameId/reviews', getGameReviews);
router.get('/games/:gameId/reviews/stats', getReviewStats);

// Protected routes
router.get('/user', protect, getUserReviews);
router.post('/games/:gameId/reviews', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/react', protect, reactToReview);

module.exports = router;
const contentFilter = require('../middleware/contentFilter');

// In your route definition:
router.post('/', protect, contentFilter, createReview); 
// Now, if a user sends "This game is s***!", it gets saved as "This game is ***!"