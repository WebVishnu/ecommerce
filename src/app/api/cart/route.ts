import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { verifyToken } from '@/lib/auth';

// GET /api/cart - Get user's cart
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    let cart = await Cart.findOne({ user: decoded.userId })
      .populate({
        path: 'items.product',
        model: 'Product',
        select: 'name brand model capacity voltage warranty price originalPrice images stock rating reviews'
      });

    if (!cart) {
      // Create empty cart if it doesn't exist
      cart = new Cart({
        user: decoded.userId,
        items: [],
        total: 0,
        itemCount: 0
      });
      await cart.save();
    }

    return NextResponse.json({
      success: true,
      data: cart
    });

  } catch (error) {
    console.error('Cart GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/cart/add - Add item to cart
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const { productId, quantity = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Verify product exists and is in stock
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { success: false, message: 'Insufficient stock' },
        { status: 400 }
      );
    }

    let cart = await Cart.findOne({ user: decoded.userId });
    
    if (!cart) {
      cart = new Cart({
        user: decoded.userId,
        items: [],
        total: 0,
        itemCount: 0
      });
    }

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].price = product.price;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        price: product.price
      });
    }

    // Recalculate totals
    cart.total = cart.items.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity);
    }, 0);
    
    cart.itemCount = cart.items.reduce((sum: number, item: any) => {
      return sum + item.quantity;
    }, 0);

    await cart.save();

    // Populate product details for response
    await cart.populate({
      path: 'items.product',
      model: 'Product',
      select: 'name brand model capacity voltage warranty price originalPrice images stock rating reviews'
    });

    return NextResponse.json({
      success: true,
      data: cart
    });

  } catch (error) {
    console.error('Cart POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 