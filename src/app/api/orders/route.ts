import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { connectDB } from '@/lib/mongodb';

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult) return authResult;

    const user = (request as any).user;
    const { items, shippingAddress, paymentMethod, orderNotes, total } = await request.json();

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Order items are required' },
        { status: 400 }
      );
    }

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      return NextResponse.json(
        { success: false, message: 'Complete shipping address is required' },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { success: false, message: 'Payment method is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify products exist and get their details
    const productIds = items.map((item: any) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== items.length) {
      return NextResponse.json(
        { success: false, message: 'Some products are not available' },
        { status: 400 }
      );
    }

    // Create order items with product details
    const orderItems = items.map((item: any) => {
      const product = products.find(p => p._id.toString() === item.productId);
      const itemTotal = product!.price * item.quantity;
      return {
        product: product!._id,
        name: product!.name,
        quantity: item.quantity,
        price: product!.price,
        total: itemTotal
      };
    });

    // Calculate totals
    const subtotal = orderItems.reduce((sum: number, item: any) => {
      return sum + item.total;
    }, 0);
    
    const tax = 0; // No tax for now
    const shipping = 0; // Free shipping for now
    const calculatedTotal = subtotal + tax + shipping;

    // Use shipping address as billing address for now
    const billingAddress = { ...shippingAddress };

    // Create the order
    const orderData = {
      user: user._id,
      items: orderItems,
      subtotal: subtotal,
      tax: tax,
      shipping: shipping,
      total: calculatedTotal,
      status: 'pending',
      shippingAddress: shippingAddress,
      billingAddress: billingAddress,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      paymentMethod,
      notes: orderNotes || '',
    };

    const order = new Order(orderData);

    await order.save();

    // Clear the user's cart after successful order
    await Cart.findOneAndUpdate(
      { user: user._id },
      { items: [], total: 0, itemCount: 0 }
    );

    // Populate product details for response
    await order.populate({
      path: 'items.product',
      model: 'Product',
      select: 'name brand model capacity voltage warranty images'
    });

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
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
          createdAt: order.createdAt
        }
      }
    });

  } catch (error: any) {
    console.error('Create Order Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// GET /api/orders - Get user's orders
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult) return authResult;

    const user = (request as any).user;
    await connectDB();

    // If admin, fetch all orders
    let orders;
    if (user.role === 'admin') {
      orders = await Order.find({})
        .populate({
          path: 'items.product',
          model: 'Product',
          select: 'name brand model capacity voltage warranty images'
        })
        .sort({ createdAt: -1 });
    } else {
      orders = await Order.find({ user: user._id })
        .populate({
          path: 'items.product',
          model: 'Product',
          select: 'name brand model capacity voltage warranty images'
        })
        .sort({ createdAt: -1 });
    }

    return NextResponse.json({
      success: true,
      data: {
        orders: orders.map(order => ({
          _id: order._id,
          items: order.items,
          total: order.total,
          status: order.status,
          shippingAddress: order.shippingAddress,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          orderNotes: order.orderNotes,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        }))
      }
    });

  } catch (error: any) {
    console.error('Get Orders Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
} 