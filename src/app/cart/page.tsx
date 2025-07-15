'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function CartPage() {
  const { cart, loading, error, updateCartItem, removeFromCart, clearCart, clearError, isHydrated: cartHydrated } = useCart();
  const { isAuthenticated, loading: authLoading, isHydrated: authHydrated } = useAuth();
  const router = useRouter();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [operationError, setOperationError] = useState<string | null>(null);

  // Debug authentication state
  console.log('Cart Page Auth State:', {
    isAuthenticated,
    authLoading,
    authHydrated,
    cartHydrated
  });

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setOperationError(null);
    clearError();
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await updateCartItem(itemId, newQuantity);
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : 'Failed to update quantity');
      console.error('Quantity update error:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setOperationError(null);
    clearError();
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await removeFromCart(itemId);
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : 'Failed to remove item');
      console.error('Remove item error:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push('/auth/otp');
      return;
    }
    router.push('/checkout');
  };

  // Show loading state while checking authentication
  if (authLoading || !authHydrated || (loading && !cart)) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b91c1c] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated && authHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h1>
            <p className="text-gray-600 mb-6">You need to be logged in to view your cart.</p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/auth/otp"
                className="bg-[#b91c1c] text-white px-6 py-2 rounded-md hover:bg-[#a31b1b] transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-red-500 mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Error Loading Cart</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#b91c1c] text-white px-4 py-2 rounded-md hover:bg-[#a31b1b] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
            <Link
              href="/search"
              className="bg-[#b91c1c] text-white px-6 py-2 rounded-md hover:bg-[#a31b1b] transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">
            {cart.itemCount} item{cart.itemCount !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        {/* Error Message */}
        {operationError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center gap-2">
              <div className="text-red-500">⚠️</div>
              <p className="text-red-700 text-sm">{operationError}</p>
              <button
                onClick={() => setOperationError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {cart.items.filter(item => item.product && item.product._id).map((item) => (
                  <div key={item._id} className="p-6">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
                          {item.product.images && item.product.images.length > 0 ? (
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <ShoppingBag className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                              {item.product.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">{item.product.brand}</p>
                            <p className="text-sm text-gray-500">
                              {item.product.specifications?.capacity || ''} • {item.product.specifications?.voltage || ''} • {item.product.specifications?.warranty || ''}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item._id)}
                            disabled={updatingItems.has(item._id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="text-lg font-semibold text-[#b91c1c]">
                            ₹{item.price.toLocaleString()}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updatingItems.has(item._id)}
                              className={cn(
                                "p-1 rounded-md transition-colors",
                                item.quantity > 1 && !updatingItems.has(item._id)
                                  ? "text-gray-600 hover:bg-gray-100"
                                  : "text-gray-300 cursor-not-allowed"
                              )}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            
                            <span className="w-12 text-center text-sm font-medium">
                              {updatingItems.has(item._id) ? '...' : item.quantity}
                            </span>
                            
                            <button
                              onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                              disabled={updatingItems.has(item._id)}
                              className={cn(
                                "p-1 rounded-md transition-colors",
                                !updatingItems.has(item._id)
                                  ? "text-gray-600 hover:bg-gray-100"
                                  : "text-gray-300 cursor-not-allowed"
                              )}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Stock Status */}
                        {item.product.stock < item.quantity && (
                          <p className="text-sm text-red-600 mt-2">
                            Only {item.product.stock} available
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({cart.itemCount} items)</span>
                  <span className="font-medium">₹{cart.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">₹0</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-[#b91c1c]">₹{cart.total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-[#b91c1c] text-white py-3 px-4 rounded-md font-medium hover:bg-[#a31b1b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Proceed to Checkout'}
              </button>

              <button
                onClick={clearCart}
                disabled={loading}
                className="w-full mt-3 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 