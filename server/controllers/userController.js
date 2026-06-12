import { User } from '../models/User.js';

export async function getUser(req, res) {
  res.json({ user: req.user });
}

export async function listUsers(_req, res) {
  const users = await User.find().limit(50).select('_id name email role');
  res.json({ users });
}

