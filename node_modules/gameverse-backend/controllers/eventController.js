const Event = require('../models/Event');
const Activity = require('../models/Activity'); // To log the creation in the feed

// @desc    Create a new event
// @route   POST /api/events
exports.createEvent = async (req, res) => {
  try {
    // Add user to req.body as host
    req.body.host = req.userId;

    const event = await Event.create(req.body);

    // Optional: Log to Activity Feed
    // await Activity.create({ ... });

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all upcoming events
// @route   GET /api/events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: { $ne: 'CANCELLED' } })
      .populate('host', 'username avatar')
      .populate('game', 'title')
      .sort({ startTime: 1 }); // Soonest first

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register for an event
// @route   POST /api/events/:id/join
exports.joinEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if event is full
    if (event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Event is full' });
    }

    // Check if already registered
    const isRegistered = event.participants.some(p => p.user.toString() === req.userId);
    if (isRegistered) {
      return res.status(400).json({ success: false, message: 'Already registered' });
    }

    // Add participant
    event.participants.push({ user: req.userId });
    await event.save();

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};