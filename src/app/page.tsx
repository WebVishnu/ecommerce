"use client";
import { useState, useEffect } from "react";
import { Product, productAPI } from "@/lib/api";
import ProductGrid from "@/components/ProductGrid";
import Hero from "@/components/Hero";
import CategoriesSection from "@/components/CategoriesSection";
import LocationSection from "@/components/LocationSection";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await productAPI.getAll({
          page: 1,
          limit: 8,
          sortBy: 'isFeatured',
          sortOrder: 'desc'
        });
        setFeaturedProducts(response.data.products);
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="bg-[#fff8f0]">
      <div className="min-h-screen max-w-7xl mx-auto flex flex-col md:px-6 px-2 lg:px-16">
        <Hero />
        <CategoriesSection />
        <ProductGrid 
          products={featuredProducts} 
          loading={loading}
          className="mt-12" 
        />
        <LocationSection />
      </div>
    </div>
  );
}
