const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an event title'],
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  game: {
    type: mongoose.Schema.Types.ObjectId, // The game being played
    ref: 'Game',
    required: true
  },
  eventType: {
    type: String,
    enum: ['TOURNAMENT', 'LAN_PARTY', 'CASUAL_MEETUP'],
    default: 'TOURNAMENT'
  },
  startTime: {
    type: Date,
    required: true
  },
  isOnline: {
    type: Boolean,
    default: true
  },
  location: { // Discord Link for online, Address for physical
    type: String, 
    required: true 
  },
  maxParticipants: {
    type: Number,
    default: 16
  },
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    registeredAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['REGISTERED', 'CHECKED_IN', 'ELIMINATED', 'WINNER'], default: 'REGISTERED' }
  }],
  status: {
    type: String,
    enum: ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'],
    default: 'UPCOMING'
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);