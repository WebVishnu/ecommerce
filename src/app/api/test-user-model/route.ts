import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Test creating a minimal user
    const testUserData = {
      name: '',
      phone: '7500673358',
      phoneVerified: true,
      profileCompleted: false,
      role: 'customer' as const,
      isActive: true,
      address: {
        street: '',
        city: '',
        state: '',
        pincode: ''
      }
    };
    
    try {
      const testUser = await User.create(testUserData);
      
      // Clean up - delete the test user
      await User.findByIdAndDelete(testUser._id);
      
      return NextResponse.json({
        success: true,
        message: 'User model test passed',
        data: {
          userId: testUser._id,
          phone: testUser.phone,
          role: testUser.role
        }
      });
    } catch (createError: any) {
      console.error('User model test failed:', createError);
      return NextResponse.json({
        success: false,
        message: 'User model test failed',
        error: createError.message,
        validationErrors: createError.errors
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('Test User Model Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    });
  }
} 