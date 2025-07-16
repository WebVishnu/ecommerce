"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
// import Link from "next/link"; // Remove unused
// import { FileText } from "lucide-react"; // Remove unused

// Minimal Order type for admin table
type Order = {
  _id: string;
  user?: { name?: string; email?: string };
  shippingAddress: {
    name?: string;
    phone?: string;
    address?: string;
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  items: {
    name: string;
    price: number;
    quantity: number;
    product?: { _id: string; name: string }; // Added product field
  }[];
  createdAt: string;
  status: string;
  totalAmount: number;
  total?: number;
  paymentStatus?: string;
  paymentMethod?: string;
  notes?: string;
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const { isAdmin, loading: sessionLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(100); // Remove setPageSize, keep pageSize fixed at 100
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  type Analytics = {
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
    statusCounts: Record<string, number>;
    mostPurchasedProduct?: {
      productId: string;
      name: string;
      totalQty: number;
    } | null;
    topCustomer?: {
      userId: string;
      name?: string;
      email?: string;
      totalSpent: number;
      orderCount: number;
    } | null;
  };
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, searchTerm, statusFilter, page, sortBy, sortOrder]);

  useEffect(() => {
    // Fetch analytics for all orders (not paginated)
    async function fetchAnalytics() {
      const res = await fetch("/api/orders/analytics");
      const data = await res.json();
      setAnalytics(data.data);
    }
    fetchAnalytics();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const params = new URLSearchParams({
        searchTerm,
        status: statusFilter,
        page: String(page),
        pageSize: String(pageSize),
        sortBy,
        sortOrder,
      });
      const res = await fetch(`/api/orders/search?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data.data.orders || []);
      setTotal(data.data.total || 0);
    } catch {
      setOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(total / pageSize);

  // Helper for badge
  function StatusBadge({
    status,
    type,
  }: {
    status: string;
    type: "order" | "payment";
  }) {
    let color = "bg-gray-200 text-gray-800";
    if (type === "order") {
      if (status === "pending") color = "bg-yellow-100 text-yellow-800";
      else if (status === "processing") color = "bg-blue-100 text-blue-800";
      else if (status === "shipped") color = "bg-indigo-100 text-indigo-800";
      else if (status === "delivered") color = "bg-green-100 text-green-800";
      else if (status === "cancelled") color = "bg-red-100 text-red-800";
    } else {
      if (status === "paid") color = "bg-green-100 text-green-800";
      else if (status === "pending") color = "bg-yellow-100 text-yellow-800";
      else if (status === "failed") color = "bg-red-100 text-red-800";
      else if (status === "refunded") color = "bg-blue-100 text-blue-800";
    }
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${color}`}>
        {status}
      </span>
    );
  }

  // Helper for sortable header
  function SortableHeader({ label, field }: { label: string; field: string }) {
    const isActive = sortBy === field;
    return (
      <th
        className="p-2 text-black border whitespace-nowrap cursor-pointer select-none hover:bg-blue-100 transition"
        onClick={() => {
          if (isActive) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
          else {
            setSortBy(field);
            setSortOrder("asc");
          }
          setPage(1);
        }}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            if (isActive) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
            else {
              setSortBy(field);
              setSortOrder("asc");
            }
            setPage(1);
          }
        }}
        aria-sort={
          isActive
            ? sortOrder === "asc"
              ? "ascending"
              : "descending"
            : undefined
        }
      >
        {label}
        {isActive && (
          <span className="ml-1 inline-block align-middle">
            {sortOrder === "asc" ? "▲" : "▼"}
          </span>
        )}
      </th>
    );
  }

  if (!isAdmin && !sessionLoading) {
    router.push("/");
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto p-2 md:p-6 bg-white">
      {/* Compact Analytics Section */}
      {analytics && (
        <div className="md:flex grid grid-cols-3 text-center flex-wrap gap-4 mb-4 text-xs text-gray-700">
          <div className="bg-gray-50 rounded px-3 py-2 flex flex-col items-center min-w-[90px]">
            <span className="font-bold text-base text-blue-700">
              {analytics.totalOrders}
            </span>
            <span>Total Orders</span>
          </div>
          <div className="bg-gray-50 rounded px-3 py-2 flex flex-col items-center min-w-[90px]">
            <span className="font-bold text-base text-green-700">
              ₹{analytics.totalRevenue.toLocaleString()}
            </span>
            <span>Total Revenue</span>
          </div>
          <div className="bg-gray-50 rounded px-3 py-2 flex flex-col items-center min-w-[90px]">
            <span className="font-bold text-base">
              ₹{Math.round(analytics.avgOrderValue).toLocaleString()}
            </span>
            <span>Avg Order</span>
          </div>
          {analytics.mostPurchasedProduct && (
            <div className="bg-gray-50 rounded px-3 py-2 flex flex-col items-center min-w-[120px]">
              <span
                className="font-bold text-xs truncate max-w-[100px]"
                title={analytics.mostPurchasedProduct.name}
              >
                <span className="text-blue-700 font-bold">
                  {" "}
                  ({analytics.mostPurchasedProduct.totalQty})
                </span>{" "}
                {analytics.mostPurchasedProduct.name}
              </span>
              <span className="text-gray-500">Top Product</span>
            </div>
          )}
          {analytics.topCustomer && (
            <div className="bg-gray-50 rounded px-3 py-2 flex flex-col items-center min-w-[120px]">
              <span
                className="font-bold text-xs truncate max-w-[100px]"
                title={analytics.topCustomer.email}
              >
                {analytics.topCustomer.name || "User"}
              </span>
              <span className="text-green-700 font-bold">
                ₹{analytics.topCustomer.totalSpent.toLocaleString()}
              </span>
              <span className="text-gray-500">Top Customer</span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-2 mb-4 items-center sm:bg-white rounded-lg sm:px-4 py-3">
        <div className="relative w-full md:w-64">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <circle
                cx="11"
                cy="11"
                r="7"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M21 21l-4.35-4.35"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 pl-8 pr-2 py-2 rounded-lg text-sm md:text-base w-full focus:ring-2 focus:ring-blue-200 focus:outline-none bg-gray-50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="border text-black border-gray-300 px-2 py-2 rounded-lg text-sm md:text-base w-full md:w-48 focus:ring-2 focus:ring-blue-200 focus:outline-none bg-gray-50"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div className="overflow-x-auto w-full min-h-[400px]">
        <table className="min-w-full border rounded-lg overflow-hidden shadow-sm text-xs md:text-sm bg-white">
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr>
              <SortableHeader label="Date" field="createdAt" />
              <th className="p-2 text-black border whitespace-nowrap">
                Products
              </th>
              <th className="p-2 text-black border whitespace-nowrap">#</th>
              <SortableHeader label="Customer" field="shippingAddress.name" />
              <th className="p-2 text-black border whitespace-nowrap">
                Address
              </th>
              <th className="p-2 text-black border whitespace-nowrap">Phone</th>
              <SortableHeader label="Total" field="total" />
              <SortableHeader label="Status" field="status" />
              <SortableHeader label="Payment" field="paymentStatus" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={13} className="text-center p-4 text-black">
                  Loading...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={13} className="text-center p-4 text-black">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const rowClick = () =>
                  router.push(`/admin/orders/${order._id}`);
                return (
                  <tr
                    key={order._id}
                    className="border-b hover:bg-blue-50 cursor-pointer transition group text-black"
                    tabIndex={0}
                    onClick={rowClick}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") rowClick();
                    }}
                  >
                    <td className="p-2 border whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </td>{" "}
                    <td className="p-2 border max-w-[220px] md:max-w-xs">
                      <ul className="space-y-1">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2 justify-between">
                              {item.product && item.product._id ? (
                                <a
                                  href={`/products/${item.product._id}`}
                                  className="line-clamp-2 text-blue-700 font-semibold underline hover:text-blue-900 transition"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()} // Prevent row click
                                  title={item.product.name}
                                  style={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                  }}
                                >
                                  {item.product.name}
                                </a>
                              ) : (
                                <span
                                  className="line-clamp-2 text-gray-700 font-semibold"
                                  style={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                  }}
                                  title={item.name}
                                >
                                  {item.name || "-"}
                                </span>
                              )}
                              <div>
                                <span className="bg-gray-100 text-gray-800 rounded px-2 py-0.5 text-xs font-mono ml-1">
                                  x{item.quantity}
                                </span>
                                <span className="bg-green-50 text-green-700 rounded px-2 py-0.5 text-xs font-mono ml-1">
                                  ₹{item.price}
                                </span>
                              </div>
                            </li>
                          ))
                        ) : (
                          <li>-</li>
                        )}
                      </ul>
                    </td>{" "}
                    <td className="p-2 border whitespace-nowrap text-center">
                      {order.items.length}
                    </td>
                    <td className="p-2 border whitespace-nowrap">
                      {order.shippingAddress.name || "-"}
                    </td>
                    <td className="p-2 border whitespace-nowrap truncate max-w-[200px]">
                      {order.shippingAddress.street +
                        ", " +
                        order.shippingAddress.city +
                        ", " +
                        order.shippingAddress.state +
                        ", " +
                        order.shippingAddress.pincode}
                    </td>
                    <td className="p-2 border whitespace-nowrap">
                      {order.shippingAddress.phone || "-"}
                    </td>
                    <td className="p-2 border whitespace-nowrap">
                      ₹{order.totalAmount || order.total || 0}
                    </td>
                    <td className="p-2 border whitespace-nowrap">
                      <StatusBadge status={order.status} type="order" />
                    </td>
                    <td className="p-2 border whitespace-nowrap">
                      <StatusBadge
                        status={order.paymentStatus || "-"}
                        type="payment"
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`px-2 py-1 border rounded ${
                p === page ? "bg-blue-100 font-bold" : ""
              }`}
              onClick={() => setPage(p)}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </button>
          ))}
          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
