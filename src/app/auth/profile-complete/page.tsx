"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { needsProfileCompletion } from "@/lib/utils";

export default function ProfileCompletePage() {
  const [formData, setFormData] = useState({
    name: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [pendingRedirect, setPendingRedirect] = useState(false);
  
  const router = useRouter();
  const { user, isAuthenticated, isHydrated, updateUser } = useAuth();

  // Check access control
  useEffect(() => {
    if (!isHydrated) return; // Wait for auth to hydrate

    if (!isAuthenticated) {
      // Not logged in - redirect to OTP page
      router.push("/auth/otp");
      return;
    }

    if (!needsProfileCompletion(user)) {
      // Profile already completed - redirect to home
      router.push("/");
      return;
    }

    // User is authenticated but profile not completed - allow access
    setCheckingAccess(false);
  }, [user, isAuthenticated, isHydrated, router]);

  // Handle redirect after profile completion
  useEffect(() => {
    if (pendingRedirect && user && !needsProfileCompletion(user)) {
      router.push("/");
      setPendingRedirect(false);
    }
  }, [user, pendingRedirect, router]);

  // Initialize form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || ""
      });
    }
  }, [user]);

  // Show loading while checking access
  if (checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#b91c1c]" />
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }

      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/auth/otp");
        return;
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name
        }),
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || "Failed to update profile");
      }
      
      // Update auth context with new user data
      updateUser(data.data.user);
      
      // Set pending redirect - the useEffect will handle the actual redirect
      setPendingRedirect(true);
      
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#b91c1c] mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-center text-gray-900">Complete Your Profile</h1>
          <p className="text-sm text-gray-600 text-center mt-2">
            Please provide your name to complete your account setup
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={e => handleInputChange("name", e.target.value)}
              className="w-full px-3 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#b91c1c] focus:border-[#b91c1c] text-lg"
              placeholder="Enter your full name"
              autoFocus
            />
            <p className="mt-1 text-xs text-gray-500">
              You can add addresses and other details later from your profile
            </p>
          </div>
          
          <button
            type="submit"
            disabled={loading || !formData.name.trim()}
            className="w-full bg-[#b91c1c] text-white py-3 rounded-md font-medium hover:bg-[#a31b1b] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              "Complete Profile & Continue"
            )}
          </button>
        </form>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
} 