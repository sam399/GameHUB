const express = require('express');
const {
  getGames,
  getGame,
  createGame,
  updateGame,
  deleteGame,
  getFeaturedGames,
  getGamesByGenre
} = require('../controllers/gameController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getGames);
router.get('/featured', getFeaturedGames);
router.get('/genre/:genre', getGamesByGenre);
router.get('/:id', getGame);

// Admin routes
router.post('/', protect, authorize('admin'), createGame);
router.put('/:id', protect, authorize('admin'), updateGame);
router.delete('/:id', protect, authorize('admin'), deleteGame);

module.exports = router;