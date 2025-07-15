import { connectDB } from './mongodb';
import mongoose from 'mongoose';

export async function migrateDatabase() {
  try {
    await connectDB();
    
    // Get the users collection
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const usersCollection = db.collection('users');
    
    // Drop existing indexes
    try {
      await usersCollection.dropIndexes();
    } catch (error: any) {
      if (error.code === 26) {
        // console.log('No indexes to drop'); // Removed
      } else {
        console.error('Error dropping indexes:', error);
      }
    }
    
    // Create new indexes based on current schema
    
    // Phone index (unique)
    await usersCollection.createIndex({ phone: 1 }, { unique: true });
    
    // Active users index
    await usersCollection.createIndex({ isActive: 1 });
    
    // Phone verified index
    await usersCollection.createIndex({ phoneVerified: 1 });
    
    // Update existing users to have proper default values
    const result = await usersCollection.updateMany(
      { 
        $or: [
          { name: { $exists: false } },
          { name: null },
          { name: '' }
        ]
      },
      {
        $set: {
          name: '',
          profileCompleted: false,
          phoneVerified: true,
          address: {
            street: '',
            city: '',
            state: '',
            pincode: ''
          }
        }
      }
    );
    
    return { success: true, message: 'Migration completed' };
  } catch (error: any) {
    console.error('Migration error:', error);
    return { success: false, message: error.message };
  }
}

// Run if called directly
if (require.main === module) {
  migrateDatabase()
    .then((result) => {
      console.log(result);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
} 