const express = require('express');
const router = express.Router();
const { createEvent, getEvents, joinEvent } = require('../controllers/eventController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(getEvents)
  .post(protect, createEvent);

router.post('/:id/join', protect, joinEvent);

module.exports = router;