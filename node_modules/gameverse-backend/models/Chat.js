const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: function() {
      return this.isGroupChat;
    },
    maxlength: [50, 'Chat name cannot exceed 50 characters']
  },
  isGroupChat: {
    type: Boolean,
    default: false
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Chat must have participants']
  }],
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  avatar: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Ensure participants are unique
chatSchema.index({ participants: 1 }, { unique: true, sparse: true });

// Method to check if user is participant
chatSchema.methods.isParticipant = function(userId) {
  return this.participants.includes(userId);
};

// Method to get chat name for display
chatSchema.methods.getDisplayName = function(currentUserId) {
  if (this.isGroupChat) {
    return this.name;
  }
  
  // For one-on-one chats, return the other participant's username
  const otherParticipant = this.participants.find(
    participant => participant._id.toString() !== currentUserId.toString()
  );
  
  return otherParticipant ? otherParticipant.username : 'Unknown User';
};

// Method to get chat avatar for display
chatSchema.methods.getDisplayAvatar = function(currentUserId) {
  if (this.avatar) {
    return this.avatar;
  }
  
  if (this.isGroupChat) {
    return ''; // Default group avatar
  }
  
  // For one-on-one chats, return the other participant's avatar
  const otherParticipant = this.participants.find(
    participant => participant._id.toString() !== currentUserId.toString()
  );
  
  return otherParticipant ? otherParticipant.profile.avatar : '';
};

module.exports = mongoose.model('Chat', chatSchema);