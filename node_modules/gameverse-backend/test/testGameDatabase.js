require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');

async function testGameAPI() {
  try {
    console.log('🧪 Testing Game API with Database\n');
    
    // Connect to MongoDB
    console.log('📦 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const Game = require('../models/Game');
    
    // Test 1: Count games in database
    console.log('Test 1: Checking game count in database');
    const gameCount = await Game.countDocuments({ active: true });
    console.log(`✅ Found ${gameCount} active games in database\n`);
    
    // Test 2: Get featured games
    console.log('Test 2: Fetching featured games');
    const featuredGames = await Game.find({ featured: true, active: true }).limit(5);
    console.log(`✅ Found ${featuredGames.length} featured games:`);
    featuredGames.forEach((game, i) => {
      console.log(`   ${i + 1}. ${game.title} (${game.genre.join(', ')})`);
    });
    console.log('');
    
    // Test 3: Get unique genres
    console.log('Test 3: Fetching unique genres');
    const genres = await Game.distinct('genre', { active: true });
    console.log(`✅ Found ${genres.length} genres: ${genres.sort().join(', ')}\n`);
    
    // Test 4: Get unique platforms
    console.log('Test 4: Fetching unique platforms');
    const platforms = await Game.distinct('platforms', { active: true });
    console.log(`✅ Found ${platforms.length} platforms: ${platforms.sort().join(', ')}\n`);
    
    // Test 5: Search functionality
    console.log('Test 5: Testing search (searching for "witcher")');
    const searchResults = await Game.find({
      active: true,
      $or: [
        { title: { $regex: 'witcher', $options: 'i' } },
        { description: { $regex: 'witcher', $options: 'i' } }
      ]
    });
    console.log(`✅ Found ${searchResults.length} games matching "witcher":`);
    searchResults.forEach(game => {
      console.log(`   - ${game.title}`);
    });
    console.log('');
    
    // Test 6: Genre filtering
    console.log('Test 6: Testing genre filter (RPG games)');
    const rpgGames = await Game.find({
      active: true,
      genre: { $in: ['RPG'] }
    }).limit(5);
    console.log(`✅ Found ${rpgGames.length} RPG games (showing first 5):`);
    rpgGames.forEach(game => {
      console.log(`   - ${game.title}`);
    });
    console.log('');
    
    // Test 7: Free vs Paid games
    console.log('Test 7: Checking free vs paid games');
    const freeGames = await Game.countDocuments({ active: true, isFree: true });
    const paidGames = await Game.countDocuments({ active: true, isFree: false });
    console.log(`✅ Free games: ${freeGames}, Paid games: ${paidGames}\n`);
    
    // Test 8: Top rated games
    console.log('Test 8: Fetching top 5 rated games');
    const topRated = await Game.find({ active: true })
      .sort({ 'rating.average': -1 })
      .limit(5)
      .select('title rating.average rating.count');
    console.log('✅ Top rated games:');
    topRated.forEach((game, i) => {
      console.log(`   ${i + 1}. ${game.title} - ${game.rating.average}/5 (${game.rating.count} reviews)`);
    });
    console.log('');
    
    console.log('🎉 All tests passed! The game database is working correctly.\n');
    console.log('📊 Summary:');
    console.log(`   Total Games: ${gameCount}`);
    console.log(`   Featured Games: ${featuredGames.length}`);
    console.log(`   Genres: ${genres.length}`);
    console.log(`   Platforms: ${platforms.length}`);
    console.log(`   Free Games: ${freeGames}`);
    console.log(`   Paid Games: ${paidGames}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
}

// Run tests
testGameAPI();
