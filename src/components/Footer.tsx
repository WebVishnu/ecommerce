"use client";

import {
  Phone,
  MapPin,
  MessageCircle,
  Clock,
  Mail,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#18181b] text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-3">
                Shivangi Battery
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Your trusted partner for all battery solutions. Quality
                products, reliable service, and expert support for all your
                power needs.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className="text-gray-300 hover:text-[#b91c1c] transition-colors text-sm"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/search"
                  className="text-gray-300 hover:text-[#b91c1c] transition-colors text-sm"
                >
                  Products
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="text-gray-300 hover:text-[#b91c1c] transition-colors text-sm"
                >
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Our Services</h4>
            <ul className="space-y-2">
              <li className="text-gray-300 text-sm">Battery Sales</li>
              <li className="text-gray-300 text-sm">Battery Installation</li>
              <li className="text-gray-300 text-sm">Battery Maintenance</li>
              <li className="text-gray-300 text-sm">Emergency Services</li>
              <li className="text-gray-300 text-sm">Technical Support</li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#b91c1c] mt-0.5 flex-shrink-0" />
                <div>
                  <a 
                    href="https://maps.app.goo.gl/9WZc1Rw6ice8FZFk9" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-[#b91c1c] transition-colors"
                  >
                    <p className="text-gray-300 text-sm">
                      Ramghat Road Atrauli Aligarh U P,{" "}
                    </p>
                    <p className="text-gray-300 text-sm">
                      Atrauli Aligarh, Uttar Pradesh 202280
                    </p>
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#b91c1c] flex-shrink-0" />
                <a
                  href="tel:+919761145106"
                  className="text-gray-300 hover:text-[#b91c1c] transition-colors text-sm"
                >
                  +91-97611-45106
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#b91c1c] flex-shrink-0" />
                <a
                  href="mailto:info@shivangibattery.com"
                  className="text-gray-300 hover:text-[#b91c1c] transition-colors text-sm"
                >
                  info@shivangibattery.com
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#b91c1c] flex-shrink-0" />
                <div>
                  <p className="text-gray-300 text-sm">
                    Mon-Sat: 9:00 AM - 8:00 PM
                  </p>
                  <p className="text-gray-300 text-sm">
                    Sunday: 10:00 AM - 6:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp CTA */}
      <div className="bg-[#1a1a1d] py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
              <span className="text-gray-300 text-sm">
                Need immediate assistance?
              </span>
            </div>
                        <a 
              href="https://wa.me/919761145106" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-2 rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-[#0f0f11] py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <span>
                &copy; {new Date().getFullYear()} Shivangi Battery. All rights
                reserved.
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-[#b91c1c] transition-colors">
                Privacy Policy
              </a>
              <span>|</span>
              <a href="#" className="hover:text-[#b91c1c] transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
