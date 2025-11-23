const express = require('express');
const { getNotifications, markAsRead, markAllRead } = require('../controllers/notificationsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markAsRead);
router.put('/read-all', protect, markAllRead);

module.exports = router;
