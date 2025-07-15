"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import {
  ArrowLeft,
  Package,
  Truck,
  CreditCard,
  MapPin,
  Phone,
  User,
  Calendar,
  Clock,
} from "lucide-react";
import Image from "next/image";

interface OrderItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    brand: string;
    model: string;
    capacity: string;
    voltage: string;
    warranty: string;
    images: string[];
  };
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: "cod" | "online" | "bank_transfer";
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  billingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800",
    icon: Package,
  },
  processing: {
    label: "Processing",
    color: "bg-purple-100 text-purple-800",
    icon: Package,
  },
  shipped: {
    label: "Shipped",
    color: "bg-indigo-100 text-indigo-800",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-800",
    icon: Package,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
    icon: Package,
  },
};

const paymentStatusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  paid: { label: "Paid", color: "bg-green-100 text-green-800" },
  failed: { label: "Failed", color: "bg-red-100 text-red-800" },
  refunded: { label: "Refunded", color: "bg-gray-100 text-gray-800" },
};

const paymentMethodConfig = {
  cod: { label: "Cash on Delivery", icon: CreditCard },
  online: { label: "Online Payment", icon: CreditCard },
  bank_transfer: { label: "Bank Transfer", icon: CreditCard },
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuth();
  const { addToCart } = useCart();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);

  const orderId = params.id as string;

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.push("/auth/otp");
      return;
    }

    fetchOrderDetails();
  }, [isAuthenticated, isHydrated, orderId]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch order details");
      }

      setOrder(data.data.order);
    } catch (err: any) {
      console.error("Error fetching order details:", err);
      setError(err.message || "Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Download Invoice Function
  const handleDownloadInvoice = async () => {
    if (!order) return;

    setActionLoading("download");
    try {
      // Create a simple invoice HTML
      const invoiceHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice - Order #${order._id.slice(-8).toUpperCase()}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-details { margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .total { text-align: right; font-weight: bold; margin-top: 20px; }
            .address { margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Shivangi Battery</h1>
            <h2>Invoice</h2>
          </div>
          
          <div class="invoice-details">
            <p><strong>Order ID:</strong> ${order._id
              .slice(-8)
              .toUpperCase()}</p>
            <p><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>
          
          <div class="address">
            <h3>Shipping Address:</h3>
            <p>${order.shippingAddress.name}</p>
            <p>${order.shippingAddress.phone}</p>
            <p>${order.shippingAddress.street}</p>
            <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${
        order.shippingAddress.pincode
      }</p>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (item) => `
                <tr>
                  <td>${item.product.name}</td>
                  <td>₹${item.price.toLocaleString()}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.total.toLocaleString()}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          
          <div class="total">
            <p>Subtotal: ₹${order.subtotal.toLocaleString()}</p>
            <p>Tax: ₹${order.tax.toLocaleString()}</p>
            <p>Shipping: ₹${order.shipping.toLocaleString()}</p>
            <p><strong>Total: ₹${order.total.toLocaleString()}</strong></p>
          </div>
        </body>
        </html>
      `;

      // Create blob and download
      const blob = new Blob([invoiceHTML], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${order._id.slice(-8).toUpperCase()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      alert("Invoice downloaded successfully!");
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert("Failed to download invoice. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  // Reorder Function
  const handleReorder = async () => {
    if (!order) return;

    setActionLoading("reorder");
    try {
      // Add all items from the order to cart
      for (const item of order.items.filter(
        (item: any) => item.product && item.product._id
      )) {
        // Create a minimal product object with required properties
        const product = {
          _id: item.product?._id || "",
          name: item.product?.name || "Unknown Product",
          brand: item.product?.brand || "Unknown Brand",
          model: item.product?.model || "",
          capacity: item.product?.capacity || "",
          voltage: item.product?.voltage || "",
          warranty: item.product?.warranty || "",
          price: item.price,
          images: item.product?.images || [],
          description: item.product?.name || "Unknown Product",
          category: "automotive" as const,
          stock: 100,
          specifications: {},
          features: [],
          rating: 0,
          reviews: 0,
          isActive: true,
          isFeatured: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await addToCart(product, item.quantity);
      }
      router.push("/cart");
    } catch (error) {
      console.error("Error adding items to cart:", error);
      alert("Failed to add items to cart. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  // Share Order Function
  const handleShareOrder = async () => {
    if (!order) return;

    setActionLoading("share");
    try {
      const orderUrl = typeof window !== 'undefined' ? `${window.location.origin}/orders/${order._id}` : '';
      const shareText = `Check out my order from Shivangi Battery! Order #${order._id
        .slice(-8)
        .toUpperCase()}`;

      if (navigator.share) {
        // Use native sharing if available
        await navigator.share({
          title: "My Order from Shivangi Battery",
          text: shareText,
          url: orderUrl,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`${shareText}\n${orderUrl}`);
        alert("Order link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing order:", error);
      alert("Failed to share order. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  // Cancel Order Function
  const handleCancelOrder = async () => {
    if (!order) return;

    if (
      !confirm(
        "Are you sure you want to cancel this order? This action cannot be undone."
      )
    ) {
      return;
    }

    setCancelLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`/api/orders/${order._id}/cancel`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to cancel order");
      }

      alert("Order cancelled successfully!");

      // Refresh order details
      fetchOrderDetails();
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      alert(error.message || "Failed to cancel order. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  };

  // Request Return Function
  const handleRequestReturn = async () => {
    if (!order) return;

    setReturnLoading(true);
    try {
      const reason = prompt("Please specify the reason for return:");
      if (reason === null) return; // User cancelled

      if (!reason.trim()) {
        alert("Please provide a reason for the return.");
        return;
      }

      // TODO: Implement actual return request API
      console.log("Return request submitted:", {
        orderId: order._id,
        reason: reason.trim(),
        items: order.items.map((item) => item.product.name),
      });

      alert(
        "Return request submitted successfully! We will contact you within 24 hours."
      );
    } catch (error: any) {
      console.error("Error submitting return request:", error);
      alert("Failed to submit return request. Please try again.");
    } finally {
      setReturnLoading(false);
    }
  };

  const StatusIcon = statusConfig[order?.status || "pending"].icon;
  const PaymentMethodIcon =
    paymentMethodConfig[order?.paymentMethod || "cod"].icon;

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b91c1c] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b91c1c] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Error Loading Order
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/profile?tab=orders"
                className="bg-[#b91c1c] text-white px-6 py-2 rounded-md hover:bg-[#a31b1b] transition-colors"
              >
                Back to Orders
              </Link>
              <Link
                href="/"
                className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-500 text-6xl mb-4">📦</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Order Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The order you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/profile?tab=orders"
                className="bg-[#b91c1c] text-white px-6 py-2 rounded-md hover:bg-[#a31b1b] transition-colors"
              >
                Back to Orders
              </Link>
              <Link
                href="/"
                className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 mt-1">
              #{order._id.slice(-8).toUpperCase()}
            </p>
            <div className="flex items-center gap-4">
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
                  statusConfig[order.status].color
                }`}
              >
                <StatusIcon className="w-4 h-4" />
                {statusConfig[order.status].label}
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  paymentStatusConfig[order.paymentStatus].color
                }`}
              >
                {paymentStatusConfig[order.paymentStatus].label}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex sm:flex-row flex-col-reverse sm:items-center items-start justify-between gap-2">
                <h2 className="text-xl font-semibold text-gray-900">
                  Order Items
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadInvoice}
                    disabled={actionLoading === "download"}
                    className="px-3 py-1 text-sm text-[#b91c1c] hover:bg-[#b91c1c]/10 rounded-md transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === "download" ? (
                      <div className="w-4 h-4 border-2 border-[#b91c1c] border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    )}
                    {actionLoading === "download"
                      ? "Downloading..."
                      : "Download Invoice"}
                  </button>
                  <button
                    onClick={handleShareOrder}
                    disabled={actionLoading === "share"}
                    className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === "share" ? (
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                        />
                      </svg>
                    )}
                    {actionLoading === "share" ? "Sharing..." : "Share"}
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {order.items.map((item) => (
                  <div key={item._id} className="p-6">
                    <div className="flex gap-4 items-center justify-between">
                      <div className="w-[100px] h-[100px] bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                        {item.product.images && item.product.images.length > 0 ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            width={100}
                            height={100}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className="text-gray-400">No Image</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.product.brand}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-sm text-gray-600">
                            Qty: {item.quantity} × ₹
                            {item.price.toLocaleString()}
                          </div>
                          <div className="font-medium text-gray-900">
                            ₹{item.total.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {order.shippingAddress.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {order.shippingAddress.phone}
                    </span>
                  </div>
                  <div className="text-gray-600">
                    {order.shippingAddress.street}
                  </div>
                  <div className="text-gray-600">
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.pincode}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            {order.notes && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Order Notes
                  </h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-600">{order.notes}</p>
                </div>
              </div>
            )}

            {/* Order Actions & Support */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Order Actions & Support
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Quick Actions */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Quick Actions</h3>
                    <div className="space-y-2">
                      <button
                        onClick={handleReorder}
                        disabled={actionLoading === "reorder"}
                        className="w-full text-left px-4 py-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {actionLoading === "reorder"
                                ? "Adding to Cart..."
                                : "Reorder Items"}
                            </p>
                            <p className="text-sm text-gray-600">
                              Buy the same items again
                            </p>
                          </div>
                          {actionLoading === "reorder" ? (
                            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <svg
                              className="w-5 h-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                              />
                            </svg>
                          )}
                        </div>
                      </button>

                      {order.status === "pending" && (
                        <button
                          onClick={handleCancelOrder}
                          disabled={cancelLoading}
                          className="w-full text-left px-4 py-3 border border-red-200 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-red-900">
                                {cancelLoading
                                  ? "Cancelling..."
                                  : "Cancel Order"}
                              </p>
                              <p className="text-sm text-red-600">
                                Cancel this order if it hasn't been processed
                              </p>
                            </div>
                            {cancelLoading ? (
                              <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <svg
                                className="w-5 h-5 text-red-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            )}
                          </div>
                        </button>
                      )}

                      {order.status === "delivered" && (
                        <button
                          onClick={handleRequestReturn}
                          disabled={returnLoading}
                          className="w-full text-left px-4 py-3 border border-orange-200 rounded-md hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-orange-900">
                                {returnLoading
                                  ? "Submitting..."
                                  : "Request Return"}
                              </p>
                              <p className="text-sm text-orange-600">
                                Return items or request refund
                              </p>
                            </div>
                            {returnLoading ? (
                              <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <svg
                                className="w-5 h-5 text-orange-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                />
                              </svg>
                            )}
                          </div>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Order Support Info */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Order Support</h3>
                    <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-blue-500 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div>
                          <p className="font-medium text-blue-900">
                            Need Help?
                          </p>
                          <p className="text-sm text-blue-700">
                            Call us: +91 98765 43210
                          </p>
                          <p className="text-sm text-blue-700">
                            Email: support@shivangibattery.com
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    ₹{order.subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">
                    ₹{order.tax.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    ₹{order.shipping.toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">
                      Total
                    </span>
                    <span className="text-lg font-semibold text-gray-900">
                      ₹{order.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <PaymentMethodIcon className="w-5 h-5" />
                Payment Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Method</span>
                  <span className="font-medium">
                    {paymentMethodConfig[order.paymentMethod].label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      paymentStatusConfig[order.paymentStatus].color
                    }`}
                  >
                    {paymentStatusConfig[order.paymentStatus].label}
                  </span>
                </div>
              </div>
            </div>

            {/* Estimated Delivery */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Delivery Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Delivery</span>
                  <span className="font-medium text-green-600">
                    {order.status === "delivered"
                      ? "Delivered"
                      : order.status === "shipped"
                      ? "2-3 days"
                      : "5-7 days"}
                  </span>
                </div>
                {order.status === "shipped" && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-700">
                      <strong>Tracking:</strong> Your order is on its way!
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Track your package with the tracking number provided by
                      the courier.
                    </p>
                  </div>
                )}
                {order.status === "delivered" && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-700">
                      <strong>Delivered:</strong> Your order has been
                      successfully delivered!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Order Timeline
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Order Placed</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                {order.status !== "pending" && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Order Confirmed
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.updatedAt)}
                      </p>
                    </div>
                  </div>
                )}
                {order.status === "shipped" && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900">Order Shipped</p>
                      <p className="text-sm text-gray-600">On its way to you</p>
                    </div>
                  </div>
                )}
                {order.status === "delivered" && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Order Delivered
                      </p>
                      <p className="text-sm text-gray-600">
                        Successfully delivered
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
