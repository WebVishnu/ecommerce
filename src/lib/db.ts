import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shivangi-battery';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

async function dbConnect() {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    await mongoose.connect(MONGODB_URI);
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default dbConnect; 