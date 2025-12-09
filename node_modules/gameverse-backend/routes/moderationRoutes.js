const express = require('express');
const router = express.Router();
const { createReport, getModerationQueue, resolveReport } = require('../controllers/moderationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/report', protect, createReport);
router.get('/queue', protect, authorize('admin', 'moderator'), getModerationQueue);
router.put('/resolve/:id', protect, authorize('admin', 'moderator'), resolveReport);

module.exports = router;