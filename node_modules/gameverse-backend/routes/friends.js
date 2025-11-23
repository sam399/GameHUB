const express = require('express');
const {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend,
  getFriends,
  getFriendRequests,
  searchUsers,
  getFriendSuggestions
} = require('../controllers/friendController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getFriends);
router.get('/requests', protect, getFriendRequests);
router.get('/search', protect, searchUsers);
router.get('/suggestions', protect, getFriendSuggestions);
router.post('/requests', protect, sendFriendRequest);
router.put('/requests/:requestId/accept', protect, acceptFriendRequest);
router.put('/requests/:requestId/reject', protect, rejectFriendRequest);
router.delete('/requests/:requestId', protect, cancelFriendRequest);
router.delete('/:friendId', protect, removeFriend);

module.exports = router;