import { NextRequest, NextResponse } from 'next/server';
import { OTPService } from '@/lib/otpService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mobile = searchParams.get('mobile');

    if (!mobile) {
      return NextResponse.json({
        success: false,
        message: 'Mobile parameter required'
      });
    }

    // Try to fetch the OTP record
    const record = await (await import('@/models/OTP')).default.findOne({ phone: mobile });
    const stats = await OTPService.getStats();

    return NextResponse.json({
      success: true,
      data: {
        mobile,
        record,
        storeStats: stats,
        hasRecord: !!record
      }
    });
  } catch (error: any) {
    console.error('Test OTP Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    });
  }
} 