import { NextRequest, NextResponse } from 'next/server';
import { sendOtp, isValidMobile } from '@/lib/messageCentral';
import { OTPService } from '@/lib/otpService';

export async function POST(request: NextRequest) {
  try {
    const { mobile } = await request.json();

    // Validate mobile number
    if (!mobile) {
      return NextResponse.json(
        { success: false, message: 'Mobile number is required' },
        { status: 400 }
      );
    }

    if (!isValidMobile(mobile)) {
      return NextResponse.json(
        { success: false, message: 'Invalid mobile number format. Please enter a valid 10-digit Indian mobile number.' },
        { status: 400 }
      );
    }

    // Generate OTP using the service
    const result = await OTPService.generateOTP(mobile);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 429 }
      );
    }

    if (process.env.NODE_ENV === 'production') {
      const smsResult = await sendOtp(mobile);
      if (!smsResult.success) {
        await OTPService.cleanupExpiredOTPs();
        return NextResponse.json(
          { success: false, message: smsResult.message },
          { status: 500 }
        );
      }
      if (smsResult.verificationId) {
        await OTPService.storeVerificationId(mobile, smsResult.verificationId);
      }
    } else {
      // Development mode - log OTP
      console.log(`🔧 [DEV] OTP for ${mobile}: ${result.otp}`);
      console.log('🔧 Development mode: Skipping SMS sending');
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 300 // 5 minutes in seconds
    });

  } catch (error: unknown) {
    console.error('Send OTP Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 