(async () => {
  const BACKEND = process.env.VITE_API_URL || 'http://127.0.0.1:5000';
  const fetch = globalThis.fetch;
  const { io } = require('socket.io-client');

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  async function register(email, username) {
    try {
      const res = await fetch(`${BACKEND}/api/auth/register`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, email, password: 'Password123!' })
      });
      const j = await res.json();
      return j;
    } catch (e) {
      console.error('register error', e);
      throw e;
    }
  }

  async function login(email) {
    const res = await fetch(`${BACKEND}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password: 'Password123!' })
    });
    return res.json();
  }

  try {
    console.log('Creating users...');
    await register('smoketest1@example.com', 'smoketest1').catch(()=>{});
    await register('smoketest2@example.com', 'smoketest2').catch(()=>{});

    const a = await login('smoketest1@example.com');
    const b = await login('smoketest2@example.com');

    if(!a || !a.data || !a.data.token) throw new Error('login A failed');
    if(!b || !b.data || !b.data.token) throw new Error('login B failed');

    const userA = a.data.user; const tokenA = a.data.token;
    const userB = b.data.user; const tokenB = b.data.token;

    console.log('Users logged in:', userA.username, userB.username);

    // Create or get one-on-one chat (use A to request chat with B)
    const r = await fetch(`${BACKEND}/api/chats/one-on-one`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + tokenA },
      body: JSON.stringify({ participantId: userB._id })
    });
    const chatRes = await r.json();
    if(!chatRes || !chatRes.data || !chatRes.data.chat) throw new Error('failed to create/get chat');
    const chat = chatRes.data.chat;
    console.log('Chat ready:', chat._id);

    // connect two sockets from frontend node_modules (script runs in frontend)
    const socketA = io(BACKEND, { transports: ['websocket'] });
    const socketB = io(BACKEND, { transports: ['websocket'] });

    socketA.on('connect', () => {
      console.log('socketA connected', socketA.id);
      socketA.emit('user_connected', userA._id);
    });
    socketB.on('connect', () => {
      console.log('socketB connected', socketB.id);
      socketB.emit('user_connected', userB._id);
    });

    socketB.on('user_typing', (d) => console.log('socketB user_typing', d));
    socketB.on('new_message', (d) => console.log('socketB new_message received', d && d.message && d.message.content));
    socketB.on('messages_read', (d) => console.log('socketB messages_read', d));

    // wait for both connected
    await sleep(1000);

    // join chat rooms
    socketA.emit('join_chat', chat._id);
    socketB.emit('join_chat', chat._id);
    console.log('Both clients joined chat room');

    // simulate typing from A
    console.log('A starts typing...');
    socketA.emit('typing_start', { chatId: chat._id, userId: userA._id });
    await sleep(800);
    socketA.emit('typing_stop', { chatId: chat._id, userId: userA._id });
    console.log('A stopped typing');

    // send message from A: persist via REST then emit via socket
    const sendRes = await fetch(`${BACKEND}/api/chats/${chat._id}/messages`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + tokenA },
      body: JSON.stringify({ content: 'Hello from A (smoke test)' })
    });
    const sendJson = await sendRes.json();
    if(!sendJson || !sendJson.data || !sendJson.data.message) throw new Error('send message failed');
    const message = sendJson.data.message;
    console.log('Message persisted id:', message._id);

    // A emits socket send_message so others receive real-time
    socketA.emit('send_message', { chatId: chat._id, message, sender: userA });

    // wait to receive
    await sleep(1500);

    // mark messages read from B side via socket
    socketB.emit('mark_messages_read', { chatId: chat._id, userId: userB._id });

    await sleep(1000);

    console.log('Smoke test finished, disconnecting sockets');
    socketA.disconnect(); socketB.disconnect();

    process.exit(0);
  } catch (err) {
    console.error('Smoke test error', err);
    process.exit(2);
  }
})();
