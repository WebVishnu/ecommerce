import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

// GET /api/admin/customers/[id] - Get a single customer
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    }
    const customer = await User.findOne({ _id: params.id, role: { $in: ['customer', 'admin'] } })
      .select('_id name email role phone isActive createdAt addresses')
      .lean();
    if (!customer) {
      return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { customer } });
  } catch (error) {
    console.error('Admin customer GET error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/customers/[id] - Update a single customer (e.g., toggle active status or change role)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    }
    const body = await request.json();
    const update: any = {};
    if (typeof body.isActive === 'boolean') update.isActive = body.isActive;
    if (body.role && typeof body.role === 'string') update.role = body.role;
    // Add more fields as needed
    const customer = await User.findOneAndUpdate(
      { _id: params.id }, // removed role: 'customer' restriction
      { $set: update },
      { new: true, runValidators: true }
    ).select('_id name email phone isActive createdAt addresses role');
    if (!customer) {
      return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { customer } });
  } catch (error) {
    console.error('Admin customer PUT error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
} 