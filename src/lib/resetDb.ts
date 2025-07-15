import { connectDB } from './mongodb';
import User from '@/models/User';

export async function resetDatabase() {
  try {
    await connectDB();
    
    await User.deleteMany({});
    
    return { success: true, message: 'Database reset completed' };
  } catch (error: any) {
    console.error('Database reset error:', error);
    return { success: false, message: error.message };
  }
}

// Run if called directly
if (require.main === module) {
  resetDatabase()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Reset failed:', error);
      process.exit(1);
    });
} 