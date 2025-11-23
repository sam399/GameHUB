const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { // recipient
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
