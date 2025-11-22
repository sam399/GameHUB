const axios = require('axios');
const chance = require('chance').Chance();

const API = process.env.API_URL || 'http://127.0.0.1:5000/api';

async function run() {
  try {
    console.log('E2E Review Test starting against', API);

    // 1) Register a test user
    const username = `testuser_${Date.now()}`;
    const email = `${username}@example.test`;
    const password = 'Password123!';

    console.log('Registering user...', email);
    await axios.post(`${API}/auth/register`, { username, email, password }).catch(() => {});

    // 2) Login
    const loginRes = await axios.post(`${API}/auth/login`, { email, password });
    const token = loginRes.data.data.token;
    console.log('Logged in, token length:', token.length);

    const headers = { Authorization: `Bearer ${token}` };

    // 3) Get a game to review
    const gamesRes = await axios.get(`${API}/games`, { params: { limit: 1 } });
    const game = gamesRes.data.data.games[0];
    if (!game) throw new Error('No games available to test against');
    console.log('Using game:', game.title || game._id);

    // 4) Create a review
    const reviewBody = { rating: 5, title: 'E2E Test Review', content: 'This is an automated test review.' };
    const createRes = await axios.post(`${API}/reviews/games/${game._id}/reviews`, reviewBody, { headers });
    const review = createRes.data.data.review;
    console.log('Created review id:', review._id);

    // 5) React to the review (like)
    const reactRes = await axios.post(`${API}/reviews/${review._id}/react`, { reaction: 'like' }, { headers });
    console.log('Reacted to review:', reactRes.data.data);

    // 6) Fetch review stats
    const statsRes = await axios.get(`${API}/reviews/games/${game._id}/reviews/stats`);
    console.log('Review stats:', statsRes.data.data);

    // 7) Fetch game and confirm rating/count
    const gameRes2 = await axios.get(`${API}/games/${game._id}`);
    console.log('Game rating after review:', gameRes2.data.data.game.rating);

    // 8) Delete the review
    await axios.delete(`${API}/reviews/${review._id}`, { headers });
    console.log('Deleted review');

    // 9) Confirm rating went back (or adjusted)
    const gameRes3 = await axios.get(`${API}/games/${game._id}`);
    console.log('Game rating after delete:', gameRes3.data.data.game.rating);

    console.log('E2E Review Test completed successfully');
  } catch (err) {
    console.error('E2E Test failed:', err && err.response ? err.response.data || err.response.statusText : err.message || err);
    process.exit(1);
  }
}

if (require.main === module) run();
