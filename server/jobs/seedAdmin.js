import dotenv from 'dotenv';

dotenv.config();

import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { hashPassword } from '../utils/hashPassword.js';

async function seed() {
  const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;

  if (!MONGODB_URI) throw new Error('MONGODB_URI missing');
  if (!ADMIN_EMAIL) throw new Error('ADMIN_EMAIL missing');
  if (!ADMIN_PASSWORD) throw new Error('ADMIN_PASSWORD missing');

  await mongoose.connect(MONGODB_URI);

  const email = String(ADMIN_EMAIL).toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`[seedAdmin] Admin already exists: ${email}`);
    process.exit(0);
  }

  const user = await User.create({
    name: ADMIN_NAME || 'Admin',
    email,
    passwordHash: hashPassword(ADMIN_PASSWORD),
    role: 'admin',
  });

  console.log(`[seedAdmin] Seeded admin: ${user.email} (${user._id})`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seedAdmin] Failed:', err);
  process.exit(1);
});

