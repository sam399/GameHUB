const express = require('express');
const {
  getUserLibrary,
  trackGame,
  updateGameTracking,
  removeFromLibrary,
  addPlaySession,
  getGameTracking,
  getGamingStats
} = require('../controllers/gameTrackingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getUserLibrary);
router.get('/stats', protect, getGamingStats);
router.get('/games/:gameId', protect, getGameTracking);
router.post('/games', protect, trackGame);
router.put('/games/:gameId', protect, updateGameTracking);
router.delete('/games/:gameId', protect, removeFromLibrary);
router.post('/games/:gameId/sessions', protect, addPlaySession);

module.exports = router;