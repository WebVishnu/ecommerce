"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Loader2,
  Eye,
  EyeOff,
  Star,
  Trash2,
  Package,
  Image as ImageIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  FileText,
  Settings,
  Upload,
  GripVertical,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import DOMPurify from "dompurify";
import { Product } from "@/lib/api";

// Dynamically import React Quill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <div className="h-32 bg-gray-100 rounded animate-pulse"></div>,
});

import "react-quill/dist/quill.snow.css";

// Loading Skeleton Component
const ProductSkeleton = () => (
  <div className="min-h-screen bg-gray-50 py-6 animate-pulse">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="mb-4 h-6 bg-gray-200 rounded w-32"></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        <div className="space-y-6">
          <div className="aspect-square bg-gray-200 rounded-xl"></div>
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
        <div className="space-y-8 bg-white rounded-xl shadow-lg p-8">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="h-12 bg-gray-200 rounded w-24"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

// Image Modal Component
const ImageModal = ({
  isOpen,
  onClose,
  images,
  selectedImage,
  productName,
}: {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  selectedImage: number;
  productName: string;
}) => {
  const [currentImage, setCurrentImage] = useState(selectedImage);

  useEffect(() => {
    setCurrentImage(selectedImage);
  }, [selectedImage]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft") {
      setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
    if (e.key === "ArrowRight") {
      setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
  }, [onClose, images.length]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-modal-title"
    >
      <div className="relative w-full max-w-4xl max-h-full flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Close image modal"
        >
          <X className="w-4 h-4 sm:w-6 sm:h-6" />
        </button>

        {/* Image Container */}
        <div className="relative flex-1 flex items-center justify-center">
          <Image
            src={images[currentImage]}
            alt={`${productName} - Image ${currentImage + 1} of ${
              images.length
            }`}
            width={800}
            height={800}
            className="max-w-full max-h-[60vh] sm:max-h-[70vh] lg:max-h-[80vh] object-contain"
            priority
          />

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setCurrentImage((prev) =>
                    prev === 0 ? images.length - 1 : prev - 1
                  )
                }
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 sm:p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={() =>
                  setCurrentImage((prev) =>
                    prev === images.length - 1 ? 0 : prev + 1
                  )
                }
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 sm:p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
              </button>
            </>
          )}
        </div>

        {/* Image Info */}
        <div className="text-center mt-2 sm:mt-4 text-white px-2">
          <p
            id="image-modal-title"
            className="text-sm sm:text-lg font-medium truncate"
          >
            {productName}
          </p>
          <p className="text-xs sm:text-sm opacity-80">
            Image {currentImage + 1} of {images.length}
          </p>
        </div>

        {/* Thumbnail Navigation (Mobile) */}
        {images.length > 1 && (
          <div className="flex justify-center mt-2 sm:mt-4 px-2">
            <div className="flex gap-1 sm:gap-2 overflow-x-auto max-w-full">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 rounded overflow-hidden border-2 transition-all ${
                    currentImage === index
                      ? "border-white"
                      : "border-white border-opacity-30 hover:border-opacity-60"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                >
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function AdminProductViewPage() {
  const params = useParams();
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(
    null
  );

  const productId = params.id as string;
  const nameTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Category suggestions
  const categorySuggestions = [
    "Automotive",
    "Inverter",
    "Solar",
    "UPS",
    "Industrial",
    "Marine",
    "Telecom",
    "Medical",
    "Agriculture",
    "Renewable Energy",
    "Electric Vehicle",
    "Backup Power",
    "Emergency Power",
    "Off-Grid",
    "Grid-Tied",
  ];

  // Form state for editing
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: 0,
    originalPrice: 0,
    category: "",
    brand: "",
    model: "",
    stock: 0,
    isActive: true,
    isFeatured: false,
    specifications: {} as Record<string, string>,
  });

  useEffect(() => {
    if (isAdmin && productId) {
      fetchProduct();
    }
  }, [isAdmin, productId]);

  // Adjust textarea height when editing starts or name changes
  useEffect(() => {
    if (isEditing && nameTextareaRef.current) {
      const textarea = nameTextareaRef.current;
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }, []);

  // Redirect if not admin
  if (!isAdmin && !authLoading) {
    router.push("/");
    return null;
  }

  const fetchProduct = async () => {
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

      const response = await fetch(`/api/products/${productId}`, {
        headers,
      });
      const data = await response.json();
      if (data.success) {
        setProduct(data.data);
        setEditForm({
          name: data.data.name,
          description: data.data.description,
          price: data.data.price,
          originalPrice: data.data.originalPrice || 0,
          category: data.data.category,
          brand: data.data.brand,
          model: data.data.model,
          stock: data.data.stock,
          isActive: data.data.isActive,
          isFeatured: data.data.isFeatured,
          specifications: data.data.specifications || {},
        });
      } else {
        setError(data.message || "Product not found");
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      setError("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (data.success) {
        setProduct(data.data);
        setIsEditing(false);
        // Show success message
      } else {
        throw new Error(data.message || "Failed to update product");
      }
    } catch (error: any) {
      console.error("Error updating product:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (product) {
      setEditForm({
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice || 0,
        category: product.category,
        brand: product.brand,
        model: product.model,
        stock: product.stock,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        specifications: product.specifications || {},
      });
    }
    setIsEditing(false);
  };

  const handleToggleStatus = async () => {
    setActionLoading("status");
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isActive: !product?.isActive,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setProduct(data.data);
        setEditForm((prev) => ({ ...prev, isActive: data.data.isActive }));
      } else {
        throw new Error(data.message || "Failed to update product status");
      }
    } catch (error: any) {
      console.error("Error updating product status:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async () => {
    setActionLoading("featured");
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isFeatured: !product?.isFeatured,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setProduct(data.data);
        setEditForm((prev) => ({ ...prev, isFeatured: data.data.isFeatured }));
      } else {
        throw new Error(
          data.message || "Failed to update product featured status"
        );
      }
    } catch (error: any) {
      console.error("Error updating product featured status:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${product?.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setActionLoading("delete");
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        router.push("/admin/products");
      } else {
        throw new Error(data.message || "Failed to delete product");
      }
    } catch (error: any) {
      console.error("Error deleting product:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleInputChange = (
    field: string,
    value: string | number | boolean
  ) => {
    console.log(`Updating ${field}:`, value, typeof value);
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSpecificationChange = (key: string, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [key]: value,
      },
    }));
  };

  const addSpecification = () => {
    const newKey = `spec_${Object.keys(editForm.specifications).length + 1}`;
    setEditForm((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [newKey]: "",
      },
    }));
  };

  const removeSpecification = (key: string) => {
    setEditForm((prev) => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return {
        ...prev,
        specifications: newSpecs,
      };
    });
  };

  // Image management functions
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setImageUploading(true);
    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.url);
        } else {
          throw new Error("Failed to upload image");
        }
      }

      // Add new images to the product
      const currentImages = product?.images || [];
      const newImages = [...currentImages, ...uploadedUrls];

      setProduct((prev) => (prev ? { ...prev, images: newImages } : null));
      setEditForm((prev) => ({ ...prev, images: newImages }));
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const currentImages = product?.images || [];
    const newImages = currentImages.filter((_, i) => i !== index);

    setProduct((prev) => (prev ? { ...prev, images: newImages } : null));
    setEditForm((prev) => ({ ...prev, images: newImages }));

    // Adjust selected image if needed
    if (selectedImage >= newImages.length) {
      setSelectedImage(Math.max(0, newImages.length - 1));
    }
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const currentImages = product?.images || [];
    const newImages = [...currentImages];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);

    setProduct((prev) => (prev ? { ...prev, images: newImages } : null));
    setEditForm((prev) => ({ ...prev, images: newImages }));

    // Update selected image index
    if (selectedImage === fromIndex) {
      setSelectedImage(toIndex);
    } else if (selectedImage > fromIndex && selectedImage <= toIndex) {
      setSelectedImage(selectedImage - 1);
    } else if (selectedImage < fromIndex && selectedImage >= toIndex) {
      setSelectedImage(selectedImage + 1);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedImageIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedImageIndex !== null && draggedImageIndex !== dropIndex) {
      moveImage(draggedImageIndex, dropIndex);
    }
    setDraggedImageIndex(null);
  };

  if (loading) {
    return <ProductSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Product Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "The product you are looking for does not exist."}
          </p>
          <div className="space-y-3">
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 bg-[#b91c1c] text-white px-6 py-3 rounded-md hover:bg-[#a31b1b] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.originalPrice! - product.price) / product.originalPrice!) *
          100
      )
    : 0;

  const getStockStatus = () => {
    if (product.stock === 0)
      return { text: "Out of Stock", color: "text-red-600", bg: "bg-red-50" };
    if (product.stock <= 5)
      return {
        text: "Low Stock",
        color: "text-orange-600",
        bg: "bg-orange-50",
      };
    return { text: "In Stock", color: "text-green-600", bg: "bg-green-50" };
  };

  const stockStatus = getStockStatus();

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-end mb-4">
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {!isEditing ? (
                  <>
                    <button
                      onClick={handleDelete}
                      disabled={actionLoading === "delete"}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      {actionLoading === "delete" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={handleToggleFeatured}
                      disabled={actionLoading === "featured"}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#b91c1c] focus:ring-offset-2 ${
                        product.isFeatured
                          ? "bg-yellow-50 border border-yellow-200 text-yellow-700 hover:bg-yellow-100"
                          : "bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {actionLoading === "featured" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Star className="w-4 h-4" />
                      )}
                      <span className="md:inline hidden">
                        {product.isFeatured ? "Unfeature" : "Feature"}
                      </span>
                    </button>
                    <button
                      onClick={handleToggleStatus}
                      disabled={actionLoading === "status"}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#b91c1c] focus:ring-offset-2 ${
                        product.isActive
                          ? "bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100"
                          : "bg-green-50 border border-green-200 text-green-700 hover:bg-green-100"
                      }`}
                    >
                      {actionLoading === "status" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          {product.isActive ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </>
                      )}
                      {product.isActive ? "Hide" : "Show"}
                    </button>

                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#b91c1c] focus:ring-offset-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-[#b91c1c] text-white rounded-lg hover:bg-[#a31b1b] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#b91c1c] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#b91c1c] focus:ring-offset-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Product Images Section */}
            <section
              className={`space-y-6 lg:sticky ${
                isAdmin ? "top-12" : "top-6"
              } lg:self-start`}
            >
              {/* Main Image */}
              <div className="relative">
                <div
                  className={`relative aspect-square bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 group transition-all duration-200 ${
                    product.images && product.images.length > 0
                      ? "cursor-pointer"
                      : ""
                  }`}
                  onClick={() =>
                    product.images &&
                    product.images.length > 0 &&
                    !isEditing &&
                    setImageModalOpen(true)
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    product.images &&
                    product.images.length > 0 &&
                    !isEditing &&
                    setImageModalOpen(true)
                  }
                  tabIndex={
                    product.images && product.images.length > 0 ? 0 : -1
                  }
                  role={
                    product.images && product.images.length > 0
                      ? "button"
                      : undefined
                  }
                  aria-label={
                    product.images && product.images.length > 0
                      ? "Click to view larger image"
                      : "No images available"
                  }
                >
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[selectedImage]}
                      alt={`${product.name} - Main product image`}
                      fill
                      className="object-cover object-center transition-transform duration-200 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageIcon className="w-20 h-20" />
                    </div>
                  )}

                  {/* Image Upload Overlay (when editing) */}
                  {isEditing && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <label className="cursor-pointer bg-white rounded-lg p-3 hover:bg-gray-50 transition-colors">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={imageUploading}
                        />
                        {imageUploading ? (
                          <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
                        ) : (
                          <Upload className="w-6 h-6 text-gray-600" />
                        )}
                      </label>
                    </div>
                  )}

                  {/* Status Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded shadow ${
                        product.isActive
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                    {product.isFeatured && (
                      <span className="bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded shadow">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Discount Badge */}
                  {hasDiscount && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-md shadow-sm">
                      -{discountPercentage}% OFF
                    </div>
                  )}

                  {/* Zoom Indicator */}
                  <div className="absolute top-4 right-4 bg-white bg-opacity-80 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-4 h-4 text-gray-600" />
                  </div>

                  {/* Navigation Arrows */}
                  {product.images && product.images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage((prev) =>
                            prev === 0 ? product.images.length - 1 : prev - 1
                          );
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-[#b91c1c] hover:text-white p-2 rounded-full shadow-md transition-all border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#b91c1c]"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage((prev) =>
                            prev === product.images.length - 1 ? 0 : prev + 1
                          );
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-[#b91c1c] hover:text-white p-2 rounded-full shadow-md transition-all border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#b91c1c]"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Thumbnail Images */}
              <div className="space-y-3">
                {product.images && product.images.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {product.images.map((image, index) => (
                      <div
                        key={index}
                        className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-150 ${
                          selectedImage === index
                            ? "border-[#b91c1c] ring-2 ring-[#b91c1c]"
                            : "border-gray-200 hover:border-[#b91c1c]"
                        } ${draggedImageIndex === index ? "opacity-50" : ""}`}
                        draggable={isEditing}
                        onDragStart={(e) =>
                          isEditing && handleDragStart(e, index)
                        }
                        onDragOver={(e) => isEditing && handleDragOver(e)}
                        onDrop={(e) => isEditing && handleDrop(e, index)}
                      >
                        <button
                          onClick={() => setSelectedImage(index)}
                          className="w-full h-full focus:outline-none focus:ring-2 focus:ring-[#b91c1c]"
                          aria-label={`View image ${index + 1} of ${
                            product.images.length
                          }`}
                        >
                          <Image
                            src={image}
                            alt={`${product.name} - Thumbnail ${index + 1}`}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                          />
                        </button>

                        {/* Edit Controls */}
                        {isEditing && (
                          <>
                            {/* Drag Handle */}
                            <div className="absolute top-1 left-1 bg-black bg-opacity-50 rounded p-1 cursor-move">
                              <GripVertical className="w-3 h-3 text-white" />
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(index);
                              }}
                              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 rounded-full p-1 transition-colors"
                              aria-label={`Remove image ${index + 1}`}
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload More Images Button */}
                {isEditing && (
                  <div className="flex justify-center">
                    <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={imageUploading}
                      />
                      <div className="flex flex-col items-center gap-2">
                        {imageUploading ? (
                          <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
                        ) : (
                          <Upload className="w-6 h-6 text-gray-600" />
                        )}
                        <span className="text-sm text-gray-600">
                          {imageUploading
                            ? "Uploading..."
                            : "Upload More Images"}
                        </span>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </section>

            {/* Product Information Section */}
            <section
              className={`space-y-8 sm:bg-white rounded-xl sm:shadow-lg ${
                isEditing ? "sm:p-4" : "lg:p-8"
              }`}
            >
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.brand}
                        onChange={(e) =>
                          handleInputChange("brand", e.target.value)
                        }
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#b91c1c]"
                        placeholder="Brand"
                      />
                    ) : (
                      product.brand
                    )}
                  </span>
                  {product.isFeatured && (
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Featured
                    </span>
                  )}
                </div>

                {/* Product Name */}
                <div>
                  {isEditing ? (
                    <textarea
                      ref={nameTextareaRef}
                      value={editForm.name}
                      onChange={(e) => {
                        handleInputChange("name", e.target.value);
                      }}
                      className="w-full text-2xl font-bold text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b91c1c] resize-none overflow-hidden min-h-[3rem]"
                      placeholder="Product name"
                      rows={1}
                    />
                  ) : (
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                      {product.name}
                    </h1>
                  )}
                </div>

                {/* Rating */}
                {product.rating > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.rating.toFixed(1)} ({product.reviews} reviews)
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) =>
                          handleInputChange(
                            "price",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="text-3xl font-bold text-[#b91c1c] border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b91c1c]"
                        placeholder="Price"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-[#b91c1c]">
                        ₹{product.price.toLocaleString()}
                      </span>
                    )}
                    {hasDiscount && !isEditing && (
                      <span className="text-2xl text-gray-500 line-through">
                        ₹{product.originalPrice!.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {hasDiscount && !isEditing && (
                    <span className="text-base text-green-600 font-medium">
                      You save ₹
                      {(
                        product.originalPrice! - product.price
                      ).toLocaleString()}{" "}
                      ({discountPercentage}%)
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                <div
                  className={`inline-flex items-center gap-2 px-3 rounded-md ${stockStatus.bg}`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      product.stock > 0 ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <span className={`text-sm font-medium ${stockStatus.color}`}>
                    {stockStatus.text}
                  </span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editForm.stock}
                      onChange={(e) =>
                        handleInputChange(
                          "stock",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#b91c1c]"
                      placeholder="Stock"
                    />
                  ) : (
                    <span className="text-sm text-gray-600">
                      ({product.stock} available)
                    </span>
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                {!isEditing && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Product Details
                    </h3>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="relative">
                          <input
                            type="text"
                            value={editForm.category}
                            onChange={(e) => {
                              const value = e.target.value;
                              handleInputChange("category", value);
                              // Show suggestions if input is not empty
                              if (value.length > 0) {
                                setShowCategorySuggestions(true);
                              } else {
                                setShowCategorySuggestions(false);
                              }
                            }}
                            onFocus={() => {
                              if (editForm.category.length > 0) {
                                setShowCategorySuggestions(true);
                              }
                            }}
                            onBlur={() => {
                              // Delay hiding suggestions to allow clicking on them
                              setTimeout(
                                () => setShowCategorySuggestions(false),
                                200
                              );
                            }}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b91c1c]"
                            placeholder="Enter category name"
                          />
                          {showCategorySuggestions && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                              {categorySuggestions
                                .filter(
                                  (cat) =>
                                    cat
                                      .toLowerCase()
                                      .includes(
                                        editForm.category.toLowerCase()
                                      ) || editForm.category === ""
                                )
                                .map((category, index) => (
                                  <button
                                    key={index}
                                    type="button"
                                    onClick={() => {
                                      handleInputChange("category", category);
                                      setShowCategorySuggestions(false);
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                  >
                                    {category}
                                  </button>
                                ))}
                              {editForm.category &&
                                !categorySuggestions.some(
                                  (cat) =>
                                    cat.toLowerCase() ===
                                    editForm.category.toLowerCase()
                                ) && (
                                  <div className="px-3 py-2 text-sm text-gray-500 border-t">
                                    Press Enter to create "{editForm.category}"
                                  </div>
                                )}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Type to create a new category or select from
                          suggestions
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-900 capitalize">
                        {product.category}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.model}
                        onChange={(e) =>
                          handleInputChange("model", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b91c1c]"
                        placeholder="Model"
                      />
                    ) : (
                      <p className="text-gray-900">{product.model}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Original Price
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editForm.originalPrice || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          const numValue = value === "" ? 0 : parseFloat(value);
                          handleInputChange("originalPrice", numValue);
                        }}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b91c1c]"
                        placeholder="Original price (optional)"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {product.originalPrice && product.originalPrice > 0
                          ? `₹${product.originalPrice.toLocaleString()}`
                          : "Not set"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created
                    </label>
                    <p className="text-gray-900">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Description
                </h3>
                {isEditing ? (
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <ReactQuill
                      value={editForm.description}
                      onChange={(value) =>
                        handleInputChange("description", value)
                      }
                      placeholder="Product description..."
                      modules={{
                        toolbar: [
                          [{ header: [1, 2, 3, false] }],
                          ["bold", "italic", "underline", "strike"],
                          [{ list: "ordered" }, { list: "bullet" }],
                          [{ color: [] }, { background: [] }],
                          ["link", "image"],
                          ["clean"],
                        ],
                      }}
                      className="min-h-[200px]"
                    />
                  </div>
                ) : (
                  <div
                    className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(product.description),
                    }}
                  />
                )}
              </div>

              {/* Specifications */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Specifications
                  </h3>
                  {isEditing && (
                    <button
                      onClick={addSpecification}
                      className="inline-flex items-center gap-1 text-sm text-[#b91c1c] hover:text-[#a31b1b] transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Add Spec
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    {Object.entries(editForm.specifications).map(
                      ([key, value]) => (
                        <div key={key} className="flex gap-2">
                          <input
                            type="text"
                            value={key}
                            onChange={(e) => {
                              const newSpecs = { ...editForm.specifications };
                              delete newSpecs[key];
                              newSpecs[e.target.value] = value;
                              setEditForm((prev) => ({
                                ...prev,
                                specifications: newSpecs,
                              }));
                            }}
                            className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b91c1c]"
                            placeholder="Specification name"
                          />
                          <input
                            type="text"
                            value={value}
                            onChange={(e) =>
                              handleSpecificationChange(key, e.target.value)
                            }
                            className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#b91c1c]"
                            placeholder="Value"
                          />
                          <button
                            onClick={() => removeSpecification(key)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 bg-gray-50 p-4 rounded-lg">
                    {Object.entries(product.specifications || {}).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between items-start py-2 border-b border-gray-100 last:border-b-0"
                        >
                          <span className="text-gray-600 capitalize whitespace-nowrap">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                          <span className="font-medium text-gray-900 text-right">
                            {value}
                          </span>
                        </div>
                      )
                    )}
                    {(!product.specifications ||
                      Object.keys(product.specifications).length === 0) && (
                      <div className="text-gray-500 italic col-span-2">
                        No specifications provided.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {product.images && product.images.length > 0 && (
        <ImageModal
          isOpen={imageModalOpen}
          onClose={() => setImageModalOpen(false)}
          images={product.images}
          selectedImage={selectedImage}
          productName={product.name}
        />
      )}
    </>
  );
}
