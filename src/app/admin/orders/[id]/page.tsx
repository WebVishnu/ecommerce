"use client";

import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  Truck,
  CreditCard,
  User2,
  MapPin,
  Info,
  AlertTriangle,
  Phone,
} from "lucide-react";
import { useState, useEffect } from "react";

// Toast notification component
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed top-6 right-6 z-50 px-6 py-3 rounded shadow-lg text-white flex items-center gap-2 ${
        type === "success" ? "bg-green-600" : "bg-red-600"
      }`}
      role="alert"
      aria-live="assertive"
    >
      {type === "success" ? (
        <CheckCircle className="w-5 h-5" />
      ) : (
        <XCircle className="w-5 h-5" />
      )}
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-white/80 hover:text-white focus:outline-none"
      >
        ×
      </button>
    </div>
  );
}

// Confirmation modal
function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
        <AlertTriangle className="mx-auto mb-3 text-yellow-500 w-8 h-8" />
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        <p className="mb-6 text-gray-700">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="animate-spin inline w-4 h-4" />
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Status timeline
const statusSteps = [
  { value: "pending", label: "Pending", icon: Info },
  { value: "processing", label: "Processing", icon: Loader2 },
  { value: "shipped", label: "Shipped", icon: Truck },
  { value: "delivered", label: "Delivered", icon: CheckCircle },
  { value: "cancelled", label: "Cancelled", icon: XCircle },
];

export default function AdminOrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { isAdmin, loading: sessionLoading } = useAuth();
  const orderId = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [status, setStatus] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [confirm, setConfirm] = useState<{ type: "cancel" | "refund" | null }>({
    type: null,
  });
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);

  useEffect(() => {
    if (isAdmin) fetchOrder();
    // eslint-disable-next-line
  }, [isAdmin, orderId]);

  useEffect(() => {
    if (order) {
      // Determine the current payment status step based on the order's paymentStatus
      let paymentCurrentStep = 0;
      if (order.paymentStatus === "pending") paymentCurrentStep = 0;
      else if (order.paymentStatus === "paid") paymentCurrentStep = 1;
      else if (order.paymentStatus === "refunded") paymentCurrentStep = 2;
      else if (order.paymentStatus === "failed") paymentCurrentStep = 3;
      setStatus(order.paymentStatus); // Keep order.status for status stepper
    }
  }, [order]);

  // Show payment confirmation modal when delivered and COD and not paid
  useEffect(() => {
    if (
      order &&
      order.status === "delivered" &&
      order.paymentMethod === "cod" &&
      order.paymentStatus !== "paid" &&
      order.paymentStatus !== "refunded"
    ) {
      setShowPaymentConfirm(true);
    } else {
      setShowPaymentConfirm(false);
    }
  }, [order]);

  async function updatePaymentStatus(newStatus: string) {
    if (!order) return;
    setActionLoading("paymentStatus");
    setError("");
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/orders/${order._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentStatus: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update payment status");
      await fetchOrder();
      showToast("Payment status updated!", "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Unknown error", "error");
    } finally {
      setActionLoading("");
      setShowPaymentConfirm(false);
    }
  }

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function fetchOrder() {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch order");
      const data = await res.json();
      setOrder(data.data.order);
      setStatus(data.data.order.status);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function handleRefund() {
    if (!order) return;
    setActionLoading("refund");
    setError("");
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/orders/${order._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentStatus: "refunded" }),
      });
      if (!res.ok) throw new Error("Failed to mark as refunded");
      await fetchOrder();
      showToast("Order marked as refunded!", "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Unknown error", "error");
    } finally {
      setActionLoading("");
      setConfirm({ type: null });
    }
  }

  async function handleCancel() {
    if (!order) return;
    setActionLoading("cancel");
    setError("");
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/orders/${order._id}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to cancel order");
      await fetchOrder();
      showToast("Order cancelled!", "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Unknown error", "error");
    } finally {
      setActionLoading("");
      setConfirm({ type: null });
    }
  }

  if (!isAdmin && !sessionLoading) {
    router.push("/");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
        <span className="ml-4 text-lg font-medium text-gray-700">
          Loading order details...
        </span>
      </div>
    );
  }
  if (error) {
    return <div className="text-red-500 p-6">{error}</div>;
  }
  if (!order) {
    return <div className="p-6">Order not found.</div>;
  }

  // Status stepper logic
  const statusOrder = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];
  const statusLabels: Record<string, string> = {
    pending: "Pending",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  const statusIcons: Record<string, any> = {
    pending: Info,
    processing: Loader2,
    shipped: Truck,
    delivered: CheckCircle,
    cancelled: XCircle,
  };
  const currentStep = statusOrder.indexOf(order.status);

  // Payment status stepper logic (move here to avoid null error)
  const paymentStatusOrder = ["pending", "paid", "refunded", "failed"];
  const paymentStatusLabels: Record<string, string> = {
    pending: "Pending",
    paid: "Paid",
    refunded: "Refunded",
    failed: "Failed",
  };
  const paymentStatusIcons: Record<string, any> = {
    pending: Info,
    paid: CheckCircle,
    refunded: XCircle,
    failed: XCircle,
  };
  const paymentCurrentStep = paymentStatusOrder.indexOf(
    order.paymentStatus || "pending"
  );

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <ConfirmModal
        open={!!confirm.type}
        title={confirm.type === "cancel" ? "Cancel Order" : "Mark as Refunded"}
        message={
          confirm.type === "cancel"
            ? "Are you sure you want to cancel this order? This action cannot be undone."
            : "Are you sure you want to mark this order as refunded?"
        }
        onConfirm={confirm.type === "cancel" ? handleCancel : handleRefund}
        onCancel={() => setConfirm({ type: null })}
        loading={actionLoading === confirm.type}
      />
      {/* Sticky header */}
      <div
        className={`sticky ${
          isAdmin ? "top-8" : "top-0"
        } z-30 bg-white shadow flex flex-col md:flex-row items-center justify-between px-8 py-4 border-b border-gray-200`}
      >
        <div className="flex items-center gap-3">
          <FileText className="w-7 h-7 text-blue-700" />
          <span
            className={`ml-4 px-3 py-1 rounded-full text-sm font-semibold ${
              order.status === "cancelled"
                ? "bg-red-100 text-red-700"
                : order.status === "delivered"
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {statusLabels[order.status]}
          </span>
        </div>
        <div className="text-gray-500 text-sm mt-2 md:mt-0">
          Placed on {new Date(order.createdAt).toLocaleString()}
        </div>
      </div>
      {/* Status Stepper */}
      <div className="w-full flex overflow-x-auto justify-center sm:py-8 bg-white border-b border-gray-200">
        <div className="flex items-center gap-1 md:gap-4 w-full max-w-4xl px-1">
          {statusOrder.map((step, idx) => {
            const Icon = statusIcons[step];
            const isActive = idx === currentStep;
            const isCompleted =
              idx < currentStep && order.status !== "cancelled";
            const isFuture =
              idx > currentStep &&
              order.status !== "cancelled" &&
              order.status !== "delivered";
            const isDisabled =
              idx < currentStep ||
              order.status === "cancelled" ||
              (order.status === "delivered" && step !== "delivered");
            return (
              <div key={step} className="flex items-center w-full">
                <button
                  className={`flex sm:flex-col gap-1 items-center justify-center sm:w-28 sm:py-2 p-1 w-full rounded-lg border-2 transition-all
                    ${
                      isActive
                        ? "border-blue-600 bg-blue-50"
                        : isCompleted
                        ? "border-green-500 bg-green-50"
                        : isFuture
                        ? "border-gray-300 bg-gray-100 hover:bg-blue-100 hover:border-blue-400"
                        : "border-gray-200 bg-gray-50"
                    }
                    ${
                      isDisabled
                        ? "opacity-60 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  disabled={isDisabled || actionLoading === "status"}
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`Set status to ${statusLabels[step]}`}
                  onClick={() => {
                    if (isFuture && status !== step) {
                      setStatus(step);
                      handleStatusUpdateWith(step);
                    }
                  }}
                >
                  <Icon
                    className={`w-6 h-6 mb-1 ${
                      isActive
                        ? "text-blue-600"
                        : isCompleted
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`text-xs font-semibold ${
                      isActive
                        ? "text-blue-700"
                        : isCompleted
                        ? "text-green-700"
                        : "text-gray-500"
                    }`}
                  >
                    {statusLabels[step]}
                  </span>
                </button>
                {idx < statusOrder.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-1 md:mx-2 rounded-full ${
                      idx < currentStep ? "bg-green-500" : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8 sm:px-8 py-6 w-full">
        {/* Left: Order Details */}
        <div className="flex-1 min-w-[320px]">
          <div className="bg-white rounded-xl shadow p-5 sm:mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* User Info */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <User2 className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold">User:</span>
                  <span className="truncate">
                    {order.shippingAddress?.name ||
                      order.shippingAddress?.email ||
                      "-"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold">Phone:</span>
                  <span className="truncate" >
                    {order.shippingAddress?.phone || "-"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <CreditCard className="w-5 h-5 text-green-500" />
                  <span className="font-semibold">Payment:</span>
                  <span className="uppercase">
                    {order.paymentMethod || "-"}
                  </span>
                  <span
                    className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${
                      order.paymentStatus === "paid"
                        ? "bg-green-100 text-green-700"
                        : order.paymentStatus === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : order.paymentStatus === "refunded"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
            {/* Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold">Shipping Address</span>
                </div>
                <div className="text-sm text-gray-700">
                  {order.shippingAddress?.name && (
                    <div>{order.shippingAddress.name}</div>
                  )}
                  {order.shippingAddress?.phone && (
                    <div>{order.shippingAddress.phone}</div>
                  )}
                  <div>
                    {order.shippingAddress?.street},{" "}
                    {order.shippingAddress?.city},{" "}
                    {order.shippingAddress?.state} -{" "}
                    {order.shippingAddress?.pincode}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-green-500" />
                  <span className="font-semibold">Billing Address</span>
                </div>
                <div className="text-sm text-gray-700">
                  {order.billingAddress?.name && (
                    <div>{order.billingAddress.name}</div>
                  )}
                  {order.billingAddress?.phone && (
                    <div>{order.billingAddress.phone}</div>
                  )}
                  <div>
                    {order.billingAddress?.street}, {order.billingAddress?.city}
                    , {order.billingAddress?.state} -{" "}
                    {order.billingAddress?.pincode}
                  </div>
                </div>
              </div>
            </div>
            {/* Notes */}
            {order.notes && (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <Info className="w-5 h-5 text-blue-400" />
                <span className="font-semibold">Notes:</span>
                <span className="ml-1 text-gray-700">{order.notes}</span>
              </div>
            )}
            {/* Call Customer Button */}
            <div className="mt-8 flex fixed bottom-2 left-2 z-20">
              <a
                href={order.shippingAddress?.phone ? `tel:${order.shippingAddress.phone}` : undefined}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${order.shippingAddress?.phone ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                aria-label="Call Customer"
                tabIndex={order.shippingAddress?.phone ? 0 : -1}
                {...(!order.shippingAddress?.phone && { onClick: e => e.preventDefault() })}
              >
                <Phone className="w-5 h-5" />
                Call Customer
              </a>
            </div>
            {/* Order Summary removed from here */}
          </div>
          {/* Actions */}
          <div className="flex flex-wrap gap-3 mb-8 px-2 my-4">
            {/* Payment Status Stepper */}
            <div className="w-full flex flex-col gap-2">
              <span className="font-semibold">Payment Status:</span>
              <div className="flex items-center gap-1 md:gap-4 w-full max-w-xl">
                {paymentStatusOrder.map((step, idx) => {
                  const Icon = paymentStatusIcons[step];
                  const isActive = idx === paymentCurrentStep;
                  const isCompleted = idx < paymentCurrentStep;
                  const isFuture = idx > paymentCurrentStep;
                  const isDisabled =
                    (step === "paid" && order.paymentStatus === "refunded") ||
                    (step === "refunded" && order.paymentStatus !== "paid") ||
                    (step === "failed" && order.paymentStatus === "paid");
                  return (
                    <div key={step} className="flex items-center w-full">
                      <button
                        className={`flex sm:flex-col items-center justify-center sm:w-28 sm:py-2 p-1 w-full rounded-lg border-2 transition-all
                          ${
                            isActive
                              ? "border-blue-600 bg-blue-50"
                              : isCompleted
                              ? "border-green-500 bg-green-50"
                              : isFuture
                              ? "border-gray-300 bg-gray-100 hover:bg-blue-100 hover:border-blue-400"
                              : "border-gray-200 bg-gray-50"
                          }
                          ${
                            isDisabled || actionLoading === "paymentStatus"
                              ? "opacity-60 cursor-not-allowed"
                              : "cursor-pointer"
                          }`}
                        disabled={
                          isDisabled ||
                          actionLoading === "paymentStatus" ||
                          step === order.paymentStatus
                        }
                        aria-current={isActive ? "step" : undefined}
                        aria-label={`Set payment status to ${paymentStatusLabels[step]}`}
                        onClick={() => updatePaymentStatus(step)}
                      >
                        <Icon
                          className={`w-6 h-6 mb-1 hidden sm:inline ${
                            isActive
                              ? "text-blue-600"
                              : isCompleted
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        />
                        <span
                          className={`text-xs font-semibold ${
                            isActive
                              ? "text-blue-700"
                              : isCompleted
                              ? "text-green-700"
                              : "text-gray-500"
                          }`}
                        >
                          {paymentStatusLabels[step]}
                        </span>
                      </button>
                      {idx < paymentStatusOrder.length - 1 && (
                        <div
                          className={`flex-1 h-1 mx-1 md:mx-2 rounded-full hidden sm:inline ${
                            idx < paymentCurrentStep
                              ? "bg-green-500"
                              : "bg-gray-200"
                          }`}
                        ></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Cancel Button: Only show if order.status === 'pending' */}
            {order.status === "pending" && (
              <button
                className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
                onClick={() => setConfirm({ type: "cancel" })}
                disabled={actionLoading === "cancel"}
                aria-label="Cancel order"
              >
                {actionLoading === "cancel" ? (
                  <Loader2 className="animate-spin inline w-4 h-4" />
                ) : (
                  "Cancel Order"
                )}
              </button>
            )}
          </div>
          {/* Payment Confirmation Modal for COD on Delivery */}
          {showPaymentConfirm && (
            <ConfirmModal
              open={showPaymentConfirm}
              title="Payment Received?"
              message="The order was delivered with Cash on Delivery. Has the payment been received from the customer?"
              onConfirm={() => updatePaymentStatus("paid")}
              onCancel={() => setShowPaymentConfirm(false)}
              loading={actionLoading === "paymentStatus"}
            />
          )}
        </div>
        {/* Right: Items */}
        <div className="flex-1 min-w-[320px]">
          <div className="bg-white rounded-xl shadow sm:p-5 px-2">
            <span className="font-semibold text-lg">Products List</span>
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Price
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Qty
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items.map((item: any, idx: number) => {
                    const product = item.product;
                    const productId = product?._id || product?.id;
                    return (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td
                          className="px-3 py-2 font-medium text-blue-700 cursor-pointer underline hover:text-blue-900"
                          onClick={() =>
                            productId && router.push(`/products/${productId}`)
                          }
                          tabIndex={0}
                          role="button"
                          aria-label={`View details for ${
                            product?.name || "Product"
                          }`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              productId &&
                                router.push(`/products/${productId}`);
                            }
                          }}
                        >
                          {product?.name || "Product"}
                        </td>
                        <td className="px-3 py-2 text-gray-700 text-sm">
                          ₹{item.price}
                        </td>
                        <td className="px-3 py-2 text-gray-700 text-sm">
                          {item.quantity}
                        </td>
                        <td className="px-3 py-2 text-gray-700 text-sm">
                          ₹{item.price * item.quantity}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Order Summary moved here */}
            <div className="bg-gray-100 rounded-lg p-4 border border-gray-200 flex flex-col gap-2 max-w-xs ml-auto mt-8">
              <div className="flex items-center justify-between text-gray-700">
                <span className="font-semibold">Subtotal:</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="flex items-center justify-between text-gray-700">
                <span className="font-semibold">Tax:</span>
                <span>₹{order.tax}</span>
              </div>
              <div className="flex items-center justify-between text-gray-700">
                <span className="font-semibold">Shipping:</span>
                <span>₹{order.shipping}</span>
              </div>
              <div className="flex items-center justify-between text-lg font-bold text-black border-t border-gray-300 pt-2 mt-2">
                <span>Total:</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper for status update via stepper
  function handleStatusUpdateWith(newStatus: string) {
    setStatus(newStatus);
    setActionLoading("status");
    setError("");
    fetch(`/api/orders/${order._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update status");
        return res.json();
      })
      .then(() => {
        fetchOrder();
        showToast("Order status updated!", "success");
      })
      .catch((err) => {
        showToast(
          err instanceof Error ? err.message : "Unknown error",
          "error"
        );
      })
      .finally(() => {
        setActionLoading("");
      });
  }
}
