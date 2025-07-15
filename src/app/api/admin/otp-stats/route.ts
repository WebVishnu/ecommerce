import { NextRequest, NextResponse } from 'next/server';
import { OTPService } from '@/lib/otpService';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authResult = await requireAdmin(request);
    if (authResult) return authResult;

    // Get OTP statistics
    const stats = await OTPService.getStats();

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error: any) {
    console.error('OTP Stats Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 