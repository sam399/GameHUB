const express = require('express');
const {
  getUserChats,
  getOrCreateOneOnOneChat,
  createGroupChat,
  getChatMessages,
  sendMessage,
  updateMessage,
  deleteMessage,
  searchUsers
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getUserChats);
router.get('/search-users', protect, searchUsers);
router.post('/one-on-one', protect, getOrCreateOneOnOneChat);
router.post('/group', protect, createGroupChat);
router.get('/:chatId/messages', protect, getChatMessages);
router.post('/:chatId/messages', protect, sendMessage);
router.put('/messages/:messageId', protect, updateMessage);
router.delete('/messages/:messageId', protect, deleteMessage);

module.exports = router;