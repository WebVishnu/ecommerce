"use client";
import Image from "next/image";
import Link from "next/link";
import { Zap, Sun, ArrowRight } from "lucide-react";

export default function CategoriesSection() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="uppercase text-xs tracking-widest text-[#b91c1c] mb-2 font-semibold">
            Our Solutions
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
            Complete Battery Solutions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Professional battery solutions for homes, businesses, and vehicles.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Power Solutions */}
          <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="relative h-64 overflow-hidden">
              <Image
                src="https://www.analog.com/en/_/media/project/analogweb/analogweb/solutions-overview/power-solutions-banner.jpg?rev=adac044977cf4a8481655e4a04a55a6d&sc_lang=en&la=en&h=908&w=2720&hash=E7EB0398D9C623A89C5D7515BBC29F0F"
                alt="Power Solutions"
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
              <div className="absolute top-4 left-4">
                <div className="bg-[#b91c1c] text-white p-3 rounded-lg">
                  <Zap className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Power Solutions
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Inverter, automotive, and UPS batteries from top brands like
                Exide, Amaron, and Luminous.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#b91c1c] rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    Inverter Batteries
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#b91c1c] rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    Automotive Batteries
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#b91c1c] rounded-full"></div>
                  <span className="text-sm text-gray-700">UPS Batteries</span>
                </div>
              </div>

              <Link
                href="/search?category=power"
                className="inline-flex items-center gap-2 text-[#b91c1c] font-semibold hover:text-[#a31b1b] transition-colors group/link"
              >
                Explore Power Solutions
                <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Solar Solutions */}
          <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="relative h-64 overflow-hidden">
              <Image
                src="https://gnpowersolutions.com/images/services/soler.jpg"
                alt="Solar Solutions"
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
              <div className="absolute top-4 left-4">
                <div className="bg-[#b91c1c] text-white p-3 rounded-lg">
                  <Sun className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Solar Solutions
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Solar batteries and complete solar power systems for sustainable
                energy solutions.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#b91c1c] rounded-full"></div>
                  <span className="text-sm text-gray-700">Solar Batteries</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#b91c1c] rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    Complete Solar Systems
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#b91c1c] rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    Installation & Maintenance
                  </span>
                </div>
              </div>

              <Link
                href="/search?category=solar"
                className="inline-flex items-center gap-2 text-[#b91c1c] font-semibold hover:text-[#a31b1b] transition-colors group/link"
              >
                Explore Solar Solutions
                <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
