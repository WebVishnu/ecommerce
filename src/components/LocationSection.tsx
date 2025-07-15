"use client";

import Image from "next/image";
import { MapPin, Clock, Phone } from "lucide-react";

export default function LocationSection() {
  return (
    <section className="py-16">
      <div className=" mx-auto md:px-4">
        <div className="text-center mb-12">
          <div className="uppercase text-xs tracking-widest text-[#b91c1c] mb-2 font-semibold">
            Our Location
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
            Visit Our Store in Atrauli
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience our professional service and extensive range of battery solutions at our conveniently located store.
          </p>
        </div>

        <div className="bg-white rounded-2xl flex flex-col lg:flex-row overflow-hidden shadow-xl border border-gray-100">
          {/* Left: Image */}
          <div className="lg:w-1/2 w-full h-80 lg:h-auto relative">
            <Image
              src="/award.png"
              alt="Shivangi Battery Store Front"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>

          {/* Right: Content */}
          <div className="lg:w-1/2 w-full flex flex-col justify-center p-8 lg:p-12">
            <div className="space-y-6">
              {/* Store Info */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Shivangi Battery Store
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Your trusted destination for all battery solutions. We offer premium quality batteries 
                  from top brands with expert installation and maintenance services.
                </p>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-[#b91c1c] mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Store Address</h4>
                  <a 
                    href="https://maps.app.goo.gl/9WZc1Rw6ice8FZFk9" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-[#b91c1c] transition-colors"
                  >
                    <p>Ramghat Road Atrauli Aligarh U P,</p>
                    <p>Atrauli Aligarh, Uttar Pradesh 202280</p>
                  </a>
                </div>
              </div>

              {/* Business Hours */}
              <div className="flex items-start gap-4">
                <Clock className="w-5 h-5 text-[#b91c1c] mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Business Hours</h4>
                  <div className="text-gray-600">
                    <p>Monday - Saturday: 9:00 AM - 8:00 PM</p>
                    <p>Sunday: 10:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="flex items-start gap-4">
                <Phone className="w-5 h-5 text-[#b91c1c] mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Contact Us</h4>
                  <a 
                    href="tel:+919761145106"
                    className="text-gray-600 hover:text-[#b91c1c] transition-colors"
                  >
                    +91-97611-45106
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a
                  href="https://maps.app.goo.gl/9WZc1Rw6ice8FZFk9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[#b91c1c] text-white rounded-lg font-medium hover:bg-[#a31b1b] transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 