import { connectDB } from './mongodb';
import mongoose from 'mongoose';

export async function migrateDatabase() {
  try {
    await connectDB();
    
    console.log('Starting database migration...');
    
    // Get the users collection
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const usersCollection = db.collection('users');
    
    // Drop existing indexes
    console.log('Dropping existing indexes...');
    try {
      await usersCollection.dropIndexes();
      console.log('All indexes dropped successfully');
    } catch (error: any) {
      if (error.code === 26) {
        console.log('No indexes to drop');
      } else {
        console.error('Error dropping indexes:', error);
      }
    }
    
    // Create new indexes based on current schema
    console.log('Creating new indexes...');
    
    // Phone index (unique)
    await usersCollection.createIndex({ phone: 1 }, { unique: true });
    console.log('Phone index created');
    
    // Active users index
    await usersCollection.createIndex({ isActive: 1 });
    console.log('Active users index created');
    
    // Phone verified index
    await usersCollection.createIndex({ phoneVerified: 1 });
    console.log('Phone verified index created');
    
    // Update existing users to have proper default values
    console.log('Updating existing users...');
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
    
    console.log(`Updated ${result.modifiedCount} users`);
    
    console.log('Database migration completed successfully!');
    
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