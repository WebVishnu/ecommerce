import { NextRequest, NextResponse } from 'next/server';
import { OTPService } from '@/lib/otpService';
import User from '@/models/User';
import { connectDB } from '@/lib/mongodb';
import { generateToken } from '@/lib/auth';
import { isValidMobile, isValidOtp, validateOtp } from '@/lib/messageCentral';
import { needsProfileCompletion } from '@/lib/utils';

// Removed unused constant

export async function POST(request: NextRequest) {
  try {
    const { mobile, otp } = await request.json();

    console.log('Verify OTP request received:', {
      mobile,
      otp,
      mobileType: typeof mobile,
      mobileLength: mobile.length,
      otpType: typeof otp,
      otpLength: otp.length
    });

    // Validate inputs
    if (!mobile || !otp) {
      return NextResponse.json(
        { success: false, message: 'Mobile number and OTP are required' },
        { status: 400 }
      );
    }

    if (!isValidMobile(mobile)) {
      return NextResponse.json(
        { success: false, message: 'Invalid mobile number format' },
        { status: 400 }
      );
    }

    if (!isValidOtp(otp)) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP format' },
        { status: 400 }
      );
    }

    // In development environment, use local OTP verification
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔧 Development mode: Using local OTP verification');
      
      // Verify OTP using the local service
      const verifyResult = await OTPService.verifyOTP(mobile, otp);

      if (!verifyResult.success) {
        return NextResponse.json(
          { success: false, message: verifyResult.message },
          { status: 400 }
        );
      }

      console.log('✅ Local OTP verification successful for:', mobile);
    } else {
      // Production environment: Use Message Central API
      console.log('🚀 Production mode: Using Message Central API verification');
      
      // Get verificationId from stored OTP record
      const verificationIdResult = await OTPService.getVerificationId(mobile);
      if (!verificationIdResult.success || !verificationIdResult.verificationId) {
        return NextResponse.json(
          { success: false, message: 'OTP session not found. Please request a new OTP' },
          { status: 400 }
        );
      }

      // Verify OTP using Message Central API
      const verifyResult = await validateOtp(verificationIdResult.verificationId, otp);

      if (!verifyResult.success) {
        return NextResponse.json(
          { success: false, message: verifyResult.message },
          { status: 400 }
        );
      }

      console.log('✅ Message Central OTP verification successful for:', mobile);
    }

    console.log('OTP verified successfully for:', mobile);

    // Connect to database
    await connectDB();

    // Find or create user
    let user = await User.findOne({ phone: mobile });
    const isNewUser = !user;

    if (!user) {
      // Create new user with minimal required fields
      const userData: {
        name: string;
        phone: string;
        phoneVerified: boolean;
        profileCompleted: boolean;
        role: 'customer';
        isActive: boolean;
        addresses: Array<{
          name: string;
          phone: string;
          street: string;
          city: string;
          state: string;
          pincode: string;
          isDefault: boolean;
          addressType: 'home';
        }>;
      } = {
        name: '',
        phone: mobile,
        phoneVerified: true,
        profileCompleted: false,
        role: 'customer',
        isActive: true,
        addresses: []
      };

      // Don't include email field if it's empty to avoid index conflicts
      // Email will be added later during profile completion

      console.log('Creating new user with data:', userData);

      try {
        user = await User.create(userData);
        console.log('User created successfully:', user._id);
      } catch (createError: unknown) {
        console.error('User creation error:', createError);
        return NextResponse.json(
          { success: false, message: 'Failed to create user account' },
          { status: 500 }
        );
      }
    } else {
      // Update existing user's phone verification status
      console.log('Updating existing user:', user._id);
      user.phoneVerified = true;
      await user.save();
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      phone: user.phone,
      role: user.role
    });

    return NextResponse.json({
      success: true,
      message: isNewUser ? 'Account created successfully' : 'Login successful',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          addresses: user.addresses,
          role: user.role,
          phoneVerified: user.phoneVerified,
          profileCompleted: user.profileCompleted
        },
        isNewUser,
        requiresProfileCompletion: needsProfileCompletion(user)
      }
    });

  } catch (error: unknown) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 