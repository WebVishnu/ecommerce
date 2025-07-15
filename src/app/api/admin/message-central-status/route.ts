import { NextRequest, NextResponse } from 'next/server';
import { getAccountBalance, checkDeliveryStatus } from '@/lib/messageCentral';
import { OTPService } from '@/lib/otpService';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authResult = await requireAdmin(request);
    if (authResult) return authResult;

    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');

    // Get account balance
    const balanceResult = await getAccountBalance();
    
    // Get OTP statistics
    const otpStats = await OTPService.getStats();

    const response: {
      success: boolean;
      data: {
        account: {
          balance?: number;
          balanceStatus: string;
          balanceMessage: string;
        };
        otpStats: {
          total: number;
          expired: number;
          active: number;
        };
        timestamp: string;
        deliveryStatus?: {
          messageId: string;
          status: string;
          success: boolean;
          message: string;
        };
      };
    } = {
      success: true,
      data: {
        account: {
          balance: balanceResult.balance,
          balanceStatus: balanceResult.success ? 'success' : 'error',
          balanceMessage: balanceResult.message
        },
        otpStats: {
          total: otpStats.total,
          expired: otpStats.expired,
          active: otpStats.active
        },
        timestamp: new Date().toISOString()
      }
    };

    // If messageId is provided, check delivery status
    if (messageId) {
      const deliveryStatus = await checkDeliveryStatus(messageId);
      response.data.deliveryStatus = {
        messageId,
        status: deliveryStatus.status,
        success: deliveryStatus.success,
        message: deliveryStatus.message
      };
    }

    return NextResponse.json(response);

  } catch (error: unknown) {
    console.error('Message Central Status Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
} 