// Serverless wrapper for Vercel - keeps local `server.js` unchanged
const app = require('./server');

// Export a standard (req, res) handler for Vercel's Node runtime
module.exports = (req, res) => {
  // Ensure Express handles the request
  return app(req, res);
};
