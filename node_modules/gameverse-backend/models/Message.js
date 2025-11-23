const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Message must have a sender']
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: [true, 'Message must belong to a chat']
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  attachments: [{
    url: String,
    filename: String,
    fileType: String,
    fileSize: Number
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Update last message in chat when new message is created
messageSchema.post('save', async function() {
  const Chat = mongoose.model('Chat');
  await Chat.findByIdAndUpdate(this.chat, { lastMessage: this._id });
});

// Index for efficient querying
messageSchema.index({ chat: 1, createdAt: 1 });

// Method to mark message as read
messageSchema.methods.markAsRead = async function(userId) {
  const hasRead = this.readBy.some(read => read.user.toString() === userId.toString());
  
  if (!hasRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
    await this.save();
  }
};

// Method to check if user has read the message
messageSchema.methods.hasRead = function(userId) {
  return this.readBy.some(read => read.user.toString() === userId.toString());
};

module.exports = mongoose.model('Message', messageSchema);