"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Users, CheckCircle, XCircle, Phone } from "lucide-react";

interface OrderItem {
  product: any;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
}

interface CustomerStats {
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  avgOrderValue: number;
}

interface Customer {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  addresses?: any[];
  role?: string; // Added role to Customer interface
}

export default function AdminCustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAdmin, loading: authLoading } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const customerId = params.id as string;
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    if (isAdmin && customerId) {
      fetchCustomer();
      fetchOrdersAndStats();
    }
  }, [isAdmin, customerId]);

  if (!isAdmin && !authLoading) {
    router.push("/");
    return null;
  }

  const fetchCustomer = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/admin/customers/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCustomer(data.data.customer || null);
    } catch {
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!customer) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/admin/customers/${customer._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !customer.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setCustomer({ ...customer, isActive: !customer.isActive });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleMakeAdmin = async () => {
    setRoleLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/admin/customers/${customer?._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: "admin" }),
      });
      const data = await res.json();
      if (data.success && customer) {
        setCustomer({ ...customer, role: "admin" });
      }
    } finally {
      setRoleLoading(false);
    }
  };

  const fetchOrdersAndStats = async () => {
    setOrdersLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/orders?customerId=${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data.data.orders || []);
      // Calculate stats
      if (data.data.orders && data.data.orders.length > 0) {
        const totalOrders = data.data.orders.length;
        const totalSpent = data.data.orders.reduce(
          (sum: number, o: Order) => sum + o.total,
          0
        );
        const lastOrderDate = data.data.orders[0].createdAt;
        const avgOrderValue = totalSpent / totalOrders;
        setStats({ totalOrders, totalSpent, lastOrderDate, avgOrderValue });
      } else {
        setStats({ totalOrders: 0, totalSpent: 0, avgOrderValue: 0 });
      }
    } catch {
      setOrders([]);
      setStats({ totalOrders: 0, totalSpent: 0, avgOrderValue: 0 });
    } finally {
      setOrdersLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-orange-500" />
      </div>
    );
  }
  if (!customer) {
    return <div className="p-6 text-red-500">Customer not found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 min-h-screen text-black py-6">
      <a
        href={`tel:${customer.phone}`}
        className="flex items-center gap-2 bg-[#b91c1c] text-white px-4 py-2 rounded-md fixed bottom-2 left-2"
      >
        <Phone className="w-4 h-4" />
        +91 {customer.phone}
      </a>
      {/* Left: Sticky User Details */}
      <aside className="md:w-1/3 w-full md:sticky md:top-8 h-fit">
        <div className="bg-white rounded-lg border p-4 md:p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-7 h-7 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              {customer.name}
            </h2>
          </div>
          <div className="text-sm text-gray-700">
            <div className="mb-1">
              <span className="font-semibold">Phone:</span> {customer.phone}
            </div>
            <div className="mb-1 flex items-center">
              <span className="font-semibold">Status:</span>
              <span
                className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${
                  customer.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {customer.isActive ? "Active" : "Inactive"}
              </span>
              <a
                onClick={handleToggleActive}
                className="cursor-pointer text-blue-400 underline ps-2"
              >
                {actionLoading
                  ? "Loading..."
                  : customer.isActive
                  ? "Deactivate"
                  : "Activate"}
              </a>
            </div>
            <div className="mb-1">
              <span className="font-semibold">Email:</span>{" "}
              {customer.email || "-"}
            </div>
            {/* Make Admin Option */}
            {customer && customer.role !== "admin" && (
              <button
                onClick={() => customer && handleMakeAdmin()}
                disabled={roleLoading}
                className="mt-2 px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-xs"
              >
                {roleLoading ? "Making Admin..." : "Make Admin"}
              </button>
            )}
          </div>
          <section>
            <h3 className="text-base font-semibold mb-3">Addresses</h3>
            {customer.addresses && customer.addresses.length > 0 ? (
              <div className="space-y-2">
                {customer.addresses.map((addr, idx) => (
                  <div key={idx} className="border rounded p-2 text-sm">
                    {addr.isDefault && (
                      <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">
                        Default
                      </span>
                    )}
                    <div>
                      <span className="font-semibold">Name:</span> {addr.name}
                    </div>
                    <div>
                      <span className="font-semibold">Phone:</span> {addr.phone}
                    </div>
                    <div>
                      <span className="font-semibold">
                        {addr.street}, {addr.city}, {addr.state} -{" "}
                        {addr.pincode}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm">No addresses found.</div>
            )}
          </section>
        </div>
      </aside>

      {/* Right: Insights, Addresses, Order History */}
      <main className="md:w-2/3 w-full flex flex-col bg-white p-4 gap-5">
        {/* Insights */}
        <section>
          <h3 className="text-base font-semibold mb-3">Customer Insights</h3>
          {ordersLoading ? (
            <Loader2 className="animate-spin w-5 h-5 text-orange-500" />
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <div className="text-lg font-bold">{stats.totalOrders}</div>
                <div className="text-gray-600 text-xs">Total Orders</div>
              </div>
              <div>
                <div className="text-lg font-bold">
                  ₹{stats.totalSpent.toFixed(2)}
                </div>
                <div className="text-gray-600 text-xs">Total Spent</div>
              </div>
              <div>
                <div className="text-lg font-bold">
                  {stats.lastOrderDate
                    ? new Date(stats.lastOrderDate).toLocaleDateString()
                    : "-"}
                </div>
                <div className="text-gray-600 text-xs">Last Order</div>
              </div>
              <div>
                <div className="text-lg font-bold">
                  ₹{stats.avgOrderValue.toFixed(2)}
                </div>
                <div className="text-gray-600 text-xs">Avg. Order Value</div>
              </div>
            </div>
          ) : null}
        </section>

        {/* Order History */}
        <section>
          <h3 className="text-base font-semibold mb-3">Order History</h3>
          {ordersLoading ? (
            <Loader2 className="animate-spin w-5 h-5 text-orange-500" />
          ) : orders.length === 0 ? (
            <div className="text-gray-500 text-sm">
              No orders found for this customer.
            </div>
          ) : (
            <div>
              {orders.map((order) => (
                <div key={order._id} className="sm:border sm:p-3">
                  <div className="flex flex-wrap justify-between items-center mb-1 text-xs">
                    <div>
                      <span className="font-semibold">Date:</span>{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-semibold">Status:</span>{" "}
                      {order.status}
                    </div>
                    <div>
                      <span className="font-semibold">Total:</span> ₹
                      {order.total.toFixed(2)}
                    </div>
                  </div>
                  <div className="mt-1">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-2 py-1 text-left">Name</th>
                            <th className="px-2 py-1 text-left">Price</th>
                            <th className="px-2 py-1 text-left">Qty</th>
                            <th className="px-2 py-1 text-left">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, idx) => (
                            <tr key={idx}>
                              <td
                                className="px-2 py-1 underline text-blue-300 cursor-pointer"
                                onClick={() => {
                                  router.push(`/products/${item.product._id}`);
                                }}
                              >
                                {item.name}
                              </td>
                              <td className="px-2 py-1">
                                ₹{item.price.toFixed(2)}
                              </td>
                              <td className="px-2 py-1">{item.quantity}</td>
                              <td className="px-2 py-1">
                                ₹{item.total.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
