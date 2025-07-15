"use client";

import { Suspense } from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import dynamic from "next/dynamic";
import {
  Plus,
  X,
  Save,
  ArrowLeft,
  Loader2,
  Upload,
  FileText,
  Settings,
  CheckCircle,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import Image from "next/image";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand: string;
  model: string;
  stock: number;
  images: string[];
  specifications: Record<string, string>;
  isActive: boolean;
  isFeatured: boolean;
}

const DEFAULT_CATEGORIES = [
  { value: "automotive", label: "Automotive" },
  { value: "inverter", label: "Inverter" },
  { value: "solar", label: "Solar" },
  { value: "ups", label: "UPS" },
  { value: "industrial", label: "Industrial" },
];

const LOCAL_STORAGE_KEY = "product_draft_data";
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

// ReactQuill modules configuration
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ["link", "image"],
    ["clean"],
  ],
};

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "color",
  "background",
  "align",
  "link",
  "image",
];

function AddProductPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAdmin, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [categoryInput, setCategoryInput] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categoryInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    originalPrice: undefined,
    category: "automotive",
    brand: "",
    model: "",
    stock: 0,
    images: [],
    specifications: {},
    isActive: true,
    isFeatured: false,
  });

  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");

  // Load draft or product from URL parameter
  useEffect(() => {
    const draftParam = searchParams.get("draft");
    const editParam = searchParams.get("edit");

    if (draftParam) {
      loadDraftFromDatabase(draftParam);
    } else if (editParam) {
      loadProductForEdit(editParam);
    } else {
      loadFromLocalStorage();
    }
  }, [searchParams]);

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges) {
      const autoSaveTimer = setTimeout(() => {
        saveDraft();
      }, AUTO_SAVE_INTERVAL);

      return () => clearTimeout(autoSaveTimer);
    }
  }, [formData, hasUnsavedChanges]);

  // Page unload protection
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (hasUnsavedChanges) {
          e.preventDefault();
          e.returnValue = "";
          return "";
        }
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  }, [hasUnsavedChanges]);

  const saveToLocalStorage = useCallback((data: ProductFormData) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      console.log("Saved to localStorage");
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, []);

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
        setHasUnsavedChanges(true);
        console.log("Loaded draft from localStorage");
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
  };

  // Redirect if not admin
  if (!isAdmin && !authLoading) {
    router.push("/");
    return null;
  }

  const loadProductForEdit = async (productId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${productId}`);
      const data = await response.json();

      if (data.success) {
        const product = data.data.product;
        setFormData({
          name: product.name || "",
          description: product.description || "",
          price: product.price || 0,
          originalPrice: product.originalPrice,
          category: product.category || "automotive",
          brand: product.brand || "",
          model: product.model || "",
          stock: product.stock || 0,
          images: product.images || [],
          specifications: product.specifications || {},
          isActive: product.isActive !== undefined ? product.isActive : true,
          isFeatured: product.isFeatured || false,
        });
        setDraftId(productId);
        setHasUnsavedChanges(false);
        console.log("Loaded product for editing");
      }
    } catch (error) {
      console.error("Error loading product for edit:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDraftFromDatabase = async (draftId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${draftId}`);
      const data = await response.json();

      if (data.success && data.data.product.isDraft) {
        const draft = data.data.product;
        setFormData({
          name: draft.name || "",
          description: draft.description || "",
          price: draft.price || 0,
          originalPrice: draft.originalPrice,
          category: draft.category || "automotive",
          brand: draft.brand || "",
          model: draft.model || "",
          stock: draft.stock || 0,
          images: draft.images || [],
          specifications: draft.specifications || {},
          isActive: draft.isActive !== undefined ? draft.isActive : true,
          isFeatured: draft.isFeatured || false,
        });
        setDraftId(draftId);
        setHasUnsavedChanges(false);
        console.log("Loaded draft from database");
      }
    } catch (error) {
      console.error("Error loading draft:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async () => {
    try {
      setLoading(true);

      // Save to localStorage first
      saveToLocalStorage(formData);

      // Save to database
      const url = draftId
        ? `/api/products/drafts?id=${draftId}`
        : "/api/products/drafts";

      const method = draftId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        if (!draftId) {
          setDraftId(data.data.draft._id);
        }
        setHasUnsavedChanges(false);
        console.log("Draft saved successfully");
      } else {
        console.error("Failed to save draft:", data.message);
      }
    } catch (error) {
      console.error("Error saving draft:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setHasUnsavedChanges(false);
  };

  const handleInputChange = (
    field: keyof ProductFormData,
    value: string | number | boolean | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasUnsavedChanges(true);
  };

  const handleImageUpload = async (files: FileList) => {
    setUploading(true);
    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          // 5MB limit
          continue;
        }

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
          console.error(`Failed to upload ${file.name}`);
        }
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleImageRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setHasUnsavedChanges(true);
  };

  const handleSpecificationAdd = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setFormData((prev) => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [newSpecKey.trim()]: newSpecValue.trim(),
        },
      }));
      setNewSpecKey("");
      setNewSpecValue("");
      setHasUnsavedChanges(true);
    }
  };

  const handleSpecificationRemove = (key: string) => {
    setFormData((prev) => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return {
        ...prev,
        specifications: newSpecs,
      };
    });
    setHasUnsavedChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanFormData = {
        ...formData,
        originalPrice: formData.originalPrice || undefined,
      };

      // Determine if we're editing an existing product or creating a new one
      const isEditing = searchParams.get("edit");
      const url = isEditing ? `/api/products/${isEditing}` : "/api/products";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanFormData),
      });

      const data = await response.json();

      if (data.success) {
        // Clear localStorage and draft data
        clearLocalStorage();
        if (draftId && !isEditing) {
          // Delete the draft from database only if not editing
          await fetch(`/api/products/${draftId}`, { method: "DELETE" });
        }

        setSuccess(true);
        setTimeout(() => {
          router.push("/admin/products");
        }, 2000);
      } else {
        const action = isEditing ? "update" : "create";
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      const action = searchParams.get("edit") ? "update" : "create";
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    await saveDraft();
  };

  const formatLastSaved = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };

  // Filtered categories for dropdown
  const filteredCategories = categories.filter((cat) =>
    cat.label.toLowerCase().includes(categoryInput.toLowerCase())
  );

  // Handle category selection
  const handleCategorySelect = (cat: { value: string; label: string }) => {
    setFormData((prev) => ({ ...prev, category: cat.value }));
    setCategoryInput(cat.label);
    setShowCategoryDropdown(false);
    setHasUnsavedChanges(true);
  };

  // Handle new category creation
  const handleCreateCategory = () => {
    if (!categoryInput.trim()) return;
    const newCat = {
      value: categoryInput.trim().toLowerCase().replace(/\s+/g, "-"),
      label: categoryInput.trim(),
    };
    setCategories((prev) => [...prev, newCat]);
    setFormData((prev) => ({ ...prev, category: newCat.value }));
    setShowCategoryDropdown(false);
    setHasUnsavedChanges(true);
  };

  // Keep input in sync with selected category
  useEffect(() => {
    const selected = categories.find((c) => c.value === formData.category);
    setCategoryInput(selected ? selected.label : formData.category);
  }, [formData.category, categories]);

  if (success) {
    const isEditing = searchParams.get("edit");
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Product {isEditing ? "Updated" : "Created"} Successfully!
          </h1>
          <p className="text-gray-600 mb-6">Redirecting to products page...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#b91c1c] mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="sm:bg-white rounded-lg sm:shadow-md sm:p-6 p-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-8">
                {/* Basic Information */}
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b91c1c] focus:border-transparent"
                        placeholder="Enter product name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <div className="relative">
                        <input
                          ref={categoryInputRef}
                          type="text"
                          required
                          value={categoryInput}
                          onChange={(e) => {
                            setCategoryInput(e.target.value);
                            setShowCategoryDropdown(true);
                          }}
                          onFocus={() => setShowCategoryDropdown(true)}
                          onBlur={() =>
                            setTimeout(
                              () => setShowCategoryDropdown(false),
                              150
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b91c1c] focus:border-transparent"
                          placeholder="Select or create category"
                        />
                        {showCategoryDropdown && (
                          <div className="absolute z-10 left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-48 overflow-auto">
                            {filteredCategories.length > 0 ? (
                              filteredCategories.map((cat) => (
                                <div
                                  key={cat.value}
                                  className={`px-4 py-2 cursor-pointer text-gray-700 hover:bg-gray-100 ${
                                    formData.category === cat.value
                                      ? "bg-gray-100"
                                      : ""
                                  }`}
                                  onMouseDown={() => handleCategorySelect(cat)}
                                >
                                  {cat.label}
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-2 text-gray-500">
                                No categories found
                              </div>
                            )}
                            {categoryInput.trim() &&
                              !categories.some(
                                (c) =>
                                  c.label.toLowerCase() ===
                                  categoryInput.trim().toLowerCase()
                              ) && (
                                <div
                                  className="px-4 py-2 cursor-pointer text-[#b91c1c] hover:bg-gray-50 border-t border-gray-100"
                                  onMouseDown={handleCreateCategory}
                                >
                                  + Create "{categoryInput.trim()}"
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.brand}
                        onChange={(e) =>
                          handleInputChange("brand", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b91c1c] focus:border-transparent"
                        placeholder="Enter brand name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.stock}
                        onChange={(e) =>
                          handleInputChange(
                            "stock",
                            parseInt(e.target.value) || 0
                          )
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            (e.target as HTMLInputElement).select();
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b91c1c] focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <div className="border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-[#b91c1c] focus-within:border-transparent">
                    <ReactQuill
                      theme="snow"
                      value={formData.description}
                      onChange={(value) =>
                        handleInputChange("description", value)
                      }
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Enter detailed product description..."
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Use the toolbar above to format your description with
                    headings, lists, links, and more.
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Images */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Product Images
                  </h2>

                  <div className="space-y-4">
                    {/* Upload Button */}
                    <div className="space-y-2">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) =>
                          e.target.files && handleImageUpload(e.target.files)
                        }
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => categoryInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-[#b91c1c] hover:text-[#b91c1c] transition-colors disabled:opacity-50"
                      >
                        {uploading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <ImageIcon className="w-5 h-5" />
                        )}
                        {uploading ? "Uploading..." : "Upload Images"}
                      </button>
                      <p className="text-xs text-gray-500 text-center">
                        Maximum 5 images, 5MB each. Supported formats: JPG, PNG,
                        WebP
                      </p>
                    </div>

                    {/* Image Preview */}
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                              <Image
                                src={image}
                                alt={`Product image ${index + 1}`}
                                width={200}
                                height={200}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleImageRemove(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) =>
                          handleInputChange(
                            "price",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b91c1c] focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Original Price (₹) - Optional
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.originalPrice || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "originalPrice",
                            e.target.value
                              ? parseFloat(e.target.value)
                              : undefined
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b91c1c] focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Specifications
                  </h2>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={newSpecKey}
                        onChange={(e) => setNewSpecKey(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b91c1c] focus:border-transparent"
                        placeholder="Specification name"
                      />
                      <input
                        type="text"
                        value={newSpecValue}
                        onChange={(e) => setNewSpecValue(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b91c1c] focus:border-transparent"
                        placeholder="Specification value"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSpecificationAdd}
                      className="flex items-center gap-2 text-[#b91c1c] hover:text-[#a31b1b] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Specification
                    </button>

                    {Object.keys(formData.specifications).length > 0 && (
                      <div className="space-y-2">
                        {Object.entries(formData.specifications).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                            >
                              <div>
                                <span className="font-medium">{key}:</span>
                                <span className="ml-2 text-gray-600">
                                  {value}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleSpecificationRemove(key)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Status */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Product Status
                  </h2>

                  <div className="space-y-4">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) =>
                          handleInputChange("isActive", e.target.checked)
                        }
                        className="w-4 h-4 text-[#b91c1c] border-gray-300 rounded focus:ring-[#b91c1c]"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Active Product
                      </span>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) =>
                          handleInputChange("isFeatured", e.target.checked)
                        }
                        className="w-4 h-4 text-[#b91c1c] border-gray-300 rounded focus:ring-[#b91c1c]"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Featured Product
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#b91c1c] text-white py-3 px-6 rounded-md font-medium hover:bg-[#a31b1b] transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {loading ? "Creating Product..." : "Create Product"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AddProductPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddProductPageInner />
    </Suspense>
  );
}
