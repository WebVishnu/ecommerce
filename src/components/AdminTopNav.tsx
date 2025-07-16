"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  Plus,
  Package,
  Users,
  ShoppingCart,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";

let refetchPendingOrdersCount: (() => void) | null = null;

export function triggerPendingOrdersCountRefetch() {
  if (refetchPendingOrdersCount) refetchPendingOrdersCount();
}

export default function AdminTopNav() {
  const { isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  const fetchPendingCount = () => {
    fetch("/api/orders/pending-count")
      .then((res) => res.json())
      .then((data) => setPendingCount(data.count))
      .catch(() => setPendingCount(null));
  };

  useEffect(() => {
    fetchPendingCount();
    refetchPendingOrdersCount = fetchPendingCount;
    return () => {
      refetchPendingOrdersCount = null;
    };
  }, []);

  // Don't render if user is not admin
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="bg-gray-900 text-white shadow-lg fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="flex items-center justify-between py-1"
          onClick={() => setMobileOpen((open) => !open)}
        >
          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 focus:outline-none text-white flex items-center gap-2 select-none"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
            Admin Panel{" "}
            {pendingCount !== null && pendingCount > 0 && !mobileOpen && (
              <span className="ml-1 bg-red-600 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                {pendingCount}
              </span>
            )}
          </button>

          {/* Center - Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/admin/products"
              className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
            >
              <Package className="w-4 h-4" />
              <span className="text-white">Products</span>
            </Link>

            <Link
              href="/admin/add-product"
              className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-white">Add Product</span>
            </Link>

            <Link
              href="/admin/orders"
              className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors relative"
            >
              {pendingCount !== null && pendingCount > 0 && (
                <span className="ml-1 bg-red-600 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                  {pendingCount}
                </span>
              )}
              {pendingCount == null || pendingCount == 0 && (
                <ShoppingCart className="w-4 h-4" />
              )}
              <span className="text-white">Orders</span>
            </Link>

            <Link
              href="/admin/customers"
              className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
            >
              <Users className="w-4 h-4" />
              <span className="text-white">Customers</span>
            </Link>

            {/* <Link
              href="/admin/reports"
              className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-white">Reports</span>
            </Link>

            <Link
              href="/admin/inventory"
              className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
            >
              <Database className="w-4 h-4" />
              <span className="text-white">Inventory</span>
            </Link>

            <Link
              href="/admin/settings"
              className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="text-white">Settings</span>
            </Link>

            <Link
              href="/admin/message-central"
              className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-white">Message Central</span>
            </Link> */}
          </nav>
        </div>
      </div>
      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-gray-900 w-full absolute left-0 top-full shadow-lg animate-fade-in z-50">
          <nav className="flex flex-col space-y-2 py-4 px-6">
            <Link
              href="/admin/products"
              className="flex items-center space-x-2 py-2 text-gray-300 hover:text-white transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              <Package className="w-5 h-5" />
              <span className="text-white">Products</span>
            </Link>
            <Link
              href="/admin/add-product"
              className="flex items-center space-x-2 py-2 text-gray-300 hover:text-white transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              <Plus className="w-5 h-5" />
              <span className="text-white">Add Product</span>
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center space-x-2 py-2 text-gray-300 hover:text-white transition-colors relative"
              onClick={() => setMobileOpen(false)}
            >
              {pendingCount !== null && pendingCount > 0 && (
                <span className="ml-2 bg-red-600 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                  {pendingCount}
                </span>
              )}
              {pendingCount == null || pendingCount == 0 && (
                <ShoppingCart className="w-5 h-5" />
              )}
              <span className="text-white">Orders</span>
            </Link>
            <Link
              href="/admin/customers"
              className="flex items-center space-x-2 py-2 text-gray-300 hover:text-white transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              <Users className="w-5 h-5" />
              <span className="text-white">Customers</span>
            </Link>
            {/* <Link
              href="/admin/reports"
              className="flex items-center space-x-2 py-2 text-gray-300 hover:text-white transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-white">Reports</span>
            </Link>
            <Link
              href="/admin/inventory"
              className="flex items-center space-x-2 py-2 text-gray-300 hover:text-white transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              <Database className="w-5 h-5" />
              <span className="text-white">Inventory</span>
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center space-x-2 py-2 text-gray-300 hover:text-white transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              <Settings className="w-5 h-5" />
              <span className="text-white">Settings</span>
            </Link>
            <Link
              href="/admin/message-central"
              className="flex items-center space-x-2 py-2 text-gray-300 hover:text-white transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-white">Message Central</span>
            </Link> */}
          </nav>
        </div>
      )}
    </div>
  );
}
