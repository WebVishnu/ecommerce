import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

async function dbConnect() {
  try {
    // If already connected, return the connection
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    // If connecting, wait for it to complete
    if (mongoose.connection.readyState === 2) {
      await new Promise((resolve) => {
        mongoose.connection.once('connected', resolve);
      });
      return mongoose.connection;
    }

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI!, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    // Set up connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default dbConnect; 