import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  console.log('Mongo URI:', uri);

  if (!uri) {
    console.warn('[database] MONGODB_URI not set. Skipping DB connection.');
    return;
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri);

  console.log('[database] Connected to MongoDB');
} 