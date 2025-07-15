import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { verifyToken } from '@/lib/auth';

// PUT /api/cart/items/[itemId] - Update cart item quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
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

    const { quantity } = await request.json();
    const { itemId } = params;

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { success: false, message: 'Valid quantity is required' },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ user: decoded.userId });
    if (!cart) {
      return NextResponse.json(
        { success: false, message: 'Cart not found' },
        { status: 404 }
      );
    }

    const cartItem = cart.items.id(itemId);
    if (!cartItem) {
      return NextResponse.json(
        { success: false, message: 'Cart item not found' },
        { status: 404 }
      );
    }

    // Check stock availability
    const product = await Product.findById(cartItem.product);
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

    // Update quantity
    cartItem.quantity = quantity;
    cartItem.price = product.price;

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
    console.error('Cart item update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/cart/items/[itemId] - Remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
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

    const { itemId } = params;

    const cart = await Cart.findOne({ user: decoded.userId });
    if (!cart) {
      return NextResponse.json(
        { success: false, message: 'Cart not found' },
        { status: 404 }
      );
    }

    const cartItem = cart.items.id(itemId);
    if (!cartItem) {
      return NextResponse.json(
        { success: false, message: 'Cart item not found' },
        { status: 404 }
      );
    }

    // Remove the item
    cart.items.pull(itemId);
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
    console.error('Cart item delete error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 