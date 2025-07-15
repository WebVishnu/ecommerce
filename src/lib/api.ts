// API Base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Types
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: 'automotive' | 'inverter' | 'solar' | 'ups' | 'industrial';
  brand: string;
  model: string;
  stock: number;
  images: string[];
  specifications: Record<string, string>;
  rating: number;
  reviews: number;
  isActive: boolean;
  isFeatured: boolean;
  isDraft?: boolean;
  draftSavedAt?: Date;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id?: string;
  name?: string;
  phone?: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  addressType: 'home' | 'work' | 'other';
  landmark?: string;
}

export interface User {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  addresses: Address[];
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  profilePicture?: string;
  role: 'customer' | 'admin';
  isActive: boolean;
  phoneVerified: boolean;
  profileCompleted: boolean;
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    marketing: {
      email: boolean;
      sms: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  total: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  user: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message: string;
}

export interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface ProductResponse {
  success: boolean;
  data: Product;
}

export interface CartResponse {
  success: boolean;
  data: Cart;
}

export interface OrderResponse {
  success: boolean;
  data: Order;
}

// API Helper Functions
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Authentication APIs
export const authAPI = {
  sendOtp: async (mobile: string): Promise<{ success: boolean; message: string; expiresIn?: number }> => {
    return apiRequest<{ success: boolean; message: string; expiresIn?: number }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile }),
    });
  },

  verifyOtp: async (mobile: string, otp: string): Promise<{
    success: boolean;
    message: string;
    data: {
      token: string;
      user: User;
      isNewUser: boolean;
      requiresProfileCompletion: boolean;
    };
  }> => {
    return apiRequest<{
      success: boolean;
      message: string;
      data: {
        token: string;
        user: User;
        isNewUser: boolean;
        requiresProfileCompletion: boolean;
      };
    }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile, otp }),
    });
  },
};

// Product APIs
export const productAPI = {
  getAll: async (params: {
    page?: number;
    limit?: number;
    category?: string;
    brand?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<ProductsResponse> => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest<ProductsResponse>(endpoint);
  },

  getById: async (id: string): Promise<ProductResponse> => {
    return apiRequest<ProductResponse>(`/products/${id}`);
  },

  create: async (productData: Partial<Product>): Promise<ProductResponse> => {
    return apiRequest<ProductResponse>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  update: async (id: string, productData: Partial<Product>): Promise<ProductResponse> => {
    return apiRequest<ProductResponse>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// Cart APIs
export const cartAPI = {
  getCart: async (): Promise<CartResponse> => {
    return apiRequest<CartResponse>('/cart');
  },

  addToCart: async (productId: string, quantity: number = 1): Promise<CartResponse> => {
    return apiRequest<CartResponse>('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  updateCartItem: async (itemId: string, quantity: number): Promise<CartResponse> => {
    return apiRequest<CartResponse>(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  removeFromCart: async (itemId: string): Promise<CartResponse> => {
    return apiRequest<CartResponse>(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  },

  clearCart: async (): Promise<CartResponse> => {
    return apiRequest<CartResponse>('/cart/clear', {
      method: 'DELETE',
    });
  },
};

// Order APIs
export const orderAPI = {
  createOrder: async (orderData: {
    items: Array<{ productId: string; quantity: number }>;
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
    paymentMethod: string;
  }): Promise<OrderResponse> => {
    return apiRequest<OrderResponse>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  getOrders: async (): Promise<{ success: boolean; data: Order[] }> => {
    return apiRequest<{ success: boolean; data: Order[] }>('/orders');
  },

  getOrderById: async (orderId: string): Promise<OrderResponse> => {
    return apiRequest<OrderResponse>(`/orders/${orderId}`);
  },

  updateOrderStatus: async (orderId: string, status: Order['status']): Promise<OrderResponse> => {
    return apiRequest<OrderResponse>(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

// Local Storage Helpers
export const storage = {
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('authToken', token);
      } catch (error) {
        console.error('Error setting token in localStorage:', error);
      }
    }
  },

  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('authToken');
      } catch (error) {
        console.error('Error getting token from localStorage:', error);
        return null;
      }
    }
    return null;
  },

  removeToken: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('authToken');
      } catch (error) {
        console.error('Error removing token from localStorage:', error);
      }
    }
  },

  setUser: (user: User) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('user', JSON.stringify(user));
      } catch (error) {
        console.error('Error setting user in localStorage:', error);
      }
    }
  },

  getUser: (): User | null => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        // Clear corrupted data
        localStorage.removeItem('user');
        return null;
      }
    }
    return null;
  },

  removeUser: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('user');
      } catch (error) {
        console.error('Error removing user from localStorage:', error);
      }
    }
  },

  clearAuth: () => {
    storage.removeToken();
    storage.removeUser();
  },
};

// Auth State Management
export class AuthManager {
  private static instance: AuthManager;
  private listeners: Array<(user: User | null) => void> = [];

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  getCurrentUser(): User | null {
    return storage.getUser();
  }

  isAuthenticated(): boolean {
    const token = storage.getToken();
    const user = storage.getUser();
    console.log('AuthManager: isAuthenticated check:', { 
      hasToken: !!token, 
      hasUser: !!user,
      token: token ? 'Token exists' : 'No token',
      user: user ? 'User exists' : 'No user'
    });
    return !!token && !!user;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  login(token: string, user: User) {
    console.log("AuthManager: Login called with token and user:", { token: !!token, user });
    storage.setToken(token);
    storage.setUser(user);
    console.log("AuthManager: Storage updated, notifying listeners");
    this.notifyListeners(user);
    console.log("AuthManager: Login completed");
  }

  updateUser(user: User) {
    console.log("AuthManager: updateUser called with:", user);
    console.log("AuthManager: Current token:", storage.getToken());
    storage.setUser(user);
    console.log("AuthManager: User saved to storage, notifying listeners");
    this.notifyListeners(user);
    console.log("AuthManager: updateUser completed");
  }

  logout() {
    storage.clearAuth();
    this.notifyListeners(null);
  }

  subscribe(listener: (user: User | null) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(user: User | null) {
    this.listeners.forEach(listener => listener(user));
  }
}

export const authManager = AuthManager.getInstance(); 