"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Plus,
  Search,
  Package,
  XCircle,
  Filter as FilterIcon,
} from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/lib/api";

// Loading Skeleton Component
const ProductGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
    {[...Array(8)].map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-xl border border-gray-200 shadow-sm"
      >
        <div className="aspect-[4/3] bg-gray-200 rounded-t-xl"></div>
        <div className="p-3 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

// Filter Drawer/Modal Component
const FilterDrawer = ({
  open,
  onClose,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  categories,
  statusOptions,
}: {
  open: boolean;
  onClose: () => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  categories: { value: string; label: string }[];
  statusOptions: { value: string; label: string }[];
}) => {
  return (
    <div
      className={`fixed inset-0 z-40 ${open ? "" : "pointer-events-none"}`}
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-200 ${
          open ? "opacity-40" : "opacity-0"
        }`}
        onClick={onClose}
        aria-label="Close filters"
      />
      {/* Drawer/Modal */}
      <div
        className={`fixed right-0 top-0 h-full w-80 max-w-full bg-white shadow-lg transform transition-transform duration-300 z-50 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close filters"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b91c1c] focus:border-transparent"
              aria-label="Filter by category"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b91c1c] focus:border-transparent"
              aria-label="Filter by status"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminProductsPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [view] = useState<"grid" | "list">("grid");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("authToken");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch("/api/products", {
        headers,
      });
      const data = await response.json();

      if (data.success) {
        setProducts(data.data.products);
      } else {
        setError(data.message || "Failed to fetch products");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
    }
  }, [isAdmin]);

  // Redirect if not admin
  if (!isAdmin && !authLoading) {
    router.push("/");
    return null;
  }

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;
    const matchesStatus =
      !selectedStatus ||
      (selectedStatus === "active" && product.isActive) ||
      (selectedStatus === "inactive" && !product.isActive);
    return matchesSearch && matchesCategory && matchesStatus;
  });


  const categories = [
    { value: "", label: "All Categories" },
    { value: "automotive", label: "Automotive" },
    { value: "inverter", label: "Inverter" },
    { value: "solar", label: "Solar" },
    { value: "ups", label: "UPS" },
    { value: "industrial", label: "Industrial" },
  ];
  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const handleEditProduct = (product: Product) => {
    router.push(`/admin/products/${product._id}`);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (
      !confirm(
        `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`/api/products/${product._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to delete product");
      }

      // Remove from local state
      setProducts(products.filter((p) => p._id !== product._id));
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error deleting product:", error);
        alert(error.message || "Failed to delete product");
      } else {
        console.error("Unknown error deleting product:", error);
        alert("Failed to delete product");
      }
    }
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`/api/products/${product._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isActive: !product.isActive,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to update product status");
      }

      // Update local state
      setProducts(
        products.map((p) =>
          p._id === product._id ? { ...p, isActive: !p.isActive } : p
        )
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error updating product status:", error);
        alert(error.message || "Failed to update product status");
      } else {
        console.error("Unknown error updating product status:", error);
        alert("Failed to update product status");
      }
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`/api/products/${product._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isFeatured: !product.isFeatured,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message || "Failed to update product featured status"
        );
      }

      // Update local state
      setProducts(
        products.map((p) =>
          p._id === product._id ? { ...p, isFeatured: !p.isFeatured } : p
        )
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error updating product featured status:", error);
        alert(error.message || "Failed to update product featured status");
      } else {
        console.error("Unknown error updating product featured status:", error);
        alert("Failed to update product featured status");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-6">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
          <ProductGridSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Products
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchProducts}
            className="bg-[#b91c1c] text-white px-6 py-2 rounded-md hover:bg-[#a31b1b] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Top Bar */}
      <div
        className={`sticky ${
          isAdmin ? "md:top-8 top-10" : "top-0"
        } z-30 bg-white border-b border-gray-200 shadow-sm`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center gap-4 py-3">
          {/* Search */}
          <div className="flex justify-between w-full gap-2">
            <div className="relative flex-1 w-full md:max-w-xs">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 ${
                  searchTerm ? "text-gray-400" : "text-gray-600"
                }`}
              />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b91c1c] focus:border-transparent"
                aria-label="Search products"
              />
            </div>
            <button
              onClick={() => setFilterOpen(true)}
              className="p-2 sm:hidden rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 focus:outline-none flex items-center gap-1"
              aria-label="Open filters"
            >
              <FilterIcon className="w-5 h-5" />
            </button>
          </div>
          {/* Actions */}
          <div className="md:flex hidden gap-2 items-center flex-1 justify-end">
            {/* Filters Button */}
            <button
              onClick={() => setFilterOpen(true)}
              className="p-2 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 focus:outline-none flex items-center gap-1"
              aria-label="Open filters"
            >
              <FilterIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
            </button>
            {/* Add New Product (desktop only) */}
            <Link
              href="/admin/add-product"
              className="hidden md:inline-flex items-center text-nowrap gap-2 bg-[#b91c1c] text-white px-4 py-2 rounded-md hover:bg-[#a31b1b] transition-colors focus:outline-none"
              aria-label="Add new product"
            >
              <Plus className="w-4 h-4" />
              <span className="text-white">Add New Product</span>
            </Link>
          </div>
        </div>
      </div>
      {/* Filter Drawer/Modal */}
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        categories={categories}
        statusOptions={statusOptions}
      />
      {/* Floating Add New Product Button (mobile only, always visible) */}
      <Link
        href="/admin/add-product"
        className="fixed bottom-4 right-4 z-50 md:hidden flex items-center gap-2 bg-[#b91c1c] text-white px-4 py-3 rounded-full shadow-lg hover:bg-[#a31b1b] transition-colors focus:outline-none"
        aria-label="Add new product"
      >
        <Plus className="w-5 h-5" />
        <span className="font-semibold text-white">Add New Product</span>
      </Link>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory || selectedStatus
                ? "Try adjusting your search or filters"
                : "Get started by adding your first product"}
            </p>
            {!searchTerm && !selectedCategory && !selectedStatus && (
              <Link
                href="/admin/add-product"
                className="inline-flex items-center gap-2 bg-[#b91c1c] text-white px-6 py-2 rounded-md hover:bg-[#a31b1b] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add First Product
              </Link>
            )}
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 gap-1">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                showAdminActions={true}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onToggleStatus={handleToggleStatus}
                onToggleFeatured={handleToggleFeatured}
              />
            ))}
          </div>
        ) : (
          <div className="divide-y rounded-lg border bg-white">
            {filteredProducts.map((product) => (
              <div key={product._id} className="p-4">
                <ProductCard
                  product={product}
                  showAdminActions={true}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onToggleStatus={handleToggleStatus}
                  onToggleFeatured={handleToggleFeatured}
                  listView={true}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
