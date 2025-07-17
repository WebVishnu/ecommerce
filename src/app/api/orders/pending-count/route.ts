import { NextResponse } from "next/server";
import Order from "@/models/Order";
import dbConnect from "@/lib/db";

export async function GET() {
  try {
    await dbConnect();
    const count = await Order.countDocuments({ status: "pending" });
    
    // Add cache control headers to prevent stale data
    return NextResponse.json(
      { count },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error) {
    console.error('Error fetching pending count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending count', count: 0 },
      { status: 500 }
    );
  }
} 