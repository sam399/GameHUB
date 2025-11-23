const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [2000, 'Content cannot exceed 2000 characters']
  },
  thread: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumThread',
    required: [true, 'Post must belong to a thread']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Post must have an author']
  },
  parentPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumPost'
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
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

// Update thread's last post when a new post is created
forumPostSchema.post('save', async function() {
  const Thread = mongoose.model('ForumThread');
  const thread = await Thread.findById(this.thread);
  if (thread) {
    await thread.updateLastPost();
  }
});

// Update thread when post is deleted
forumPostSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    const Thread = mongoose.model('ForumThread');
    const thread = await Thread.findById(doc.thread);
    if (thread) {
      await thread.updateLastPost();
    }
  }
});

// Method to check if user has liked the post
forumPostSchema.methods.hasLiked = function(userId) {
  return this.likes.includes(userId);
};

module.exports = mongoose.model('ForumPost', forumPostSchema);