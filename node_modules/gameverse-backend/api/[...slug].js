// Catch-all serverless wrapper to forward any /api/* request to the Express app
// This file enables Vercel (backend project root = gameverse/backend) to route
// all API requests into the single Express app exported by server.js

const app = require('../server');

module.exports = (req, res) => {
  // Let the Express app handle the request
  return app(req, res);
};
