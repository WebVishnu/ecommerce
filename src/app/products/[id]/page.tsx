"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import DOMPurify from "dompurify";
import {
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  Clock,
  Battery,
  Zap,
  ChevronLeft,
  ChevronRight,
  Star as StarIcon,
  X,
  Maximize2,
  Home,
  Search,
  AlertCircle,
  Award,
  Phone,
  Mail,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Product } from "@/lib/api";
import Link from "next/link";
import { getPrimaryColor } from "@/config/company-config";

// Loading Skeleton Component
const ProductSkeleton = () => (
  <div className="min-h-screen bg-gray-50 py-6 sm:py-12 animate-pulse">
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

// Breadcrumb Component
const Breadcrumb = ({ product }: { product: Product }) => (
  <nav aria-label="Breadcrumb" className="mb-6">
    <ol className="flex items-center space-x-2 text-sm text-gray-600 list-none">
      <li>
        <Link
          href="/"
          className="flex items-center gap-1 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 rounded"
          style={{
            color: getPrimaryColor()
          } as React.CSSProperties}
          aria-label="Go to home page"
        >
          <Home className="w-4 h-4" />
          Home
        </Link>
      </li>
      <li>
        <ChevronRight className="w-4 h-4" />
      </li>
      <li>
        <Link
          href="/search"
          className="transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 rounded"
          style={{
            color: getPrimaryColor()
          } as React.CSSProperties}
          aria-label="Browse all products"
        >
          Products
        </Link>
      </li>
      <li>
        <ChevronRight className="w-4 h-4" />
      </li>
      <li>
        <Link
          href={`/search?category=${product.category}`}
          className="transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 rounded capitalize"
          style={{
            color: getPrimaryColor()
          } as React.CSSProperties}
          aria-label={`Browse ${product.category} products`}
        >
          {product.category}
        </Link>
      </li>
      <li>
        <ChevronRight className="w-4 h-4" />
      </li>
      <li
        className="text-gray-900 font-medium truncate max-w-xs"
        aria-current="page"
      >
        {product.name}
      </li>
    </ol>
  </nav>
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

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      }
      if (e.key === "ArrowRight") {
        setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }
    },
    [onClose, images.length]
  );

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

