"use client";

import Link from "next/link";
import Logo from "./Logo";
import { Search, User, ShoppingCart, Menu, X, LogOut, Settings, User as UserIcon, Phone } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { config, getPrimaryColor, getPrimaryPhone, getCompanyName } from "@/config/company-config";

export default function MainNav() {
  const router = useRouter();
  const { user, isAuthenticated, logout, isHydrated: authHydrated } = useAuth();
  const { getCartItemCount, isHydrated: cartHydrated } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    setUserMenuOpen(false);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

    
  return (
    <nav className="w-full bg-white border-b border-gray-200 shadow-sm relative z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-4">
        {/* Left nav (desktop) */}
        <div className="hidden lg:flex items-center gap-8">
          <Link href="/" className="uppercase text-sm tracking-widest text-gray-700 hover:text-black">Home</Link>
          {config.categories.map((category) => (
            <Link 
              key={category.id}
              href={`/search?category=${category.id}`} 
              className="uppercase text-sm tracking-widest text-gray-700 hover:text-black"
            >
              {category.name}
            </Link>
          ))}
        </div>
        {/* Hamburger (mobile) */}
        <button
          className="lg:hidden p-2 text-gray-700 hover:text-black focus:outline-none"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-7 w-7" />
        </button>
        {/* Logo (always centered) */}
        <div className="flex-1 flex justify-center lg:justify-center cursor-pointer" onClick={() => router.push('/')}>
          <Logo />
        </div>
        {/* Right nav (desktop) */}
        <div className="hidden lg:flex items-center gap-6">
          <Link href="/brands" className="uppercase text-sm tracking-widest text-gray-700 hover:text-black">Brands</Link>
          <Link href="/about" className="uppercase text-sm tracking-widest text-gray-700 hover:text-black">About Us</Link>
          <a 
            href={`tel:${getPrimaryPhone()}`} 
            className="uppercase text-sm tracking-widest text-gray-700 hover:text-black"
          >
            Contact
          </a>
          <Search onClick={() => router.push('/search')} className="h-5 w-5 text-gray-700 hover:text-black cursor-pointer" />
          {authHydrated && isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors"
                aria-label="User menu"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <span className="text-xs hidden sm:block">
                  Hi, {user?.name?.split(' ')[0]}
                </span>
                <UserIcon className="h-5 w-5" />
              </button>
              
              {/* User Menu Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 min-w-32 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 whitespace-nowrap">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-600">{user?.email}</p>
                  </div>
                  <Link
                    href="/profile?tab=profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    My Profile
                  </Link>
                  <Link
                    href="/profile?tab=orders"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    My Orders
                  </Link>
                  <Link
                    href="/profile?tab=settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : authHydrated ? (
            <User onClick={() => router.push('/auth/otp')} className="h-5 w-5 text-gray-700 hover:text-black cursor-pointer" />
          ) : (
            <div className="h-5 w-5" /> // Placeholder while hydrating
          )}
          <div className="relative">
            <ShoppingCart onClick={() => router.push('/cart')} className="h-5 w-5 text-gray-700 hover:text-black cursor-pointer" />
            {cartHydrated && getCartItemCount() > 0 && (
              <span 
                className="absolute -top-2 -right-2 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
                style={{ backgroundColor: getPrimaryColor() }}
              >
                {getCartItemCount() > 99 ? '99+' : getCartItemCount()}
              </span>
            )}
          </div>
        </div>
      </div>
      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex">
          <div className="w-80 bg-white h-full shadow-lg flex flex-col animate-slide-in-left">
            {/* Header */}
            <div className="flex justify-between items-center p-2 border-b border-gray-200">
                <span className="font-bold text-lg text-gray-900">Menu</span>
              <button
                className="p-2 text-gray-700 hover:text-black focus:outline-none"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* User Section */}
            {authHydrated && isAuthenticated ? (
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3 mb-4">
                  <div>
                    <p className="font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/profile?tab=profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 bg-white rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    Profile
                  </Link>
                  <Link
                    href="/profile?tab=orders"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 bg-white rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Orders
                  </Link>
                </div>
              </div>
            ) : authHydrated ? (
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-600 mb-4">Welcome to {getCompanyName()}</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/auth/otp"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-white rounded-md text-sm transition-colors"
                    style={{ 
                      backgroundColor: getPrimaryColor(),
                      '--hover-color': config.branding.colors.primary.dark
                    } as React.CSSProperties}
                  >
                    <UserIcon className="w-4 h-4" />
                    Login
                  </Link>
                  <Link
                    href="/auth/otp"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    Sign Up
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto">
              <nav className="p-6">
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Categories</h3>
                  <Link 
                    href="/" 
                    className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors" 
                    onClick={() => setMobileOpen(false)}
                  >
                    <span 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getPrimaryColor() }}
                    ></span>
                    Home
                  </Link>
                  {config.categories.map((category) => (
                    <Link 
                      key={category.id}
                      href={`/search?category=${category.id}`} 
                      className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors" 
                      onClick={() => setMobileOpen(false)}
                    >
                      <span 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getPrimaryColor() }}
                      ></span>
                      {category.name}
                    </Link>
                  ))}
                </div>

                <div className="space-y-1 mt-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Company</h3>
                  <Link 
                    href="/brands" 
                    className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors" 
                    onClick={() => setMobileOpen(false)}
                  >
                    <span 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getPrimaryColor() }}
                    ></span>
                    Brands
                  </Link>
                  <Link 
                    href="/about" 
                    className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors" 
                    onClick={() => setMobileOpen(false)}
                  >
                    <span 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getPrimaryColor() }}
                    ></span>
                    About Us
                  </Link>
                  <a 
                    href={`tel:${getPrimaryPhone()}`} 
                    className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Contact
                  </a>
                </div>
              </nav>
            </div>

            {/* Quick Actions */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    router.push('/search');
                    setMobileOpen(false);
                  }}
                  className="flex flex-col items-center gap-1 p-3 bg-white rounded-md hover:bg-gray-100 transition-colors"
                >
                  <Search className="w-5 h-5 text-gray-700" />
                  <span className="text-xs text-gray-700">Search</span>
                </button>
                <button
                  onClick={() => {
                    router.push('/cart');
                    setMobileOpen(false);
                  }}
                  className="flex flex-col items-center gap-1 p-3 bg-white rounded-md hover:bg-gray-100 transition-colors relative"
                >
                  <ShoppingCart className="w-5 h-5 text-gray-700" />
                  <span className="text-xs text-gray-700">Cart</span>
                  {cartHydrated && getCartItemCount() > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium"
                      style={{ backgroundColor: getPrimaryColor() }}
                    >
                      {getCartItemCount() > 9 ? '9+' : getCartItemCount()}
                    </span>
                  )}
                </button>
                {authHydrated && isAuthenticated && (
                  <button
                    onClick={handleLogout}
                    className="flex flex-col items-center gap-1 p-3 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="w-5 h-5 text-red-600" />
                    <span className="text-xs text-red-600">Logout</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          {/* Click outside to close */}
          <div className="flex-1" onClick={() => setMobileOpen(false)} />
        </div>
      )}
      <style jsx global>{`
        @keyframes slide-in-left {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.2s ease;
        }
      `}</style>
    </nav>
  );
}
