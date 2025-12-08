// Deprecated backend health check — consolidated to repository root `api/health.js`.
// This stub returns 410 Gone and instructs to use the root health endpoint.
module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 410; // Gone
  res.end(JSON.stringify({
    status: 'deprecated',
    message: 'This backend/api/health endpoint has been consolidated. Use /api/health at repository root.',
    canonical: '/api/health'
  }));
};
