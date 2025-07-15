"use client";

import { useState } from "react";
import { Product } from "@/lib/api";
import {
  ShoppingCart,
  Star,
  Check,
  Loader2,
  Shield,
  Battery,
  Zap,
  ArrowRight,
  Edit,
  Eye,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DOMPurify from "dompurify";

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onToggleStatus?: (product: Product) => void;
  onToggleFeatured?: (product: Product) => void;
  showAdminActions?: boolean;
  listView?: boolean;
}

export default function ProductCard({
  product,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleFeatured,
  showAdminActions = false,
  listView = false,
}: ProductCardProps) {
  const { addToCart, loading, cart, updateCartItem, removeFromCart } =
    useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [addedToCart, setAddedToCart] = useState(false);

  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.originalPrice! - product.price) / product.originalPrice!) *
          100
      )
    : 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push("/auth/otp");
      return;
    }
    try {
      await addToCart(product, 1);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  const handleGoToCart = () => {
    router.push(
      `/checkout/buy-now?productId=${product._id}&quantity=${cartQuantity}`
    );
  };

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

  // Find if product is in cart
  const cartItem = cart?.items?.find(
    (item) => item.product && item.product._id === product._id
  );
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  // Helper function to get specification value
  const getSpecValue = (key: string): string => {
    if (product.specifications && typeof product.specifications === "object") {
      return product.specifications[key] || "";
    }
    return "";
  };

  // Get key specifications for display
  const capacity = getSpecValue("Capacity") || getSpecValue("capacity");
  const voltage = getSpecValue("Voltage") || getSpecValue("voltage");
  const warranty = getSpecValue("Warranty") || getSpecValue("warranty");

  // Clean HTML description for display
  const cleanDescription = product.description
    ? DOMPurify.sanitize(product.description, { ALLOWED_TAGS: [] })
    : "";

  if (listView) {
    // Render horizontal/list style card
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-row group overflow-hidden">
        {/* Image */}
        <div
          onClick={() =>
            router.push(
              showAdminActions
                ? `/admin/products/${product._id}`
                : `/products/${product._id}`
            )
          }
          className="relative cursor-pointer w-40 min-w-[10rem] aspect-[4/3] bg-gray-50 flex items-center justify-center"
        >
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-contain object-center group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority={false}
            />
          ) : (
            <Battery className="w-16 h-16 text-gray-300" />
          )}
        </div>
        {/* Details */}
        <div className="flex-1 flex flex-col px-4 py-3 gap-2">
          {/* Name & Brand */}
          <Link
            href={
              showAdminActions
                ? `/admin/products/${product._id}`
                : `/products/${product._id}`
            }
            className="hover:underline"
          >
            <div className="font-semibold text-gray-900 text-base line-clamp-2 leading-tight mb-1">
              {product.name}
            </div>
          </Link>
          <div className="text-xs text-gray-500 mb-1">by {product.brand}</div>
          {/* Short Description */}
          {cleanDescription && (
            <div className="text-xs text-gray-700 line-clamp-2 mb-1">
              {cleanDescription.length > 100
                ? `${cleanDescription.substring(0, 100)}...`
                : cleanDescription}
            </div>
          )}
          {/* Price & Discount */}
          <div className="flex items-end gap-2 mb-1">
            <span className="text-lg font-bold text-[#b91c1c]">
              ₹{product.price.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-500 line-through">
                ₹{product.originalPrice!.toLocaleString()}
              </span>
            )}
            {hasDiscount && (
              <span className="text-xs text-green-600 font-semibold">
                Save {discountPercentage}%
              </span>
            )}
          </div>
          {/* Key Specs Row */}
          {(capacity || voltage || warranty) && (
            <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-1">
              {capacity && (
                <span className="flex items-center gap-1">
                  <Battery className="w-3 h-3" />
                  {capacity}
                </span>
              )}
              {voltage && (
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {voltage}
                </span>
              )}
              {warranty && (
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {warranty}
                </span>
              )}
            </div>
          )}
          {/* Stock Status */}
          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${stockStatus.bg} ${stockStatus.color} text-xs font-medium w-fit mb-1`}
          >
            {stockStatus.text}
          </div>
          {/* Admin-specific Information */}
          {showAdminActions && (
            <div className="space-y-1 mb-2">
              <div className="text-xs text-gray-500">
                <span className="font-medium">ID:</span> {product._id.slice(-8)}
              </div>
              <div className="text-xs text-gray-500">
                <span className="font-medium">Category:</span>{" "}
                {product.category}
              </div>
              <div className="text-xs text-gray-500">
                <span className="font-medium">Created:</span>{" "}
                {new Date(product.createdAt).toLocaleDateString()}
              </div>
            </div>
          )}
          {/* Admin Actions or Cart Actions (reuse existing logic) */}
          <div className="mt-auto">
            {showAdminActions ? (
              <div className="space-y-2">
                {/* Quick Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit?.(product)}
                    className="flex-1 flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md font-medium transition-colors text-xs"
                    aria-label="Edit product"
                  >
                    <Edit className="w-3 h-3" />
                    <span className="hidden sm:block text-white">Edit</span>
                  </button>
                  <button
                    onClick={() => onToggleStatus?.(product)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-md font-medium transition-colors text-xs ${
                      product.isActive
                        ? "bg-orange-600 hover:bg-orange-700 text-white"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                    aria-label={
                      product.isActive
                        ? "Deactivate product"
                        : "Activate product"
                    }
                  >
                    {product.isActive ? (
                      <>
                        <Eye className="w-3 h-3" />
                        <span className="hidden sm:block text-white">Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" />
                        <span className="hidden sm:block text-white">Show</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => onToggleFeatured?.(product)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-md font-medium transition-colors text-xs ${
                      product.isFeatured
                        ? "bg-gray-600 hover:bg-gray-700 text-white"
                        : "bg-yellow-600 hover:bg-yellow-700 text-white"
                    }`}
                    aria-label={
                      product.isFeatured
                        ? "Remove from featured"
                        : "Mark as featured"
                    }
                  >
                    <Star className="w-3 h-3" />
                    <span className="hidden sm:block text-white">
                      {product.isFeatured ? "Unfeature" : "Feature"}
                    </span>
                  </button>
                </div>
                {/* Delete Button */}
                <button
                  onClick={() => onDelete?.(product)}
                  className="w-full flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md font-medium transition-colors text-xs"
                  aria-label="Delete product"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            ) : // Cart actions (reuse existing logic)
            cartQuantity > 0 && cartItem && cartItem.product ? (
              <div className="flex sm:flex-row flex-col sm:space-x-2 sm:space-y-0 space-y-2">
                {/* Quantity Counter */}
                <div className="w-full flex items-center justify-between gap-2 bg-gray-50 border border-gray-200 rounded-md px-2 py-1">
                  <button
                    onClick={() => {
                      if (cartQuantity === 1) {
                        removeFromCart(cartItem._id);
                      } else {
                        updateCartItem(cartItem._id, cartQuantity - 1);
                      }
                    }}
                    className="px-2 py-1 text-lg font-bold text-[#b91c1c] disabled:text-gray-300 hover:bg-gray-100 rounded transition-colors"
                    disabled={loading}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="font-semibold text-gray-900 text-base">
                    {cartQuantity}
                  </span>
                  <button
                    onClick={() =>
                      updateCartItem(cartItem._id, cartQuantity + 1)
                    }
                    className="px-2 py-1 text-lg font-bold text-[#b91c1c] disabled:text-gray-300 hover:bg-gray-100 rounded transition-colors"
                    disabled={loading || cartQuantity >= product.stock}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                {/* Go to Cart Button */}
                <button
                  onClick={handleGoToCart}
                  className="sm:w-fit px-4 flex  items-center justify-center gap-2 py-2 h-full bg-[#b91c1c] hover:bg-[#a31b1b] text-white rounded-md font-medium transition-all duration-200 text-sm shadow-sm hover:shadow-md"
                  aria-label="Go to cart"
                >
                  Buy
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || loading}
                className={cn(
                  "mt-auto w-full flex items-center justify-center gap-2 py-2 rounded-md font-medium transition-all duration-200 text-white text-sm",
                  product.stock > 0 && !loading
                    ? addedToCart
                      ? "bg-green-600 hover:bg-green-700 shadow-sm"
                      : "bg-[#b91c1c] hover:bg-[#a31b1b] shadow-sm hover:shadow-md"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                )}
                aria-label={product.stock > 0 ? "Add to cart" : "Out of stock"}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : addedToCart ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <ShoppingCart className="w-4 h-4" />
                )}
                {loading
                  ? "Adding..."
                  : addedToCart
                  ? "Added!"
                  : product.stock > 0
                  ? "Add to Cart"
                  : "Out of Stock"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default grid card rendering (existing code)
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col group overflow-hidden">
      {/* Image & Badge */}
      <div
        onClick={() =>
          router.push(
            showAdminActions
              ? `/admin/products/${product._id}`
              : `/products/${product._id}`
          )
        }
        className="relative cursor-pointer w-full aspect-[4/3] bg-gray-50 flex items-center justify-center"
      >
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className=" object-contain object-center group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority={false}
          />
        ) : (
          <Battery className="w-16 h-16 text-gray-300" />
        )}
        {/* Customer-facing Featured Badge */}
        {product.isFeatured && !showAdminActions && (
          <span className="absolute top-2 left-2 bg-yellow-400 text-xs font-bold text-white px-2 py-1 rounded shadow">
            Featured
          </span>
        )}
        {/* Discount Badge */}
        {hasDiscount && (
          <span
            className={`absolute top-2 ${
              showAdminActions ? "right-2" : "right-2"
            } bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow`}
          >
            -{discountPercentage}%
          </span>
        )}
      </div>
      {/* Details */}
      <div className="flex-1 flex flex-col px-3 py-3 gap-2">
        {/* Name & Brand */}
        <Link
          href={
            showAdminActions
              ? `/admin/products/${product._id}`
              : `/products/${product._id}`
          }
          className="hover:underline"
        >
          <div className="font-semibold text-gray-900 text-base line-clamp-2 leading-tight mb-1">
            {product.name}
          </div>
        </Link>
        <div className="text-xs text-gray-500 mb-1">by {product.brand}</div>
        {/* Short Description - Clean HTML */}
        {cleanDescription && (
          <div className="text-xs text-gray-700 line-clamp-2 mb-1">
            {cleanDescription.length > 100
              ? `${cleanDescription.substring(0, 100)}...`
              : cleanDescription}
          </div>
        )}
        {/* Rating & Reviews */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-1">
            <span className="text-yellow-500 flex items-center">
              <Star className="w-4 h-4 fill-yellow-400" />
            </span>
            <span className="text-sm font-medium text-gray-800">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500">({product.reviews})</span>
          </div>
        )}
        {/* Price & Discount */}
        <div className="flex items-end gap-2 mb-1">
          <span className="text-lg font-bold text-[#b91c1c]">
            ₹{product.price.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-500 line-through">
              ₹{product.originalPrice!.toLocaleString()}
            </span>
          )}
          {hasDiscount && (
            <span className="text-xs text-green-600 font-semibold">
              Save {discountPercentage}%
            </span>
          )}
        </div>
        {/* Key Specs Row - Only show if specifications exist */}
        {(capacity || voltage || warranty) && (
          <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-1">
            {capacity && (
              <span className="flex items-center gap-1">
                <Battery className="w-3 h-3" />
                {capacity}
              </span>
            )}
            {voltage && (
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {voltage}
              </span>
            )}
            {warranty && (
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {warranty}
              </span>
            )}
          </div>
        )}
        {/* Stock Status */}
        <div
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${stockStatus.bg} ${stockStatus.color} text-xs font-medium w-fit mb-1`}
        >
          {stockStatus.text}
        </div>
        {/* Admin-specific Information */}
        {showAdminActions && (
          <div className="space-y-1 mb-2">
            <div className="text-xs text-gray-500">
              <span className="font-medium">ID:</span> {product._id.slice(-8)}
            </div>
            <div className="text-xs text-gray-500">
              <span className="font-medium">Category:</span> {product.category}
            </div>
            <div className="text-xs text-gray-500">
              <span className="font-medium">Created:</span>{" "}
              {new Date(product.createdAt).toLocaleDateString()}
            </div>
          </div>
        )}
        {/* Admin Actions */}
        {showAdminActions ? (
          <div className="mt-auto space-y-2">
            {/* Quick Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => onEdit?.(product)}
                className="flex-1 flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md font-medium transition-colors text-xs"
                aria-label="Edit product"
              >
                <Edit className="w-3 h-3" />
                <span className="hidden sm:block text-white">Edit</span>
              </button>
              <button
                onClick={() => onToggleStatus?.(product)}
                className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-md font-medium transition-colors text-xs ${
                  product.isActive
                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
                aria-label={
                  product.isActive ? "Deactivate product" : "Activate product"
                }
              >
                {product.isActive ? (
                  <>
                    <Eye className="w-3 h-3" />
                    <span className="hidden sm:block text-white">Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" />
                    <span className="hidden sm:block text-white">Show</span>
                  </>
                )}
              </button>
              <button
                onClick={() => onToggleFeatured?.(product)}
                className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-md font-medium transition-colors text-xs ${
                  product.isFeatured
                    ? "bg-gray-600 hover:bg-gray-700 text-white"
                    : "bg-yellow-600 hover:bg-yellow-700 text-white"
                }`}
                aria-label={
                  product.isFeatured
                    ? "Remove from featured"
                    : "Mark as featured"
                }
              >
                <Star className="w-3 h-3" />
                <span className="hidden sm:block text-white">
                  {product.isFeatured ? "Unfeature" : "Feature"}
                </span>
              </button>
            </div>
            {/* Delete Button */}
            <button
              onClick={() => onDelete?.(product)}
              className="w-full flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md font-medium transition-colors text-xs"
              aria-label="Delete product"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          </div>
        ) : /* Cart Actions */
        cartQuantity > 0 && cartItem && cartItem.product ? (
          <div className="mt-auto flex sm:flex-row flex-col sm:space-x-2 sm:space-y-0 space-y-2">
            {/* Quantity Counter */}
            <div className="w-full flex items-center justify-between gap-2 bg-gray-50 border border-gray-200 rounded-md px-2 py-1">
              <button
                onClick={() => {
                  if (cartQuantity === 1) {
                    removeFromCart(cartItem._id);
                  } else {
                    updateCartItem(cartItem._id, cartQuantity - 1);
                  }
                }}
                className="px-2 py-1 text-lg font-bold text-[#b91c1c] disabled:text-gray-300 hover:bg-gray-100 rounded transition-colors"
                disabled={loading}
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="font-semibold text-gray-900 text-base">
                {cartQuantity}
              </span>
              <button
                onClick={() => updateCartItem(cartItem._id, cartQuantity + 1)}
                className="px-2 py-1 text-lg font-bold text-[#b91c1c] disabled:text-gray-300 hover:bg-gray-100 rounded transition-colors"
                disabled={loading || cartQuantity >= product.stock}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            {/* Go to Cart Button */}
            <button
              onClick={handleGoToCart}
              className="sm:w-fit px-4 flex  items-center justify-center gap-2 py-2 h-full bg-[#b91c1c] hover:bg-[#a31b1b] text-white rounded-md font-medium transition-all duration-200 text-sm shadow-sm hover:shadow-md"
              aria-label="Go to cart"
            >
              Buy
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || loading}
            className={cn(
              "mt-auto w-full flex items-center justify-center gap-2 py-2 rounded-md font-medium transition-all duration-200 text-white text-sm",
              product.stock > 0 && !loading
                ? addedToCart
                  ? "bg-green-600 hover:bg-green-700 shadow-sm"
                  : "bg-[#b91c1c] hover:bg-[#a31b1b] shadow-sm hover:shadow-md"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            )}
            aria-label={product.stock > 0 ? "Add to cart" : "Out of stock"}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : addedToCart ? (
              <Check className="w-4 h-4" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
            {loading
              ? "Adding..."
              : addedToCart
              ? "Added!"
              : product.stock > 0
              ? "Add to Cart"
              : "Out of Stock"}
          </button>
        )}
      </div>
    </div>
  );
}
