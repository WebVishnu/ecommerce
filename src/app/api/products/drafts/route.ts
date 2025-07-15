import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

// GET /api/products/drafts - Get all draft products
export async function GET() {
  try {
    await connectDB();
    
    const drafts = await Product.find({ isDraft: true })
      .sort({ draftSavedAt: -1 })
      .select('name category brand model price stock images isActive isFeatured draftSavedAt createdAt');

    return NextResponse.json({
      success: true,
      data: { drafts }
    });
  } catch (error) {
    console.error('Error fetching drafts:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch drafts' },
      { status: 500 }
    );
  }
}

// POST /api/products/drafts - Save a draft product
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields for draft
    if (!body.name || !body.category || !body.brand || !body.model) {
      return NextResponse.json(
        { success: false, message: 'Name, category, brand, and model are required for drafts' },
        { status: 400 }
      );
    }

    const draftData = {
      ...body,
      isDraft: true,
      draftSavedAt: new Date(),
      // Set default values for required fields that might be missing
      price: body.price || 0,
      stock: body.stock || 0,
      description: body.description || '',
      images: body.images || [],
      specifications: body.specifications || {},
      isActive: body.isActive !== undefined ? body.isActive : true,
      isFeatured: body.isFeatured || false,
      rating: 0,
      reviews: 0
    };

    const draft = new Product(draftData);
    await draft.save();

    return NextResponse.json({
      success: true,
      data: { draft },
      message: 'Draft saved successfully'
    });
  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save draft' },
      { status: 500 }
    );
  }
}

// PUT /api/products/drafts/:id - Update a draft product
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Draft ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    const updateData = {
      ...body,
      draftSavedAt: new Date()
    };

    const draft = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!draft) {
      return NextResponse.json(
        { success: false, message: 'Draft not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { draft },
      message: 'Draft updated successfully'
    });
  } catch (error) {
    console.error('Error updating draft:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update draft' },
      { status: 500 }
    );
  }
} 