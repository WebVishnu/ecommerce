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
import { 
  config, 
  getCompanyName, 
  getPrimaryColor, 
  getPrimaryPhone, 
  getPrimaryEmail, 
  getFullAddress 
} from "@/config/company-config";

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
                {getCompanyName()}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {config.content.footer.description}
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2">
              {config.content.footer.quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={`/${link.toLowerCase().replace(' ', '-')}`}
                    className="text-gray-300 hover:text-[#b91c1c] transition-colors text-sm"
                    style={{ 
                      '--tw-text-opacity': '1',
                      '--hover-color': getPrimaryColor()
                    } as React.CSSProperties}
                  >
                    {link}
                  </a>
                </li>
              ))}
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
                <MapPin 
                  className="w-4 h-4 mt-0.5 flex-shrink-0" 
                  style={{ color: getPrimaryColor() }}
                />
                <div>
                  <a 
                    href="https://maps.app.goo.gl/9WZc1Rw6ice8FZFk9" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-[#b91c1c] transition-colors"
                    style={{ 
                      '--hover-color': getPrimaryColor()
                    } as React.CSSProperties}
                  >
                    <p className="text-gray-300 text-sm">
                      {config.contact.address.street}
                    </p>
                    <p className="text-gray-300 text-sm">
                      {config.contact.address.city}, {config.contact.address.state} {config.contact.address.pincode}
                    </p>
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone 
                  className="w-4 h-4 flex-shrink-0" 
                  style={{ color: getPrimaryColor() }}
                />
                <a
                  href={`tel:${getPrimaryPhone()}`}
                  className="text-gray-300 hover:text-[#b91c1c] transition-colors text-sm"
                  style={{ 
                    '--hover-color': getPrimaryColor()
                  } as React.CSSProperties}
                >
                  {getPrimaryPhone()}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail 
                  className="w-4 h-4 flex-shrink-0" 
                  style={{ color: getPrimaryColor() }}
                />
                <a
                  href={`mailto:${getPrimaryEmail()}`}
                  className="text-gray-300 hover:text-[#b91c1c] transition-colors text-sm"
                  style={{ 
                    '--hover-color': getPrimaryColor()
                  } as React.CSSProperties}
                >
                  {getPrimaryEmail()}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Clock 
                  className="w-4 h-4 flex-shrink-0" 
                  style={{ color: getPrimaryColor() }}
                />
                <div>
                  <p className="text-gray-300 text-sm">
                    Mon-Sat: {config.contact.businessHours.monday}
                  </p>
                  <p className="text-gray-300 text-sm">
                    Sunday: {config.contact.businessHours.sunday}
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
              href={`https://wa.me/${config.contact.phone.whatsapp.replace(/\D/g, '')}`}
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
                &copy; {new Date().getFullYear()} {getCompanyName()}. All rights
                reserved.
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="#" 
                className="hover:text-[#b91c1c] transition-colors"
                style={{ 
                  '--hover-color': getPrimaryColor()
                } as React.CSSProperties}
              >
                Privacy Policy
              </a>
              <span>|</span>
              <a 
                href="#" 
                className="hover:text-[#b91c1c] transition-colors"
                style={{ 
                  '--hover-color': getPrimaryColor()
                } as React.CSSProperties}
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
