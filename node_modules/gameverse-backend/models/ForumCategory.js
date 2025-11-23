const mongoose = require('mongoose');

const forumCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Category description is required'],
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  color: {
    type: String,
    default: '#667eea'
  },
  icon: {
    type: String,
    default: '📁'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  threadCount: {
    type: Number,
    default: 0
  },
  postCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Update counts when threads are added/removed
forumCategorySchema.methods.updateCounts = async function() {
  const Thread = mongoose.model('ForumThread');
  const Post = mongoose.model('ForumPost');
  
  const threadCount = await Thread.countDocuments({ 
    category: this._id, 
    isActive: true 
  });
  
  const postCount = await Post.countDocuments({ 
    thread: { $in: await Thread.find({ category: this._id }).distinct('_id') },
    isActive: true 
  });
  
  this.threadCount = threadCount;
  this.postCount = postCount;
  await this.save();
};

module.exports = mongoose.model('ForumCategory', forumCategorySchema);