import { NextRequest, NextResponse } from 'next/server';
import { OTPService } from '@/lib/otpService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mobile = searchParams.get('mobile') || '7500673358';

    // Generate a test OTP
    const genResult = await OTPService.generateOTP(mobile);
    let storedOtp = genResult.otp || 'N/A';

    // Fetch OTP stats
    const stats = await OTPService.getStats();

    // Try to fetch the OTP record
    const record = await (await import('@/models/OTP')).default.findOne({ phone: mobile });

    return NextResponse.json({
      success: true,
      data: {
        mobile,
        storedOtp,
        retrievedOtp: record?.otp,
        storeStats: stats,
        match: record?.otp === storedOtp
      }
    });
  } catch (error: any) {
    console.error('Test OTP Store Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    });
  }
} 