const mongoose = require('mongoose');
const ForumCategory = require('../models/ForumCategory');
require('dotenv').config();

const sampleCategories = [
  {
    name: "General Discussion",
    description: "Talk about anything gaming-related! Share news, discuss trends, and connect with the community.",
    color: "#667eea",
    icon: "💬",
    order: 1
  },
  {
    name: "Game Help & Support",
    description: "Stuck in a game? Need tips or walkthroughs? Get help from fellow gamers here.",
    color: "#28a745",
    icon: "❓",
    order: 2
  },
  {
    name: "Multiplayer & Co-op",
    description: "Find gaming partners, organize sessions, and discuss multiplayer experiences.",
    color: "#dc3545",
    icon: "👥",
    order: 3
  },
  {
    name: "Reviews & Recommendations",
    description: "Share your game reviews and get recommendations from the community.",
    color: "#ffc107",
    icon: "⭐",
    order: 4
  },
  {
    name: "Tech Support",
    description: "Having technical issues? Get help with hardware, software, and performance problems.",
    color: "#17a2b8",
    icon: "🔧",
    order: 5
  },
  {
    name: "eSports & Competitive",
    description: "Discuss competitive gaming, tournaments, and professional eSports scenes.",
    color: "#e83e8c",
    icon: "🏆",
    order: 6
  }
];

const seedForum = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing categories
    await ForumCategory.deleteMany({});
    console.log('Cleared existing forum categories');

    // Insert sample categories
    await ForumCategory.insertMany(sampleCategories);
    console.log('Sample forum categories inserted successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding forum:', error);
    process.exit(1);
  }
};

seedForum();