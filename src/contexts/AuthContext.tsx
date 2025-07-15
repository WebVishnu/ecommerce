'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, authManager } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, user: User) => void;
  updateUser: (user: User) => void;
  logout: () => void;
  loading: boolean;
  isHydrated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a fallback context for when the provider is not available
const fallbackContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  login: () => {},
  updateUser: () => {},
  logout: () => {},
  loading: true,
  isHydrated: false,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Ensure we're on the client side
    if (typeof window === 'undefined') {
      return;
    }

    try {
      // Initialize auth state from localStorage
      const currentUser = authManager.getCurrentUser();
      setUser(currentUser);
      
      // Subscribe to auth changes
      const unsubscribe = authManager.subscribe((newUser) => {
        setUser(newUser);
      });

      setLoading(false);
      setIsHydrated(true);

      return unsubscribe;
    } catch (error) {
      console.error("AuthContext: Error initializing auth state:", error);
      setLoading(false);
      setIsHydrated(true);
    }
  }, []);

  const login = (token: string, user: User) => {
    authManager.login(token, user);
  };

  const updateUser = (user: User) => {
    authManager.updateUser(user);
    
    // Force a re-render to ensure state is updated
    setUser(user);
  };

  const logout = () => {
    authManager.logout();
  };

  const isAuthenticated = !!user && authManager.isAuthenticated() && isHydrated;
  
  // Ensure we have a valid context value
  const contextValue = {
    user,
    isAuthenticated,
    isAdmin: user?.role === 'admin',
    login,
    updateUser,
    logout,
    loading,
    isHydrated,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    return fallbackContext;
  }
  return context;
} 