// Share Modal Component
const ShareModal = ({
  isOpen,
  onClose,
  product,
}: {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}) => {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: "📱",
      action: () =>
        window.open(
          `https://wa.me/?text=Check out this product: ${product.name} - ${shareUrl}`
        ),
    },
    {
      name: "Copy Link",
      icon: "🔗",
      action: async () => {
        try {
          await navigator.clipboard.writeText(shareUrl);
          // You could add a toast notification here
        } catch {
          console.error("Failed to copy link");
        }
      },
    },
    {
      name: "Email",
      icon: "📧",
      action: () =>
        window.open(
          `mailto:?subject=Check out this product&body=Check out this product: ${product.name} - ${shareUrl}`
        ),
    },
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 id="share-modal-title" className="text-lg font-semibold">
            Share Product
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 rounded"
            style={{
              '--tw-ring-color': getPrimaryColor()
            } as React.CSSProperties}
            aria-label="Close share modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {shareOptions.map((option) => (
            <button
              key={option.name}
              onClick={() => {
                option.action();
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus:ring-2"
              style={{
                '--tw-ring-color': getPrimaryColor()
              } as React.CSSProperties}
            >
              <span className="text-2xl">{option.icon}</span>
              <span className="font-medium">{option.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, loading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  const quantityInputRef = useRef<HTMLInputElement>(null);
  const productId = params.id as string;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/products/${productId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setProduct(data.data);
        } else {
          setError(data.message || "Product not found");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push("/auth/otp");
      return;
    }

    if (!product) return;

    try {
      await addToCart(product, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch {
      // You could add error toast notification here
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      router.push("/auth/otp");
      return;
    }
    if (!product) return;
    // Redirect to the new Buy Now checkout page with productId and quantity
    router.push(`/checkout/buy-now?productId=${product._id}&quantity=${quantity}`);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  const handleQuantityInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= (product?.stock || 1)) {
      setQuantity(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddToCart();
    }
  };

  const hasDiscount =
    product?.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product!.originalPrice! - product.price) / product!.originalPrice!) *
          100
      )
    : 0;

  const getStockStatus = () => {
    if (!product)
      return { text: "Loading...", color: "text-gray-600", bg: "bg-gray-50" };
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
              href="/search"
              className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: getPrimaryColor(),
                '--hover-color': getPrimaryColor() + 'dd',
                '--tw-ring-color': getPrimaryColor()
              } as React.CSSProperties}
            >
              <Search className="w-4 h-4" />
              Browse Products
            </Link>
            <br />
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 rounded"
              style={{
                '--hover-color': getPrimaryColor(),
                '--tw-ring-color': getPrimaryColor()
              } as React.CSSProperties}
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb Navigation */}
          <Breadcrumb product={product} />

          <main role="main" aria-labelledby="product-title">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-12">
              {/* Product Images Section */}
              <section
                aria-label="Product images"
                className="space-y-4 lg:space-y-6 lg:sticky lg:top-6 lg:self-start lg:col-span-1 xl:col-span-1"
              >
                {/* Main Image */}
                <div className="relative">
                  <div
                    className={`relative aspect-square bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 group transition-all duration-200 cursor-pointer ${
                      zoomed ? "ring-2" : ""
                    }`}
                    style={zoomed ? {
                      '--tw-ring-color': getPrimaryColor()
                    } : {} as React.CSSProperties}
                    onMouseEnter={() => setZoomed(true)}
                    onMouseLeave={() => setZoomed(false)}
                    onClick={() =>
                      product.images &&
                      product.images.length > 0 &&
                      setImageModalOpen(true)
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" && setImageModalOpen(true)
                    }
                    tabIndex={0}
                    role="button"
                    aria-label="Click to view larger image"
                  >
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[selectedImage]}
                        alt={`${product.name} - Main product image`}
                        fill
                        className={`object-cover object-center transition-transform duration-200 ${
                          zoomed ? "scale-110" : "scale-100"
                        }`}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Battery className="w-20 h-20" />
                      </div>
                    )}

                    {/* Discount Badge */}
                    {hasDiscount && (
                      <div
                        className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-md shadow-sm"
                        aria-label={`${discountPercentage}% discount`}
                      >
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
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:text-white p-2 rounded-full shadow-md transition-all border border-gray-200 focus:outline-none focus:ring-2"
                          style={{
                            '--hover-color': getPrimaryColor(),
                            '--tw-ring-color': getPrimaryColor()
                          } as React.CSSProperties}
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
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:text-white p-2 rounded-full shadow-md transition-all border border-gray-200 focus:outline-none focus:ring-2"
                          style={{
                            '--hover-color': getPrimaryColor(),
                            '--tw-ring-color': getPrimaryColor()
                          } as React.CSSProperties}
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Thumbnail Images */}
                {product.images && product.images.length > 1 && (
                  <div
                    className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                    role="tablist"
                    aria-label="Product image thumbnails"
                  >
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all duration-150 focus:outline-none focus:ring-2 ${
                          selectedImage === index
                            ? "border-gray-200 ring-2"
                            : "border-gray-200"
                        }`}
                        style={selectedImage === index ? {
                          borderColor: getPrimaryColor(),
                          '--tw-ring-color': getPrimaryColor()
                        } : {
                          '--hover-color': getPrimaryColor(),
                          '--tw-ring-color': getPrimaryColor()
                        } as React.CSSProperties}
                        role="tab"
                        aria-selected={selectedImage === index}
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
                    ))}
                  </div>
                )}
              </section>

              {/* Product Information Section */}
              <section
                aria-label="Product information"
                className="space-y-6 lg:space-y-8 sm:bg-white rounded-xl sm:shadow-lg  sm:p-4 lg:p-6 xl:p-8 border border-gray-100"
              >
                {/* Brand and Category */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    {product.brand}
                  </span>
                  {product.isFeatured && (
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 rounded-full flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Featured
                    </span>
                  )}
                </div>

                {/* Product Name */}
                <h1
                  id="product-title"
                  className="md:text-xl !mt-2 text-xl font-bold text-gray-900 leading-tight"
                >
                  {product.name}
                </h1>

                {/* Rating */}
                {product.rating > 0 && (
                  <div className="flex items-center gap-2">
                    <div
                      className="flex items-center gap-1"
                      role="img"
                      aria-label={`${product.rating} out of 5 stars`}
                    >
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                          aria-hidden="true"
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
                    <span 
                      className="text-4xl font-bold"
                      style={{ color: getPrimaryColor() }}
                    >
                      ₹{product.price.toLocaleString()}
                    </span>
                    {hasDiscount && (
                      <span className="text-2xl text-gray-500 line-through">
                        ₹{product.originalPrice!.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {hasDiscount && (
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
                  role="status"
                  aria-live="polite"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      product.stock > 0 ? "bg-green-500" : "bg-red-500"
                    }`}
                    aria-hidden="true"
                  ></div>
                  <span className={`text-sm font-medium ${stockStatus.color}`}>
                    {stockStatus.text}
                  </span>
                  {product.stock > 0 && (
                    <span className="text-sm text-gray-600">
                      ({product.stock} available)
                    </span>
                  )}
                </div>

                {/* Quantity Selector */}
                <div className="space-y-2">
                  <label
                    htmlFor="quantity-input"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Quantity
                  </label>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        className="px-3 py-2 text-gray-600 hover:text-gray-900 disabled:text-gray-300 focus:outline-none focus:ring-2 rounded-l"
                        style={{
                          '--tw-ring-color': getPrimaryColor()
                        } as React.CSSProperties}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <input
                        ref={quantityInputRef}
                        id="quantity-input"
                        type="number"
                        min="1"
                        max={product.stock}
                        value={quantity}
                        onChange={handleQuantityInputChange}
                        onKeyDown={handleKeyDown}
                        className="w-16 px-2 py-2 border-x border-gray-300 font-medium text-center focus:outline-none focus:ring-2"
                        style={{
                          '--tw-ring-color': getPrimaryColor()
                        } as React.CSSProperties}
                        aria-label="Product quantity"
                      />
                      <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="px-3 py-2 text-gray-600 hover:text-gray-900 disabled:text-gray-300 focus:outline-none focus:ring-2 rounded-r"
                        style={{
                          '--tw-ring-color': getPrimaryColor()
                        } as React.CSSProperties}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.stock} available
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || cartLoading}
                    className="flex-1 flex items-center justify-center gap-2 border border-gray-300 hover:border-gray-400 text-gray-600 bg-white py-3 px-6 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{
                      '--tw-ring-color': getPrimaryColor()
                    } as React.CSSProperties}
                    aria-label="Add to Cart"
                  >
                    <ShoppingCart className="w-5 h-5" aria-hidden="true" />
                    {cartLoading
                      ? "Adding..."
                      : addedToCart
                      ? "Added!"
                      : product.stock > 0
                      ? "Add to Cart"
                      : "Out of Stock"}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className="flex-1 flex items-center justify-center gap-2 text-white py-3 px-6 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{
                      backgroundColor: getPrimaryColor(),
                      '--hover-color': getPrimaryColor() + 'dd',
                      '--tw-ring-color': getPrimaryColor()
                    } as React.CSSProperties}
                    aria-label="Buy Now"
                  >
                    <Zap className="w-5 h-5" aria-hidden="true" />
                    Buy Now
                  </button>
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`p-3 rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      isWishlisted
                        ? "border-red-300 bg-red-50 text-red-600"
                        : "border-gray-300 hover:border-gray-400 text-gray-600"
                    }`}
                    style={{
                      '--tw-ring-color': getPrimaryColor()
                    } as React.CSSProperties}
                    aria-label={
                      isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"
                    }
                    aria-pressed={isWishlisted}
                    title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                  >
                    <Heart
                      className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                  <button
                    onClick={() => setShareModalOpen(true)}
                    className="p-3 rounded-md border border-gray-300 hover:border-gray-400 text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{
                      '--tw-ring-color': getPrimaryColor()
                    } as React.CSSProperties}
                    aria-label="Share this product"
                    title="Share this product"
                  >
                    <Share2 className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>

                {/* Delivery Information */}
                <div className="space-y-3 p-4 bg-blue-50 rounded-lg mt-6">
                  <h3 className="font-medium text-blue-900 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Delivery Information
                  </h3>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      <span>Free delivery in ATRAULI</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Estimated delivery: 5-7 working days</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span>Genuine product with manufacturer warranty</span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Need Help?
                  </h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>Call us: +91 98765 43210</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>Email: support@shivangibattery.com</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Product Details Tabs */}
            <section
              className="mt-8 lg:mt-12 space-y-8"
              aria-label="Product details"
            >
              {/* Description Section */}
              <div className="sm:bg-white rounded-lg sm:shadow-md overflow-hidden p-4 sm:p-6 border border-gray-100">
                <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <span style={{ color: getPrimaryColor() }}>Description</span>
                </h2>
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed px-3">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(product.description),
                    }}
                  />
                </div>
              </div>

              {/* Specifications Section */}
              <div className="sm:bg-white rounded-lg sm:shadow-md overflow-hidden p-4 sm:p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span>Technical Specifications</span>
                </h2>
                {product.specifications &&
                Object.keys(product.specifications).length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 bg-gray-50 p-4 rounded-lg">
                    {Object.entries(product.specifications).map(function ([
                      key,
                      value,
                    ]) {
                      return (
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
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-gray-500 italic flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    No specifications provided.
                  </div>
                )}
              </div>

              {/* Reviews Section */}
              <div className="sm:bg-white rounded-lg sm:shadow-md overflow-hidden p-4 sm:p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span>Reviews</span>
                </h2>
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">⭐</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Reviews Coming Soon
                  </h3>
                  <p className="text-gray-500">
                    Customer reviews and ratings will be available soon.
                  </p>
                </div>
              </div>
            </section>
          </main>
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

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        product={product}
      />

      {/* Sticky Mobile Action Bar */}
      {product && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 flex justify-between items-center sm:hidden z-20 border-t border-gray-200">
          <span 
            className="font-bold text-lg"
            style={{ color: getPrimaryColor() }}
          >
            ₹{product.price.toLocaleString()}
          </span>
          <button
            onClick={handleBuyNow}
            disabled={product.stock === 0}
            className="bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
            aria-label="Buy Now"
          >
            Buy Now
          </button>
        </div>
      )}
    </>
  );
}
