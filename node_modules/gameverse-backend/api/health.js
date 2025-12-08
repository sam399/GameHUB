// Backend health check for standalone backend project deployments
module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify({
    status: 'ok',
    service: 'GameVerse backend (health check)',
    time: new Date().toISOString()
  }));
};
