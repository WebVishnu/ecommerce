import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAdmin } from '@/lib/auth';
import Order from '@/models/Order';
import { connectDB } from '@/lib/mongodb';

// GET /api/orders/[id] - Get specific order details
export async function GET(
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
    }).populate({
      path: 'items.product',
      model: 'Product',
      select: 'name brand model capacity voltage warranty images'
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        order: {
          _id: order._id,
          items: order.items,
          subtotal: order.subtotal,
          tax: order.tax,
          shipping: order.shipping,
          total: order.total,
          status: order.status,
          shippingAddress: order.shippingAddress,
          billingAddress: order.billingAddress,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          notes: order.notes,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        }
      }
    });

  } catch (error: any) {
    console.error('Get Order Details Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
} 

// PATCH /api/orders/[id] - Update order status/paymentStatus (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminResult = await requireAdmin(request);
    if (adminResult) return adminResult;

    const orderId = params.id;
    await connectDB();
    const body = await request.json();
    const update: any = {};
    if (body.status) update.status = body.status;
    if (body.paymentStatus) update.paymentStatus = body.paymentStatus;
    // Optionally, add more fields if needed

    const order = await Order.findByIdAndUpdate(
      orderId,
      { $set: update },
      { new: true }
    ).populate({
      path: 'items.product',
      model: 'Product',
      select: 'name brand model capacity voltage warranty images'
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        order: {
          _id: order._id,
          items: order.items,
          subtotal: order.subtotal,
          tax: order.tax,
          shipping: order.shipping,
          total: order.total,
          status: order.status,
          shippingAddress: order.shippingAddress,
          billingAddress: order.billingAddress,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          notes: order.notes,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        }
      }
    });
  } catch (error: any) {
    console.error('Update Order Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update order' },
      { status: 500 }
    );
  }
} 