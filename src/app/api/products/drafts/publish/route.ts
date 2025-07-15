import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

// POST /api/products/drafts/publish - Publish a draft product
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { draftId } = body;
    
    if (!draftId) {
      return NextResponse.json(
        { success: false, message: 'Draft ID is required' },
        { status: 400 }
      );
    }

    // Find the draft
    const draft = await Product.findById(draftId);
    
    if (!draft) {
      return NextResponse.json(
        { success: false, message: 'Draft not found' },
        { status: 404 }
      );
    }

    if (!draft.isDraft) {
      return NextResponse.json(
        { success: false, message: 'This product is not a draft' },
        { status: 400 }
      );
    }

    // Validate required fields for publishing
    if (!draft.name || !draft.description || !draft.price || !draft.category || 
        !draft.brand || !draft.model || draft.stock === undefined) {
      return NextResponse.json(
        { success: false, message: 'All required fields must be filled before publishing' },
        { status: 400 }
      );
    }

    // Convert draft to published product
    const publishedProduct = await Product.findByIdAndUpdate(
      draftId,
      {
        isDraft: false,
        draftSavedAt: undefined,
        $unset: { draftSavedAt: 1 }
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      data: { product: publishedProduct },
      message: 'Product published successfully'
    });
  } catch (error) {
    console.error('Error publishing draft:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to publish draft' },
      { status: 500 }
    );
  }
} 