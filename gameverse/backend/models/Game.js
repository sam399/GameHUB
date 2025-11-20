const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Game title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Game description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  genre: [{
    type: String,
    required: [true, 'At least one genre is required']
  }],
  platforms: [{
    type: String,
    required: [true, 'At least one platform is required']
  }],
  developer: {
    type: String,
    required: [true, 'Developer name is required']
  },
  publisher: {
    type: String,
    required: [true, 'Publisher name is required']
  },
  releaseDate: {
    type: Date,
    required: [true, 'Release date is required']
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5']
    },
    count: {
      type: Number,
      default: 0
    }
  },
  images: {
    cover: {
      type: String,
      default: ''
    },
    screenshots: [{
      type: String
    }]
  },
  website: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    min: [0, 'Price cannot be negative'],
    default: 0
  },
  isFree: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String
  }],
  systemRequirements: {
    minimum: {
      os: String,
      processor: String,
      memory: String,
      graphics: String,
      storage: String
    },
    recommended: {
      os: String,
      processor: String,
      memory: String,
      graphics: String,
      storage: String
    }
  },
  featured: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for search functionality
gameSchema.index({
  title: 'text',
  description: 'text',
  genre: 'text',
  developer: 'text'
});

// Virtual for formatted release date
gameSchema.virtual('formattedReleaseDate').get(function() {
  return this.releaseDate.toISOString().split('T')[0];
});

// Method to update rating
gameSchema.methods.updateRating = function(newRating) {
  const totalRating = this.rating.average * this.rating.count + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.save();
};

module.exports = mongoose.model('Game', gameSchema);