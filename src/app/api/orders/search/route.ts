import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

const ALLOWED_SORT_FIELDS = [
  'createdAt', 'total', 'status', 'paymentStatus', 'paymentMethod', 'shippingAddress.name', 'user.name'
];

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const searchTerm = searchParams.get('searchTerm') || '';
  const status = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;

  const or: Array<Record<string, unknown>> = [];
  if (searchTerm) {
    if (mongoose.Types.ObjectId.isValid(searchTerm)) {
      or.push({ _id: searchTerm });
      or.push({ 'items.product': searchTerm });
      or.push({ user: searchTerm });
    }
    or.push(
      { 'user.name': { $regex: searchTerm, $options: 'i' } },
      { 'user.email': { $regex: searchTerm, $options: 'i' } },
      { 'shippingAddress.name': { $regex: searchTerm, $options: 'i' } },
      { 'shippingAddress.phone': { $regex: searchTerm, $options: 'i' } },
      { 'shippingAddress.street': { $regex: searchTerm, $options: 'i' } },
      { 'shippingAddress.city': { $regex: searchTerm, $options: 'i' } },
      { 'shippingAddress.state': { $regex: searchTerm, $options: 'i' } },
      { 'shippingAddress.pincode': { $regex: searchTerm, $options: 'i' } },
      { 'billingAddress.name': { $regex: searchTerm, $options: 'i' } },
      { 'billingAddress.phone': { $regex: searchTerm, $options: 'i' } },
      { 'billingAddress.street': { $regex: searchTerm, $options: 'i' } },
      { 'billingAddress.city': { $regex: searchTerm, $options: 'i' } },
      { 'billingAddress.state': { $regex: searchTerm, $options: 'i' } },
      { 'billingAddress.pincode': { $regex: searchTerm, $options: 'i' } },
      { 'items.name': { $regex: searchTerm, $options: 'i' } },
      { notes: { $regex: searchTerm, $options: 'i' } },
      { status: { $regex: searchTerm, $options: 'i' } },
      { paymentStatus: { $regex: searchTerm, $options: 'i' } },
      { paymentMethod: { $regex: searchTerm, $options: 'i' } }
    );
    filter.$or = or;
  }

  // Only allow sorting by whitelisted fields
  const sortField = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
  const sortObj: Record<string, 1 | -1> = {};
  sortObj[sortField] = sortOrder;

  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .sort(sortObj)
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();

  return NextResponse.json({ data: { orders, total } });
} 