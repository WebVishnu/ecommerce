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

    console.log("AuthContext: Initializing auth state");
    
    try {
      // Initialize auth state from localStorage
      const currentUser = authManager.getCurrentUser();
      console.log("AuthContext: Current user from storage:", currentUser);
      setUser(currentUser);
      
      // Subscribe to auth changes
      const unsubscribe = authManager.subscribe((newUser) => {
        console.log("AuthContext: User state changed:", newUser);
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
    console.log("AuthContext: Login called with user:", user);
    console.log("AuthContext: Login called with token:", token ? "Token exists" : "No token");
    authManager.login(token, user);
    console.log("AuthContext: Login completed, current state:", {
      user: authManager.getCurrentUser(),
      isAuthenticated: authManager.isAuthenticated()
    });
  };

  const updateUser = (user: User) => {
    console.log("AuthContext: UpdateUser called with user:", user);
    console.log("AuthContext: Current user before update:", authManager.getCurrentUser());
    authManager.updateUser(user);
    console.log("AuthContext: Current user after update:", authManager.getCurrentUser());
    console.log("AuthContext: Is authenticated after update:", authManager.isAuthenticated());
    
    // Force a re-render to ensure state is updated
    setUser(user);
  };

  const logout = () => {
    console.log("AuthContext: Logout called");
    authManager.logout();
  };

  const isAuthenticated = !!user && authManager.isAuthenticated() && isHydrated;
  
  console.log("AuthContext: Rendering with state:", {
    user: !!user,
    authManagerIsAuthenticated: authManager.isAuthenticated(),
    isHydrated,
    finalIsAuthenticated: isAuthenticated,
    userDetails: user ? { id: user._id, name: user.name, phone: user.phone } : null
  });

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
    console.warn('useAuth called outside of AuthProvider, using fallback context');
    return fallbackContext;
  }
  return context;
} 