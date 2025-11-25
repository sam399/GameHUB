const express = require('express');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  updateWishlistItem,
  togglePrivacy,
  getPublicWishlist,
  checkGameInWishlist
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getWishlist);
router.get('/check/:gameId', protect, checkGameInWishlist);
router.get('/user/:userId', getPublicWishlist);
router.post('/games', protect, addToWishlist);
router.put('/games/:gameId', protect, updateWishlistItem);
router.put('/privacy', protect, togglePrivacy);
router.delete('/games/:gameId', protect, removeFromWishlist);

module.exports = router;