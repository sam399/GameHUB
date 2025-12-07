const mongoose = require('mongoose');

const notificationPreferenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Activity type preferences
  activities: {
    achievement_unlocked: { type: Boolean, default: true },
    game_reviewed: { type: Boolean, default: true },
    new_highscore: { type: Boolean, default: true },
    game_added: { type: Boolean, default: true }
  },

  // System notifications
  system: {
    friend_requests: { type: Boolean, default: true },
    friend_accepted: { type: Boolean, default: true },
    messages: { type: Boolean, default: true },
    leaderboard_updates: { type: Boolean, default: true },
    achievement_updates: { type: Boolean, default: true }
  },

  // Delivery methods
  delivery: {
    in_app: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: false }
  },

  // Email digest preferences
  email_digest: {
    enabled: { type: Boolean, default: true },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'never'],
      default: 'weekly'
    },
    preferred_day: { type: Number, min: 0, max: 6, default: 1 }, // 0 = Sunday, 1 = Monday, etc.
    preferred_hour: { type: Number, min: 0, max: 23, default: 9 } // 0-23 (UTC)
  },

  // Quiet hours
  quiet_hours: {
    enabled: { type: Boolean, default: false },
    start_hour: { type: Number, min: 0, max: 23, default: 22 }, // UTC
    end_hour: { type: Number, min: 0, max: 23, default: 8 }     // UTC
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field on save
notificationPreferenceSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('NotificationPreference', notificationPreferenceSchema);
