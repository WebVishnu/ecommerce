"use client";

import { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Award,
  Shield,
  Users,
  Star,
  CheckCircle,
  Truck,
  Headphones,
  Battery,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState("story");

  const stats = [
    { icon: Users, label: "Happy Customers", value: "5000+" },
    { icon: Battery, label: "Products Sold", value: "15000+" },
    { icon: Star, label: "Years Experience", value: "15+" },
    { icon: Award, label: "Brands Partnered", value: "25+" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative text-white"
        style={{
          backgroundImage: 'url("/award.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 lg:py-24">
          <div className="text-center">
            <h1
              className="text-4xl lg:text-6xl font-bold mb-6 drop-shadow-lg"
              style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)" }}
            >
              About Shivangi Battery
            </h1>
            <p
              className="text-xl lg:text-2xl mb-8 max-w-4xl mx-auto drop-shadow-lg"
              style={{ textShadow: "1px 1px 3px rgba(0, 0, 0, 0.8)" }}
            >
              Your trusted partner for all battery solutions in Atrauli,
              Aligarh. Serving the community with quality products and
              exceptional service since 2008.
            </p>
            <div className="flex flex-wrap justify-center gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <stat.icon className="w-8 h-8 mx-auto mb-2 drop-shadow-lg" />
                  <div
                    className="text-2xl font-bold drop-shadow-lg"
                    style={{ textShadow: "1px 1px 3px rgba(0, 0, 0, 0.8)" }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="text-sm opacity-90 drop-shadow-lg"
                    style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 0.8)" }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center mb-12">
          {[
            { id: "story", label: "Our Story" },
            { id: "contact", label: "Contact" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 mx-2 mb-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-[#b91c1c] text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Our Story */}
          {activeTab === "story" && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Our Story
                </h2>
                <div className="w-24 h-1 bg-[#b91c1c] mx-auto"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    From Humble Beginnings to Trusted Name
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Founded in 2008, Shivangi Battery started as a small family
                    business in Atrauli, Aligarh. What began with a simple
                    mission to provide reliable battery solutions has grown into
                    one of the most trusted names in the region.
                  </p>
                  <p className="text-gray-600 mb-4">
                    Over the past 15+ years, we&apos;ve built strong
                    relationships with leading battery manufacturers and served
                    thousands of satisfied customers across Uttar Pradesh. Our
                    commitment to quality, technical expertise, and customer
                    service has been the cornerstone of our success.
                  </p>
                  <p className="text-gray-600">
                    Today, we&apos;re proud to offer a comprehensive range of
                    automotive, inverter, UPS, and industrial batteries from
                    India&apos;s top brands, backed by our expert team and
                    reliable service.
                  </p>
                </div>
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <TrendingUp className="w-16 h-16 text-[#b91c1c] mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    Our Growth Journey
                  </h4>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-[#b91c1c] rounded-full mr-3"></div>
                      <span className="text-gray-700">
                        2008: Started as small battery shop
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-[#b91c1c] rounded-full mr-3"></div>
                      <span className="text-gray-700">
                        2012: Expanded to multiple brands
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-[#b91c1c] rounded-full mr-3"></div>
                      <span className="text-gray-700">
                        2018: Added technical services
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-[#b91c1c] rounded-full mr-3"></div>
                      <span className="text-gray-700">
                        2023: Leading battery solutions provider
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact */}
          {activeTab === "contact" && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Contact Information
                </h2>
                <div className="w-24 h-1 bg-[#b91c1c] mx-auto"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <MapPin className="w-6 h-6 text-[#b91c1c] mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Address
                      </h3>
                      <p className="text-gray-600">
                        Ramghat Road Atrauli Aligarh U P<br />
                        Atrauli Aligarh, Uttar Pradesh 202280
                      </p>
                      <a
                        href="https://maps.google.com/?q=Ramghat+Road+Atrauli+Aligarh+UP"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#b91c1c] hover:underline text-sm"
                      >
                        View on Google Maps →
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Phone className="w-6 h-6 text-[#b91c1c] mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Phone
                      </h3>
                      <a
                        href="tel:+919876543210"
                        className="text-gray-600 hover:text-[#b91c1c]"
                      >
                        +91 98765 43210
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Mail className="w-6 h-6 text-[#b91c1c] mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Email
                      </h3>
                      <a
                        href="mailto:info@shivangibattery.com"
                        className="text-gray-600 hover:text-[#b91c1c]"
                      >
                        info@shivangibattery.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Clock className="w-6 h-6 text-[#b91c1c] mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Business Hours
                      </h3>
                      <p className="text-gray-600">
                        Monday - Saturday: 9:00 AM - 8:00 PM
                        <br />
                        Sunday: 10:00 AM - 6:00 PM
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Get in Touch
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Have questions about our products or services? We&apos;re
                    here to help! Contact us for expert advice and personalized
                    solutions.
                  </p>

                  <div className="space-y-4">
                    <a
                      href="https://wa.me/919876543210"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-full px-6 py-3 bg-[#25D366] text-white rounded-lg hover:bg-[#20ba5a] transition-colors"
                    >
                      <span>Chat on WhatsApp</span>
                    </a>

                    <Link
                      href="/search"
                      className="flex items-center justify-center w-full px-6 py-3 bg-[#b91c1c] text-white rounded-lg hover:bg-[#a31b1b] transition-colors"
                    >
                      Browse Products
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
