// scripts/createAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // adjust path if needed

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gameverse';

async function run() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const email = process.argv[2] || 'admin@example.com';
  const password = process.argv[3] || 'StrongPassword123';
  const username = process.argv[4] || 'adminuser';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('User exists:', existing._id.toString());
    existing.role = 'admin';
    await existing.save();
    console.log('User promoted to admin.');
    process.exit(0);
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ username, email, password: hashed, role: 'admin' });
  console.log('Admin user created:', user._id.toString());
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });