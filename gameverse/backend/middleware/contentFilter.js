// Simple content filter without external dependencies
// Basic profanity list (can be expanded)
const bannedWords = [
  'spam', 'scam', 'fake', 'phishing', 
  // Add more words as needed
];

const contentFilter = (req, res, next) => {
  // Fields to check for banned content
  const textFields = ['title', 'comment', 'description', 'bio', 'content'];

  try {
    textFields.forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        let text = req.body[field];
        
        // Check for banned words (case-insensitive)
        bannedWords.forEach(word => {
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          text = text.replace(regex, '***');
        });
        
        req.body[field] = text;
      }
    });
    next();
  } catch (error) {
    console.error('Content Filter Error:', error);
    next(); // Proceed even if filter fails to avoid blocking the app
  }
};

module.exports = contentFilter;