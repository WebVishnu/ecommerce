import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/auth';
import mongoose from 'mongoose';

// GET /api/admin/customers - List all customers with pagination, search, and stats
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || '';

    const filter: any = { role: { $in: ['customer', 'admin'] } };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    // Summary stats
    const [total, newThisMonth, allCustomers] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({
        role: 'customer',
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      }),
      User.find(filter)
        .select('_id name email phone isActive createdAt')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    // Get paginated customers
    const customers = await User.find(filter)
      .select('_id name email phone isActive createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Ensure customerIds are ObjectIds
    const customerIds = customers.map(c => typeof c._id === 'string' ? new mongoose.Types.ObjectId(c._id) : c._id);
   
    // Only count delivered/paid orders
    const orders = await Order.aggregate([
      {
        $match: {
          user: { $in: customerIds },
          $or: [
            { status: 'delivered' },
            { paymentStatus: 'paid' }
          ]
        }
      },
      {
        $group: {
          _id: '$user',
          orderCount: { $sum: 1 },
          totalSpend: { $sum: '$total' },
          lastOrderDate: { $max: '$createdAt' },
        }
      },
    ]);
    console.log(orders)
    const orderStatsMap = Object.fromEntries(orders.map(o => [String(o._id), o]));

    // Attach stats to customers
    const customersWithStats = customers.map(c => ({
      ...c,
      orderCount: orderStatsMap[String(c._id)]?.orderCount || 0,
      totalSpend: orderStatsMap[String(c._id)]?.totalSpend || 0,
      lastOrderDate: orderStatsMap[String(c._id)]?.lastOrderDate || null,
    }));

    // Top spender (from all customers)
    let topSpender = null;
    if (allCustomers.length > 0) {
      const allCustomerIds = allCustomers.map(c => typeof c._id === 'string' ? new mongoose.Types.ObjectId(c._id) : c._id);
      const allOrderStats = await Order.aggregate([
        {
          $match: {
            user: { $in: allCustomerIds },
            $or: [
              { status: 'delivered' },
              { paymentStatus: 'paid' }
            ]
          }
        },
        {
          $group: {
            _id: '$user',
            totalSpend: { $sum: '$total' },
          }
        },
        { $sort: { totalSpend: -1 } },
        { $limit: 1 },
      ]);
      if (allOrderStats.length > 0) {
        const user = allCustomers.find(c => String(c._id) === String(allOrderStats[0]._id));
        if (user) {
          topSpender = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            totalSpend: allOrderStats[0].totalSpend,
          };
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        customers: customersWithStats,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
        summary: {
          totalCustomers: total,
          newCustomersThisMonth: newThisMonth,
          topSpender,
        },
      },
    });
  } catch (error) {
    console.error('Admin customers GET error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
} 