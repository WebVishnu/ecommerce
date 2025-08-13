"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ExternalLink, Star, Award, Zap } from "lucide-react";
import { getPrimaryColor } from "@/config/company-config";

// Indian Battery Brands with detailed information
const INDIAN_BATTERY_BRANDS = [
  {
    name: "Exide",
    logo: "https://www.exidecare.com/images/headerLogo.jpg",
    description:
      "India's leading battery manufacturer with over 75 years of excellence in automotive and industrial batteries.",
    founded: "1947",
    headquarters: "Kolkata, West Bengal",
    specialties: ["Automotive", "Inverter", "Industrial", "Solar"],
    rating: 4.8,
    products: 150,
    website: "https://www.exidecare.com",
  },
  {
    name: "Amaron",
    logo: "https://amaron-prod-images.s3.ap-south-1.amazonaws.com/s3fs-public/Amaron_Logo_0.jpg",
    description:
      "Premium battery brand known for long-lasting performance and innovative technology in automotive and inverter batteries.",
    founded: "1995",
    headquarters: "Chennai, Tamil Nadu",
    specialties: ["Automotive", "Inverter", "Two-Wheeler"],
    rating: 4.7,
    products: 120,
    website: "https://www.amaron.in",
  },
  {
    name: "Luminous",
    logo: "https://lumprodsta.blob.core.windows.net/prodcontainer/assets/icons/LuminousLogoBlue.webp",
    description:
      "Leading power solutions company specializing in inverter batteries, UPS systems, and solar solutions.",
    founded: "1988",
    headquarters: "Noida, Uttar Pradesh",
    specialties: ["Inverter", "UPS", "Solar", "Automotive"],
    rating: 4.6,
    products: 200,
    website: "https://www.luminousindia.com",
  },
  {
    name: "Livguard",
    logo: "https://www.livguard.com/static-assets/icons/logo-light.svg",
    description:
      "Innovative battery solutions provider with focus on smart technology and sustainable energy solutions.",
    founded: "2012",
    headquarters: "Gurgaon, Haryana",
    specialties: ["Inverter", "UPS", "Solar", "Automotive"],
    rating: 4.5,
    products: 80,
    website: "https://www.livguard.com",
  },
  {
    name: "Okaya",
    logo: "https://i0.wp.com/okaya.com/wp-content/uploads/2018/05/okayalogo.png?fit=228%2C60&ssl=1",
    description:
      "Established battery manufacturer with comprehensive range of automotive, inverter, and industrial batteries.",
    founded: "1987",
    headquarters: "New Delhi",
    specialties: ["Automotive", "Inverter", "Industrial", "Solar"],
    rating: 4.4,
    products: 100,
    website: "https://www.okaya.com",
  },
  {
    name: "Su-Kam",
    logo: "https://www.sukam.com/images/logo.png",
    description:
      "Pioneer in power backup solutions with innovative inverter and UPS battery technology.",
    founded: "1998",
    headquarters: "Gurgaon, Haryana",
    specialties: ["Inverter", "UPS", "Solar"],
    rating: 4.3,
    products: 90,
    website: "https://www.sukam.com",
  },
  {
    name: "Microtek",
    logo: "https://www.microtekdirect.com/images/logo.png",
    description:
      "Trusted name in power backup solutions with reliable inverter and UPS battery systems.",
    founded: "1991",
    headquarters: "New Delhi",
    specialties: ["Inverter", "UPS", "Solar"],
    rating: 4.2,
    products: 70,
    website: "https://www.microtekdirect.com",
  },
  {
    name: "V-Guard",
    logo: "https://www.vguard.in/images/logo.png",
    description:
      "Leading electrical equipment manufacturer with quality inverter and UPS battery solutions.",
    founded: "1977",
    headquarters: "Kochi, Kerala",
    specialties: ["Inverter", "UPS", "Stabilizers"],
    rating: 4.1,
    products: 60,
    website: "https://www.vguard.in",
  },
  {
    name: "Havells",
    logo: "https://www.havells.com/images/logo.png",
    description:
      "Multinational electrical equipment company with comprehensive battery and power solutions.",
    founded: "1958",
    headquarters: "Noida, Uttar Pradesh",
    specialties: ["Inverter", "UPS", "Industrial"],
    rating: 4.0,
    products: 50,
    website: "https://www.havells.com",
  },
  {
    name: "Crompton",
    logo: "https://www.crompton.co.in/images/logo.png",
    description:
      "Established electrical company with reliable inverter and power backup solutions.",
    founded: "1878",
    headquarters: "Mumbai, Maharashtra",
    specialties: ["Inverter", "UPS", "Fans"],
    rating: 4.0,
    products: 40,
    website: "https://www.crompton.co.in",
  },
  {
    name: "Usha",
    logo: "https://www.usha.com/images/logo.png",
    description:
      "Trusted household brand with quality inverter and power backup solutions.",
    founded: "1934",
    headquarters: "New Delhi",
    specialties: ["Inverter", "UPS", "Appliances"],
    rating: 3.9,
    products: 30,
    website: "https://www.usha.com",
  },
  {
    name: "Anchor",
    logo: "https://www.anchor-electricals.com/images/logo.png",
    description:
      "Reliable electrical solutions provider with inverter and power backup systems.",
    founded: "1963",
    headquarters: "Mumbai, Maharashtra",
    specialties: ["Inverter", "UPS", "Switches"],
    rating: 3.8,
    products: 25,
    website: "https://www.anchor-electricals.com",
  },
];

