import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import Order from '@/models/Order';
import { connectDB } from '@/lib/mongodb';

// PATCH /api/orders/[id]/cancel - Cancel an order
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult) return authResult;

    const user = (request as any).user;
    const orderId = params.id;

    await connectDB();

    // Find the order and ensure it belongs to the authenticated user
    const order = await Order.findOne({ 
      _id: orderId,
      user: user._id 
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order can be cancelled
    if (order.status !== 'pending') {
      return NextResponse.json(
        { success: false, message: 'Order cannot be cancelled. Only pending orders can be cancelled.' },
        { status: 400 }
      );
    }

    // Update order status to cancelled
    order.status = 'cancelled';
    order.updatedAt = new Date();
    await order.save();

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
      data: {
        order: {
          _id: order._id,
          status: order.status,
          updatedAt: order.updatedAt
        }
      }
    });

  } catch (error: any) {
    console.error('Cancel Order Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to cancel order' },
      { status: 500 }
    );
  }
} 