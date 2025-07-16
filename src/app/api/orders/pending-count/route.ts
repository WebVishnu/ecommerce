import { NextResponse } from "next/server";
import Order from "@/models/Order";
import dbConnect from "@/lib/db";

export async function GET() {
  await dbConnect();
  const count = await Order.countDocuments({ status: "pending" });
  return NextResponse.json({ count });
} 