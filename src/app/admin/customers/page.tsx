"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Search, FileText, Loader2 } from "lucide-react";
import Link from "next/link";

interface Customer {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  orderCount: number;
  totalSpend: number;
  lastOrderDate: string;
}

interface TopSpender {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  totalSpend: number;
}

export default function AdminCustomersPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState<{ totalCustomers: number; newCustomersThisMonth: number; topSpender: TopSpender | null }>({ totalCustomers: 0, newCustomersThisMonth: 0, topSpender: null });
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  useEffect(() => {
    if (isAdmin) {
      fetchCustomers();
    }
  }, [isAdmin, page, searchTerm]);

  // Redirect if not admin
  if (!isAdmin && !authLoading) {
    router.push("/");
    return null;
  }

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search: searchTerm,
      });
      const res = await fetch(`/api/admin/customers?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCustomers(data.data.customers || []);
      setTotal(data.data.pagination.total || 0);
      setTotalPages(data.data.pagination.totalPages || 1);
      setSummary(data.data.summary || { totalCustomers: 0, newCustomersThisMonth: 0, topSpender: null });
    } catch {
      setCustomers([]);
      setTotal(0);
      setTotalPages(1);
      setSummary({ totalCustomers: 0, newCustomersThisMonth: 0, topSpender: null });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-transparent"
            />
          </div>
        </div>
        <div className="overflow-x-auto bg-white">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin w-8 h-8 text-orange-500" />
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No customers found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? "Try adjusting your search."
                  : "No customers have registered yet."}
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Orders</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Total Spend</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Last Order</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((customer) => (
                  <tr
                    key={customer._id}
                    className="hover:bg-red-50 cursor-pointer transition group"
                    onClick={() => router.push(`/admin/customers/${customer._id}`)}
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') router.push(`/admin/customers/${customer._id}`); }}
                  >
                    <td className="px-4 py-2 font-medium text-gray-900 text-nowrap">{customer.name}</td>
                    <td className="px-4 py-2 text-gray-700">{customer.phone}</td>
                    <td className="px-4 py-2 text-gray-700">{customer.email || "-"}</td>
                    <td className="px-4 py-2 text-gray-700 text-center">{customer.orderCount}</td>
                    <td className="px-4 py-2 text-gray-700 text-center">₹{customer.totalSpend.toLocaleString()}</td>
                    <td className="px-4 py-2 text-gray-700 text-center">{customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${customer.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {customer.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <button
              className="px-2 py-1 border rounded disabled:opacity-50"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`px-2 py-1 border rounded ${p === page ? "bg-orange-100 font-bold" : ""}`}
                onClick={() => setPage(p)}
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </button>
            ))}
            <button
              className="px-2 py-1 border rounded disabled:opacity-50"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 