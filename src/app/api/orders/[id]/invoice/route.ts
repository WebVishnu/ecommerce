import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import Order from '@/models/Order';
import User from '@/models/User';
import { connectDB } from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult) return authResult;

    const orderId = params.id;
    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      );
    }

    await connectDB();
    const user = (request as any).user;

    // Find the order and ensure it belongs to the user
    const order = await Order.findById(orderId).populate('items.product');
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.user.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access to order' },
        { status: 403 }
      );
    }

    // Generate simple HTML invoice
    const invoiceHtml = generateInvoiceHtml(order, user);

    // Return HTML as response
    return new NextResponse(invoiceHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="invoice-${orderId}.html"`
      }
    });

  } catch (error: any) {
    console.error('Invoice Generation Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateInvoiceHtml(order: any, user: any): string {
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN');
  const orderTime = new Date(order.createdAt).toLocaleTimeString('en-IN');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - Order ${order._id}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #b91c1c;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #b91c1c;
            margin-bottom: 5px;
        }
        .company-tagline {
            color: #666;
            font-size: 14px;
        }
        .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        .invoice-info, .order-info {
            flex: 1;
        }
        .invoice-info h3, .order-info h3 {
            color: #b91c1c;
            margin-bottom: 10px;
        }
        .info-row {
            margin-bottom: 5px;
            font-size: 14px;
        }
        .info-label {
            font-weight: bold;
            color: #333;
        }
        .info-value {
            color: #666;
        }
        .shipping-address {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 30px;
        }
        .shipping-address h3 {
            color: #b91c1c;
            margin-bottom: 10px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .items-table th {
            background-color: #b91c1c;
            color: white;
            padding: 12px;
            text-align: left;
        }
        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
        }
        .items-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .total-section {
            text-align: right;
            margin-top: 20px;
        }
        .total-row {
            margin-bottom: 10px;
            font-size: 16px;
        }
        .total-amount {
            font-size: 20px;
            font-weight: bold;
            color: #b91c1c;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        .delivery-info {
            background-color: #e3f2fd;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
            border-left: 4px solid #2196f3;
        }
        .delivery-info h4 {
            color: #1976d2;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div class="company-name">Shivangi Battery</div>
            <div class="company-tagline">Your Trusted Battery Partner</div>
        </div>

        <div class="invoice-details">
            <div class="invoice-info">
                <h3>Invoice Details</h3>
                <div class="info-row">
                    <span class="info-label">Invoice Number:</span>
                    <span class="info-value">INV-${order._id.slice(-8).toUpperCase()}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Order Number:</span>
                    <span class="info-value">${order._id}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Date:</span>
                    <span class="info-value">${orderDate}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Time:</span>
                    <span class="info-value">${orderTime}</span>
                </div>
            </div>
            <div class="order-info">
                <h3>Customer Details</h3>
                <div class="info-row">
                    <span class="info-label">Name:</span>
                    <span class="info-value">${user.name}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Phone:</span>
                    <span class="info-value">${user.phone}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${user.email || 'Not provided'}</span>
                </div>
            </div>
        </div>

        <div class="shipping-address">
            <h3>Shipping Address</h3>
            <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">${order.shippingAddress.name}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Phone:</span>
                <span class="info-value">${order.shippingAddress.phone}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Address:</span>
                <span class="info-value">${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}</span>
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Brand</th>
                    <th>Model</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${order.items.map((item: any) => `
                <tr>
                    <td>${item.product.name}</td>
                    <td>${item.product.brand}</td>
                    <td>${item.product.model}</td>
                    <td>${item.quantity}</td>
                    <td>₹${item.price}</td>
                    <td>₹${item.price * item.quantity}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="total-section">
            <div class="total-row">
                <span class="info-label">Subtotal:</span>
                <span class="info-value">₹${order.total}</span>
            </div>
            <div class="total-row">
                <span class="info-label">Shipping:</span>
                <span class="info-value">Free</span>
            </div>
            <div class="total-row total-amount">
                <span class="info-label">Total Amount:</span>
                <span class="info-value">₹${order.total}</span>
            </div>
        </div>

        <div class="delivery-info">
            <h4>Delivery Information</h4>
            <p><strong>Expected Delivery:</strong> 5-7 working days</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            <p><strong>Order Status:</strong> ${order.status}</p>
            <p>You will receive tracking updates via SMS and email.</p>
        </div>

        <div class="footer">
            <p>Thank you for choosing Shivangi Battery!</p>
            <p>For any queries, contact us at support@shivangibattery.com</p>
            <p>This is a computer-generated invoice. No signature required.</p>
        </div>
    </div>
</body>
</html>
  `;
} 