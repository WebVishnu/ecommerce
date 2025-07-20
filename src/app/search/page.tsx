"use client";

import { Suspense } from "react";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  X,
  Battery,
  Sun,
  Car,
  Home,
  Building,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { Product, productAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

// Indian Battery Brands
const INDIAN_BATTERY_BRANDS = [
  { name: "Exide", logo: "https://www.exidecare.com/images/headerLogo.jpg" },
  {
    name: "Amaron",
    logo: "https://amaron-prod-images.s3.ap-south-1.amazonaws.com/s3fs-public/Amaron_Logo_0.jpg",
  },
  {
    name: "Luminous",
    logo: "https://lumprodsta.blob.core.windows.net/prodcontainer/assets/icons/LuminousLogoBlue.webp",
  },
  {
    name: "Livguard",
    logo: "https://www.livguard.com/static-assets/icons/logo-light.svg",
  },
  {
    name: "Okaya",
    logo: "https://i0.wp.com/okaya.com/wp-content/uploads/2018/05/okayalogo.png?fit=228%2C60&ssl=1",
  },
  { name: "Su-Kam", logo: "https://www.sukam.com/images/logo.png" },
  { name: "Microtek", logo: "https://www.microtekdirect.com/images/logo.png" },
  { name: "V-Guard", logo: "https://www.vguard.in/images/logo.png" },
  { name: "Havells", logo: "https://www.havells.com/images/logo.png" },
  { name: "Crompton", logo: "https://www.crompton.co.in/images/logo.png" },
  { name: "Usha", logo: "https://www.usha.com/images/logo.png" },
  {
    name: "Anchor",
    logo: "https://www.anchor-electricals.com/images/logo.png",
  },
];

// Categories
const CATEGORIES = [
  { name: "Inverter", icon: Home, color: "bg-blue-100 text-blue-600" },
  { name: "Automotive", icon: Car, color: "bg-green-100 text-green-600" },
  { name: "Solar", icon: Sun, color: "bg-yellow-100 text-yellow-600" },
  { name: "UPS", icon: Battery, color: "bg-purple-100 text-purple-600" },
  { name: "Industrial", icon: Building, color: "bg-gray-100 text-gray-600" },
];

function SearchPageInner() {
  const { isAdmin } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';

  // Debounced search state
  const [searchQuery, setSearchQuery] = useState(query);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(query);
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [selectedBrand, setSelectedBrand] = useState(brand);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    brands: true,
    price: true,
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Sync state with URL parameters when they change
  useEffect(() => {
    setSearchQuery(query);
    setDebouncedSearchQuery(query);
    setSelectedCategory(category);
    setSelectedBrand(brand);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [query, category, brand]);

  // Update URL when filters/search/pagination change
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchQuery) params.set('q', debouncedSearchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedBrand) params.set('brand', selectedBrand);
    if (priceRange.min) params.set('min', priceRange.min);
    if (priceRange.max) params.set('max', priceRange.max);
    if (pagination.page > 1) params.set('page', String(pagination.page));
    router.push(`/search?${params.toString()}`);
  }, [debouncedSearchQuery, selectedCategory, selectedBrand, priceRange.min, priceRange.max, pagination.page, router]);

  // Reset page to 1 when filters/search/price change
  const prevFilters = useRef({
    debouncedSearchQuery: debouncedSearchQuery,
    selectedCategory: selectedCategory,
    selectedBrand: selectedBrand,
    priceRange: { ...priceRange },
  });
  useEffect(() => {
    const prev = prevFilters.current;
    if (
      prev.debouncedSearchQuery !== debouncedSearchQuery ||
      prev.selectedCategory !== selectedCategory ||
      prev.selectedBrand !== selectedBrand ||
      prev.priceRange.min !== priceRange.min ||
      prev.priceRange.max !== priceRange.max
    ) {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
    prevFilters.current = {
      debouncedSearchQuery,
      selectedCategory,
      selectedBrand,
      priceRange: { ...priceRange },
    };
  }, [debouncedSearchQuery, selectedCategory, selectedBrand, priceRange.min, priceRange.max]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params: {
          page: number;
          limit: number;
          search?: string;
          category?: string;
          brand?: string;
          minPrice?: number;
          maxPrice?: number;
        } = {
          page: pagination.page,
          limit: 12,
        };

        if (debouncedSearchQuery) params.search = debouncedSearchQuery;
        if (selectedCategory) params.category = selectedCategory.toLowerCase();
        if (selectedBrand) params.brand = selectedBrand;
        if (priceRange.min) params.minPrice = parseInt(priceRange.min);
        if (priceRange.max) params.maxPrice = parseInt(priceRange.max);

        const response = await productAPI.getAll(params);
        setProducts(response.data.products);
        setPagination({
          page: response.data.pagination.page,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages,
          hasNextPage: response.data.pagination.hasNextPage,
          hasPrevPage: response.data.pagination.hasPrevPage,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [debouncedSearchQuery, selectedCategory, selectedBrand, priceRange, pagination.page]);

  const handleAddToCart = (product: Product) => {
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedBrand("");
    setPriceRange({ min: "", max: "" });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const FilterSidebar = () => (
    <div className="w-64 bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit">
      {/* Categories */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('categories')}
          className="flex items-center justify-between w-full text-left font-semibold text-gray-900 mb-3"
        >
          Categories
          {expandedSections.categories ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.categories && (
          <div className="space-y-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => {
                  setSelectedCategory(selectedCategory === cat.name ? '' : cat.name);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className={`flex items-center gap-2 w-full text-left p-2 rounded-md transition-colors ${
                  selectedCategory === cat.name
                    ? 'bg-[#b91c1c] text-white'
                    : 'hover:bg-gray-50'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                <span className="text-sm">{cat.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Brands */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('brands')}
          className="flex items-center justify-between w-full text-left font-semibold text-gray-900 mb-3"
        >
          Brands
          {expandedSections.brands ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.brands && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {INDIAN_BATTERY_BRANDS.map((brandItem) => (
              <button
                key={brandItem.name}
                onClick={() => {
                  setSelectedBrand(selectedBrand === brandItem.name ? '' : brandItem.name);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className={`flex items-center gap-2 w-full text-left p-2 rounded-md transition-colors ${
                  selectedBrand === brandItem.name
                    ? 'bg-[#b91c1c] text-white'
                    : 'hover:bg-gray-50'
                }`}
              >
                <span className="text-sm">{brandItem.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-left font-semibold text-gray-900 mb-3"
        >
          Price Range
          {expandedSections.price ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.price && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Min Price</label>
              <input
                type="number"
                placeholder="0"
                value={priceRange.min}
                onChange={(e) => {
                  setPriceRange(prev => ({ ...prev, min: e.target.value }));
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b91c1c]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Max Price</label>
              <input
                type="number"
                placeholder="50000"
                value={priceRange.max}
                onChange={(e) => {
                  setPriceRange(prev => ({ ...prev, max: e.target.value }));
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b91c1c]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Clear Filters */}
      <button
        onClick={clearFilters}
        className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
      >
        Clear All Filters
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar */}
      <div className={`sticky ${isAdmin?"top-10":"top-0"} z-30 bg-white border-b border-gray-200 shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
              <input
                type="text"
                placeholder="Search for batteries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b91c1c] focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <FilterSidebar />
          </div>

          {/* Mobile Filters */}
          {showMobileFilters && (
            <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50">
              <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Filters</h3>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="p-2 hover:bg-gray-100 rounded-md"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <FilterSidebar />
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {loading ? 'Loading...' : `${pagination.total} Products Found`}
                </h1>
                                 {(searchQuery || selectedCategory || selectedBrand) && (
                   <p className="text-gray-600">
                     Showing results for{' '}
                     {searchQuery && <span className="font-medium">&quot;{searchQuery}&quot;</span>}
                     {selectedCategory && <span className="font-medium"> {selectedCategory}</span>}
                     {selectedBrand && <span className="font-medium"> {selectedBrand}</span>}
                   </p>
                 )}
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <div className="text-red-500 text-lg mb-2">Error loading products</div>
                <p className="text-gray-600">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse h-64" />
                ))}
              </div>
            )}

            {/* Products Grid */}
            {!loading && !error && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={!pagination.hasPrevPage}
                      className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-gray-600">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={!pagination.hasNextPage}
                      className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}

            {/* No Results */}
            {!loading && !error && products.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">No products found</div>
                <p className="text-gray-400">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPageInner />
    </Suspense>
  );
}
