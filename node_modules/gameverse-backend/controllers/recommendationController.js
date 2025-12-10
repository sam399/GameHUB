const User = require('../models/User');
const Game = require('../models/Game');
const Review = require('../models/Review');

// @desc    Get AI-based Game Recommendations
// @route   GET /api/recommendations
// @access  Private
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.userId;

    // 1. Fetch User's High-Rated Games (4+ Stars)
    const userReviews = await Review.find({ user: userId, rating: { $gte: 4 } })
      .populate('game');

    if (userReviews.length === 0) {
      // Cold Start Problem: If user has no reviews, return popular games instead
      const popularGames = await Game.find().sort({ averageRating: -1 }).limit(5);
      return res.status(200).json({ 
        success: true, 
        data: popularGames, 
        reason: 'Popular (Start reviewing games to get personalized picks!)' 
      });
    }

    // 2. Build User "Taste Profile"
    // Count how often each genre appears in games they liked
    const genrePreferences = {};
    const playedGameIds = [];

    userReviews.forEach(review => {
      const game = review.game;
      playedGameIds.push(game._id.toString());
      
      // Assuming game.genre is a String or Array. Adapting for simple string genre here:
      const genres = game.genre.split(',').map(g => g.trim()); 
      
      genres.forEach(genre => {
        if (!genrePreferences[genre]) genrePreferences[genre] = 0;
        genrePreferences[genre] += review.rating; // Weighted by rating (5 stars = more weight)
      });
    });

    // 3. Fetch Candidate Games (Games user hasn't played yet)
    const candidateGames = await Game.find({ 
      _id: { $nin: playedGameIds } 
    }).lean();

    // 4. Calculate Compatibility Score
    const scoredGames = candidateGames.map(game => {
      let score = 0;
      const gameGenres = game.genre.split(',').map(g => g.trim());

      gameGenres.forEach(g => {
        if (genrePreferences[g]) {
          // Add the user's weight for this genre to the game's score
          score += genrePreferences[g];
        }
      });

      return { ...game, score };
    });

    // 5. Sort by Score and Return Top 5
    scoredGames.sort((a, b) => b.score - a.score);
    const topRecommendations = scoredGames.slice(0, 5);

    res.status(200).json({ 
      success: true, 
      data: topRecommendations,
      reason: 'Based on your recent reviews'
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};