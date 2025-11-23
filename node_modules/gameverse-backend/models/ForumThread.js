const mongoose = require('mongoose');

const forumThreadSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Thread title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Thread content is required'],
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumCategory',
    required: [true, 'Thread must belong to a category']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Thread must have an author']
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  postCount: {
    type: Number,
    default: 0
  },
  lastPost: {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: Date
    }
  },
  tags: [{
    type: String,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Update thread's last post and post count
forumThreadSchema.methods.updateLastPost = async function() {
  const Post = mongoose.model('ForumPost');
  const lastPost = await Post.findOne({ 
    thread: this._id, 
    isActive: true 
  }).sort({ createdAt: -1 });
  
  if (lastPost) {
    this.lastPost = {
      author: lastPost.author,
      date: lastPost.createdAt
    };
  }
  
  this.postCount = await Post.countDocuments({ 
    thread: this._id, 
    isActive: true 
  });
  
  await this.save();
  
  // Update category counts
  const Category = mongoose.model('ForumCategory');
  const category = await Category.findById(this.category);
  if (category) {
    await category.updateCounts();
  }
};

// Increment views
forumThreadSchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
};

// Text index for search
forumThreadSchema.index({
  title: 'text',
  content: 'text',
  tags: 'text'
});

module.exports = mongoose.model('ForumThread', forumThreadSchema);