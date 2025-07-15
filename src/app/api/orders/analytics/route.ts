import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  await dbConnect();

  // Total orders
  const totalOrders = await Order.countDocuments();

  // Total revenue (sum of totalAmount or total) for paid orders only
  const revenueAgg = await Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: { $ifNull: ["$totalAmount", "$total"] } },
      },
    },
  ]);
  const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

  // Average order value (all orders)
  const avgAgg = await Order.aggregate([
    {
      $group: {
        _id: null,
        avgOrderValue: { $avg: { $ifNull: ["$totalAmount", "$total"] } },
      },
    },
  ]);
  const avgOrderValue = avgAgg[0]?.avgOrderValue || 0;

  // Orders by status
  const statusAgg = await Order.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const statusCounts: Record<string, number> = {};
  statusAgg.forEach((s) => (statusCounts[s._id] = s.count));

  // Most purchased product (by quantity) with $lookup for name
  const mostPurchasedAgg = await Order.aggregate([
    { $unwind: "$items" },
    { $group: { _id: "$items.product", totalQty: { $sum: "$items.quantity" } } },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "productInfo"
      }
    },
    { $unwind: "$productInfo" },
    { $sort: { totalQty: -1 } },
    { $limit: 1 },
    {
      $project: {
        productId: "$_id",
        name: "$productInfo.name",
        totalQty: 1
      }
    }
  ]);
  const mostPurchasedProduct = mostPurchasedAgg[0]
    ? {
        productId: mostPurchasedAgg[0].productId,
        name: mostPurchasedAgg[0].name,
        totalQty: mostPurchasedAgg[0].totalQty,
      }
    : null;

  // Most valuable customer (by total spent)
  const topCustomerAgg = await Order.aggregate([
    {
      $group: {
        _id: "$user",
        totalSpent: { $sum: { $ifNull: ["$totalAmount", "$total"] } },
        count: { $sum: 1 },
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 1 },
  ]);
  let topCustomer = null;
  if (topCustomerAgg[0]) {
    const user = await User.findById(topCustomerAgg[0]._id).lean();
    topCustomer = {
      userId: topCustomerAgg[0]._id,
      name: user?.name || '',
      email: user?.email || '',
      totalSpent: topCustomerAgg[0].totalSpent,
      orderCount: topCustomerAgg[0].count,
    };
  }

  return NextResponse.json({
    data: {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      statusCounts,
      mostPurchasedProduct,
      topCustomer,
    },
  });
} 