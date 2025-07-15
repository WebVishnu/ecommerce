'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Cart, CartItem, Product, cartAPI } from '@/lib/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartItemCount: () => number;
  getCartTotal: () => number;
  refreshCart: () => Promise<void>;
  isHydrated: boolean;
  clearError: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isHydrated: authHydrated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const fetchCart = async () => {
    
    if (!isAuthenticated || !authHydrated) {
      setCart(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await cartAPI.getCart();
      setCart(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cart');
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authHydrated) {
      fetchCart();
    }
  }, [isAuthenticated, authHydrated]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!isAuthenticated || !authHydrated) {
      setError('Please login to add items to cart');
      return;
    }

    try {
      setError(null);
      const response = await cartAPI.addToCart(product._id, quantity);
      setCart(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item to cart');
      throw err; // Re-throw to let component handle it
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    if (!isAuthenticated || !authHydrated) {
      setError('Please login to update cart');
      return;
    }

    try {
      setError(null);
      const response = await cartAPI.updateCartItem(itemId, quantity);
      setCart(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update cart item');
      throw err; // Re-throw to let component handle it
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!isAuthenticated || !authHydrated) {
      setError('Please login to remove items from cart');
      return;
    }

    try {
      setError(null);
      const response = await cartAPI.removeFromCart(itemId);
      setCart(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item from cart');
      throw err; // Re-throw to let component handle it
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated || !authHydrated) {
      setError('Please login to clear cart');
      return;
    }

    try {
      setError(null);
      const response = await cartAPI.clearCart();
      setCart(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear cart');
      throw err; // Re-throw to let component handle it
    }
  };

  const getCartItemCount = (): number => {
    if (!isHydrated) return 0;
    return cart?.itemCount || 0;
  };

  const getCartTotal = (): number => {
    if (!isHydrated) return 0;
    return cart?.total || 0;
  };

  const refreshCart = async () => {
    await fetchCart();
  };

  const clearError = () => {
    setError(null);
  };

  const value: CartContextType = {
    cart,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartItemCount,
    getCartTotal,
    refreshCart,
    isHydrated,
    clearError,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 