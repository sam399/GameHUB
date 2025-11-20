const mongoose = require('mongoose');
const Game = require('../models/Game');
require('dotenv').config();

const sampleGames = [
  {
    title: "The Witcher 3: Wild Hunt",
    description: "The Witcher 3: Wild Hunt is a story-driven, next-generation open world role-playing game, set in a visually stunning fantasy universe, full of meaningful choices and impactful consequences.",
    genre: ["RPG", "Action", "Adventure"],
    platforms: ["PC", "PlayStation", "Xbox"],
    developer: "CD Projekt Red",
    publisher: "CD Projekt",
    releaseDate: new Date("2015-05-19"),
    rating: { average: 4.8, count: 15000 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg",
      screenshots: [
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc5l76.jpg",
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc5l77.jpg"
      ]
    },
    price: 39.99,
    isFree: false,
    featured: true,
    tags: ["open-world", "fantasy", "rpg"]
  },
  {
    title: "Cyberpunk 2077",
    description: "Cyberpunk 2077 is an open-world, action-adventure RPG set in the megalopolis of Night City, where you play as a cyberpunk mercenary wrapped up in a do-or-die fight for survival.",
    genre: ["RPG", "Action", "Sci-fi"],
    platforms: ["PC", "PlayStation", "Xbox"],
    developer: "CD Projekt Red",
    publisher: "CD Projekt",
    releaseDate: new Date("2020-12-10"),
    rating: { average: 4.2, count: 12000 },
    images: {
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2d7h.jpg",
      screenshots: [
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc5u6z.jpg",
        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/sc5u70.jpg"
      ]
    },
    price: 59.99,
    isFree: false,
    featured: true,
    tags: ["cyberpunk", "futuristic", "rpg"]
  }
];

// Export sampleGames for programmatic seeding
module.exports = {
  sampleGames,
  seedGames: async () => {
    try {
        // Try environment/local MongoDB first
        const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gameverse';
        try {
          await mongoose.connect(uri);
          console.log('Connected to MongoDB');
        } catch (connErr) {
          console.warn('Local MongoDB not available, falling back to in-memory server:', connErr.message || connErr);
          const { MongoMemoryServer } = require('mongodb-memory-server');
          const mongod = await MongoMemoryServer.create();
          const memUri = mongod.getUri();
          await mongoose.connect(memUri);
          console.log('Connected to in-memory MongoDB');
        }

      // Clear existing games
      await Game.deleteMany({});
      console.log('Cleared existing games');

      // Insert sample games
      await Game.insertMany(sampleGames);
      console.log('Sample games inserted successfully');

      process.exit(0);
    } catch (error) {
      console.error('Error seeding games:', error);
      process.exit(1);
    }
  }
};

// Seed into an already-connected mongoose instance (useful when server is running)
module.exports.seedIntoExistingConnection = async () => {
  try {
    await Game.deleteMany({});
    await Game.insertMany(sampleGames);
    console.log('Sample games inserted into existing connection');
    return true;
  } catch (err) {
    console.error('Error inserting into existing connection:', err);
    throw err;
  }
};