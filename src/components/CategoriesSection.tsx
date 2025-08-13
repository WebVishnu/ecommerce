"use client";
import Image from "next/image";
import Link from "next/link";
import { Zap, Sun, ArrowRight, Car, Shield } from "lucide-react";
import { config, getPrimaryColor } from "@/config/company-config";

const iconMap = {
  car: Car,
  zap: Zap,
  shield: Shield,
  sun: Sun,
};

export default function CategoriesSection() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div 
            className="uppercase text-xs tracking-widest mb-2 font-semibold"
            style={{ color: getPrimaryColor() }}
          >
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
          {config.categories.slice(0, 2).map((category, index) => {
            const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Zap;
            const images = [
              "https://www.analog.com/en/_/media/project/analogweb/analogweb/solutions-overview/power-solutions-banner.jpg?rev=adac044977cf4a8481655e4a04a55a6d&sc_lang=en&la=en&h=908&w=2720&hash=E7EB0398D9C623A89C5D7515BBC29F0F",
              "https://gnpowersolutions.com/images/services/soler.jpg"
            ];
            
            return (
              <div key={category.id} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={images[index]}
                    alt={category.name}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <div 
                      className="text-white p-3 rounded-lg"
                      style={{ backgroundColor: getPrimaryColor() }}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {category.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getPrimaryColor() }}
                      ></div>
                      <span className="text-sm text-gray-700">
                        {category.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getPrimaryColor() }}
                      ></div>
                      <span className="text-sm text-gray-700">
                        Installation & Maintenance
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getPrimaryColor() }}
                      ></div>
                      <span className="text-sm text-gray-700">
                        Expert Support
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/search?category=${category.id}`}
                    className="inline-flex items-center gap-2 font-semibold transition-colors group/link"
                    style={{ 
                      color: getPrimaryColor(),
                      '--hover-color': config.branding.colors.primary.dark
                    } as React.CSSProperties}
                  >
                    Explore {category.name}
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