export default function BrandsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");

  // Get unique specialties for filtering
  const allSpecialties = Array.from(
    new Set(INDIAN_BATTERY_BRANDS.flatMap((brand) => brand.specialties))
  ).sort();

  // Filter brands based on search and specialty
  const filteredBrands = INDIAN_BATTERY_BRANDS.filter((brand) => {
    const matchesSearch =
      brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty =
      !selectedSpecialty || brand.specialties.includes(selectedSpecialty);
    return matchesSearch && matchesSpecialty;
  });

  const handleBrandClick = (brandName: string) => {
    router.push(`/search?brand=${encodeURIComponent(brandName)}`);
  };

  const handleSpecialtyClick = (specialty: string) => {
    router.push(`/search?category=${encodeURIComponent(specialty)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{
                  '--tw-ring-color': getPrimaryColor(),
                  '--tw-ring-opacity': '0.5'
                } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Quick Specialty Links */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 mr-2">Quick filters:</span>
            {allSpecialties.map((specialty) => (
              <button
                key={specialty}
                onClick={() => handleSpecialtyClick(specialty)}
                className="px-3 py-1 text-sm text-white rounded-full transition-colors"
                style={{
                  backgroundColor: getPrimaryColor(),
                  '--hover-color': getPrimaryColor() + 'dd'
                } as React.CSSProperties}
              >
                {specialty}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredBrands.length} of {INDIAN_BATTERY_BRANDS.length}{" "}
            brands
          </p>
        </div>

        {/* Brands Grid */}
        {filteredBrands.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBrands.map((brand) => (
              <div
                key={brand.name}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden group cursor-pointer"
                onClick={() => handleBrandClick(brand.name)}
              >
                {/* Brand Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-16 w-32 relative bg-gray-50 rounded-lg flex items-center justify-center">
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900">
                        {brand.rating}
                      </span>
                    </div>
                  </div>

                  <h3 
                    className="text-xl font-bold text-gray-900 mb-2 transition-colors"
                    style={{
                      '--hover-color': getPrimaryColor()
                    } as React.CSSProperties}
                  >
                    {brand.name}
                  </h3>

                  <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                    {brand.description}
                  </p>

                  {/* Brand Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Est. {brand.founded}</span>
                    <span>•</span>
                    <span>{brand.products}+ Products</span>
                  </div>
                </div>

                {/* Brand Details */}
                <div className="p-6">
                  {/* Specialties */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Specialties
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {brand.specialties.map((specialty) => (
                        <span
                          key={specialty}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      Headquarters
                    </h4>
                    <p className="text-sm text-gray-600">
                      {brand.headquarters}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBrandClick(brand.name);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium"
                      style={{
                        backgroundColor: getPrimaryColor(),
                        '--hover-color': getPrimaryColor() + 'dd'
                      } as React.CSSProperties}
                    >
                      <Zap className="w-4 h-4" />
                      View Products
                    </button>
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No brands found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria to find what you&apos;re
              looking for.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedSpecialty("");
              }}
              className="px-6 py-2 text-white rounded-lg transition-colors"
              style={{
                backgroundColor: getPrimaryColor(),
                '--hover-color': getPrimaryColor() + 'dd'
              } as React.CSSProperties}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
