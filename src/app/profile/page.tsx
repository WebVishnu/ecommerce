"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  User,
  MapPin,
  Phone,
  Mail,
  Edit,
  Save,
  X,
  ShoppingBag,
  Settings,
  LogOut,
  Shield,
  Plus,
  Home,
  Building,
  Map,
  Trash2,
} from "lucide-react";
import { getPrimaryColor } from "@/config/company-config";

function ProfilePageInner() {
  const { user, isAuthenticated, logout, loading, isHydrated, updateUser } =
    useAuth();
  const { addToCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  type Product = {
    _id?: string;
    name: string;
    brand?: string;
    model?: string;
    capacity?: string;
    voltage?: string;
    warranty?: string;
    price: number;
    images?: string[];
  };
  type OrderItem = { product?: Product; quantity?: number; price?: number };
  type Order = {
    _id: string;
    status: string;
    createdAt: string;
    total: number;
    items: OrderItem[];
  };
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [reorderLoading, setReorderLoading] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(
    null
  );
  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
    addressType: "home" as "home" | "work" | "other",
    landmark: "",
  });
  const [updatingUser, setUpdatingUser] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Set initial tab from URL parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["profile", "orders", "security", "settings"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    dateOfBirth: user?.dateOfBirth
      ? new Date(user.dateOfBirth).toISOString().split("T")[0]
      : "",
    gender: user?.gender || "",
    addresses: user?.addresses || [],
  });

  // Update editForm when user data changes
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || "",
        phone: user.phone || "",
        email: user.email || "",
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: user.gender || "",
        addresses: user.addresses || [],
      });
    }
  }, [user]);

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab === "orders" && isAuthenticated && isHydrated) {
      fetchOrders();
    }
  }, [activeTab, isAuthenticated, isHydrated]);

  // Filtering and sorting logic using statusFilter and sortBy removed

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(`/api/orders?customerId=${user?._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setOrders(data.data.orders);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (loading || !isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
            style={{ borderBottomColor: getPrimaryColor() }}
          ></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated (only after hydration is complete and not updating user)
  if (!isAuthenticated && isHydrated && !updatingUser) {
    console.log("Redirecting to OTP page - not authenticated");
    router.push("/auth/otp");
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token found");
        return;
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          dateOfBirth: editForm.dateOfBirth || undefined,
          gender: editForm.gender || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the user in auth context
        updateUser(data.data.user);
        setIsEditing(false);
      } else {
        console.error("Failed to update profile:", data.message);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Address management functions
  const handleAddressInputChange = (field: string, value: string) => {
    setAddressForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddAddress = async () => {
    if (
      !addressForm.street ||
      !addressForm.city ||
      !addressForm.state ||
      !addressForm.pincode
    ) {
      alert("Please fill in all required address fields");
      return;
    }

    try {
      setUpdatingUser(true);
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch("/api/profile/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressForm),
      });

      const data = await response.json();

      if (data.success) {
        // Update the user in auth context
        updateUser(data.data.user);
        setShowAddressForm(false);
        setAddressForm({
          name: "",
          phone: "",
          street: "",
          city: "",
          state: "",
          pincode: "",
          isDefault: false,
          addressType: "home",
          landmark: "",
        });
      } else {
        alert(data.message || "Failed to add address");
      }
    } catch (error) {
      console.error("Error adding address:", error);
      alert("Failed to add address");
    } finally {
      setUpdatingUser(false);
    }
  };

  const handleEditAddress = (index: number) => {
    const address = user?.addresses?.[index];
    if (address) {
      setAddressForm({
        name: address.name ?? "",
        phone: address.phone ?? "",
        street: address.street,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        isDefault: address.isDefault,
        addressType: address.addressType,
        landmark: address.landmark || "",
      });
      setEditingAddressIndex(index);
      setShowAddressForm(true);
    }
  };

  const handleUpdateAddress = async () => {
    if (
      !addressForm.name ||
      !addressForm.phone ||
      !addressForm.street ||
      !addressForm.city ||
      !addressForm.state ||
      !addressForm.pincode
    ) {
      alert("Please fill in all required address fields");
      return;
    }

    try {
      setUpdatingUser(true);
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const addressId = user?.addresses?.[editingAddressIndex!]?._id;
      if (!addressId) return;

      const response = await fetch("/api/profile/addresses", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          addressId,
          ...addressForm,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the user in auth context
        updateUser(data.data.user);
        setShowAddressForm(false);
        setEditingAddressIndex(null);
        setAddressForm({
          name: "",
          phone: "",
          street: "",
          city: "",
          state: "",
          pincode: "",
          isDefault: false,
          addressType: "home",
          landmark: "",
        });
      } else {
        alert(data.message || "Failed to update address");
      }
    } catch (error) {
      console.error("Error updating address:", error);
      alert("Failed to update address");
    } finally {
      setUpdatingUser(false);
    }
  };

  const handleDeleteAddress = async (index: number) => {
    if (!confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      setUpdatingUser(true);
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const addressId = user?.addresses?.[index]?._id;
      if (!addressId) return;

      const response = await fetch(`/api/profile/addresses?id=${addressId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        // Update the user in auth context
        updateUser(data.data.user);
      } else {
        alert(data.message || "Failed to delete address");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      alert("Failed to delete address");
    } finally {
      setUpdatingUser(false);
    }
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case "home":
        return <Home className="w-4 h-4" />;
      case "work":
        return <Building className="w-4 h-4" />;
      default:
        return <Map className="w-4 h-4" />;
    }
  };

  // Reorder Function
  const handleReorder = async (order: Order) => {
    setReorderLoading(order._id);
    try {
      // Add all items from the order to cart
      for (const item of order.items.filter(
        (item: OrderItem) => item.product && item.product._id
      )) {
        // Create a minimal product object with required properties
        const product = {
          _id: item.product?._id || "",
          name: item.product?.name || "Unknown Product",
          brand: item.product?.brand || "Unknown Brand",
          model: item.product?.model || "",
          capacity: item.product?.capacity || "",
          voltage: item.product?.voltage || "",
          warranty: item.product?.warranty || "",
          price: item.price ?? 0,
          images: item.product?.images || [],
          description: item.product?.name || "Unknown Product",
          category: "automotive" as const,
          stock: 100,
          specifications: {},
          features: [],
          rating: 0,
          reviews: 0,
          isActive: true,
          isFeatured: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await addToCart(product, item.quantity);
      }
      router.push("/cart");
    } catch (error) {
      console.error("Error adding items to cart:", error);
      alert("Failed to add items to cart. Please try again.");
    } finally {
      setReorderLoading(null);
    }
  };

  // Cancel Order Function
  const handleCancelOrder = async (order: Order) => {
    if (
      !confirm(
        "Are you sure you want to cancel this order? This action cannot be undone."
      )
    ) {
      return;
    }

    setCancelLoading(order._id);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`/api/orders/${order._id}/cancel`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to cancel order");
      }

      alert("Order cancelled successfully!");

      // Refresh orders list
      fetchOrders();
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      alert(error.message || "Failed to cancel order. Please try again.");
    } finally {
      setCancelLoading(null);
    }
  };

  // Review Order Function
  const handleReviewOrder = async (order: Order) => {
    setReviewLoading(order._id);
    try {
      // For now, just show a simple review prompt
      const rating = prompt("Rate your order (1-5 stars):");
      if (rating === null) return; // User cancelled

      const ratingNum = parseInt(rating);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        alert("Please enter a valid rating between 1 and 5.");
        return;
      }

      const review = prompt("Write your review (optional):");

      // TODO: Implement actual review submission to API
      console.log("Review submitted:", {
        orderId: order._id,
        rating: ratingNum,
        review,
      });

      alert("Thank you for your review!");
    } catch (error: any) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setReviewLoading(null);
    }
  };

  // Function to get current location and fill address
  const handleUseCurrentLocation = async () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // TODO: Replace with your actual LocationIQ API key
          const response = await fetch(
            `https://us1.locationiq.com/v1/reverse.php?key=${process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY}&lat=${latitude}&lon=${longitude}&format=json`
          );

          if (!response.ok) {
            const text = await response.text();
            console.error("LocationIQ error response:", text);
            alert("Failed to fetch address from location (network error)");
            setLocationLoading(false);
            return;
          }
          const data = await response.json();
          console.log("LocationIQ response data:", data);
          if (!data.address) {
            alert("No address found for your location.");
            setLocationLoading(false);
            return;
          }
          const address = data.address;
          setAddressForm((prev) => ({
            ...prev,
            street:
              address.road ||
              address.neighbourhood ||
              address.suburb ||
              address.village ||
              "",
            city: address.city || address.town || address.village || "",
            state: address.state || address.region || "",
            pincode: address.postcode || "",
            landmark:
              address.hamlet || address.suburb || address.neighbourhood || "",
          }));
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          alert("Failed to fetch address from location");
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationLoading(false);
        console.error("Geolocation error:", error);
        alert("Unable to retrieve your location");
      }
    );
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "security", label: "Security", icon: Shield },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-md transition-colors"
            style={{ 
              backgroundColor: getPrimaryColor(),
              '--hover-color': getPrimaryColor() + 'dd'
            } as React.CSSProperties}
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={() => {
                setShowAddressForm(false);
                setEditingAddressIndex(null);
                setAddressForm({
                  name: "",
                  phone: "",
                  street: "",
                  city: "",
                  state: "",
                  pincode: "",
                  isDefault: false,
                  addressType: "home",
                  landmark: "",
                });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ 
                    '--tw-ring-color': getPrimaryColor(),
                    '--tw-ring-opacity': '0.5'
                  } as React.CSSProperties}
                />
              ) : (
                <p className="text-gray-900">{user?.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ 
                    '--tw-ring-color': getPrimaryColor(),
                    '--tw-ring-opacity': '0.5'
                  } as React.CSSProperties}
                />
              ) : (
                <p className="text-gray-900 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user?.email || "Not provided"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ 
                    '--tw-ring-color': getPrimaryColor(),
                    '--tw-ring-opacity': '0.5'
                  } as React.CSSProperties}
                />
              ) : (
                <p className="text-gray-900 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {user?.phone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Address
            </h3>
            {showAddressForm ? (
              <button
                onClick={() => {
                  setShowAddressForm(false);
                  setEditingAddressIndex(null);
                  setAddressForm({
                    name: "",
                    phone: "",
                    street: "",
                    city: "",
                    state: "",
                    pincode: "",
                    isDefault: false,
                    addressType: "home",
                    landmark: "",
                  });
                }}
                className="flex items-center gap-2 text-sm text-white px-3 py-2 rounded-md transition-colors"
                style={{ 
                  backgroundColor: getPrimaryColor(),
                  '--hover-color': getPrimaryColor() + 'dd'
                } as React.CSSProperties}
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            ) : (
              <button
                onClick={() => setShowAddressForm(true)}
                className="flex items-center gap-2 text-sm text-white px-3 py-2 rounded-md transition-colors"
                style={{ 
                  backgroundColor: getPrimaryColor(),
                  '--hover-color': getPrimaryColor() + 'dd'
                } as React.CSSProperties}
              >
                <Plus className="w-4 h-4" />
                Add address
              </button>
            )}
          </div>
          {/* Add/Edit Address Form */}
          {showAddressForm && (
            <div className="my-6">
              <h4 className="font-medium text-gray-900 mb-4">
                {editingAddressIndex !== null
                  ? "Edit Address"
                  : "Add New Address"}
              </h4>
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locationLoading}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {locationLoading ? (
                    <span className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"></span>
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                  Use Current Location
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={addressForm.street}
                    onChange={(e) =>
                      handleAddressInputChange("street", e.target.value)
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ 
                      '--tw-ring-color': getPrimaryColor(),
                      '--tw-ring-opacity': '0.5'
                    } as React.CSSProperties}
                    placeholder="House/Flat number, Street name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    City *
                  </label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) =>
                      handleAddressInputChange("city", e.target.value)
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ 
                      '--tw-ring-color': getPrimaryColor(),
                      '--tw-ring-opacity': '0.5'
                    } as React.CSSProperties}
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    State *
                  </label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) =>
                      handleAddressInputChange("state", e.target.value)
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ 
                      '--tw-ring-color': getPrimaryColor(),
                      '--tw-ring-opacity': '0.5'
                    } as React.CSSProperties}
                    placeholder="State"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={addressForm.pincode}
                    onChange={(e) =>
                      handleAddressInputChange(
                        "pincode",
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ 
                      '--tw-ring-color': getPrimaryColor(),
                      '--tw-ring-opacity': '0.5'
                    } as React.CSSProperties}
                    placeholder="6-digit pincode"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address Type
                  </label>
                  <select
                    value={addressForm.addressType}
                    onChange={(e) =>
                      handleAddressInputChange("addressType", e.target.value)
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent text-black"
                    style={{ 
                      '--tw-ring-color': getPrimaryColor(),
                      '--tw-ring-opacity': '0.5'
                    } as React.CSSProperties}
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={addressForm.landmark}
                    onChange={(e) =>
                      handleAddressInputChange("landmark", e.target.value)
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ 
                      '--tw-ring-color': getPrimaryColor(),
                      '--tw-ring-opacity': '0.5'
                    } as React.CSSProperties}
                    placeholder="Nearby landmark"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={addressForm.isDefault}
                      onChange={(e) =>
                        handleAddressInputChange(
                          "isDefault",
                          e.target.checked.toString()
                        )
                      }
                      className="rounded border-gray-300"
                      style={{ 
                        color: getPrimaryColor(),
                        '--tw-ring-color': getPrimaryColor()
                      } as React.CSSProperties}
                    />
                    <span className="text-sm text-gray-700">
                      Set as default address
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={
                    editingAddressIndex !== null
                      ? handleUpdateAddress
                      : handleAddAddress
                  }
                  className="text-white px-4 py-2 rounded-md transition-colors"
                  style={{ 
                    backgroundColor: getPrimaryColor(),
                    '--hover-color': getPrimaryColor() + 'dd'
                  } as React.CSSProperties}
                >
                  {editingAddressIndex !== null
                    ? "Update Address"
                    : "Add Address"}
                </button>
                <button
                  onClick={() => {
                    setShowAddressForm(false);
                    setEditingAddressIndex(null);
                    setAddressForm({
                      name: "",
                      phone: "",
                      street: "",
                      city: "",
                      state: "",
                      pincode: "",
                      isDefault: false,
                      addressType: "home",
                      landmark: "",
                    });
                  }}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <div className="space-y-4">
            {user?.addresses && user.addresses.length > 0 ? (
              <div className="space-y-3">
                {user.addresses.map((address, index) => (
                  <div
                    key={address._id || index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getAddressTypeIcon(address.addressType)}
                          <span className="font-medium text-gray-900">
                            {address.name}
                          </span>
                          {address.isDefault && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {address.phone}
                        </p>
                        <p className="text-sm text-gray-600">
                          {address.street}, {address.city}, {address.state} -{" "}
                          {address.pincode}
                        </p>
                        {address.landmark && (
                          <p className="text-xs text-gray-500 mt-1">
                            Landmark: {address.landmark}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditAddress(index)}
                          className="text-sm px-2 py-1 rounded hover:bg-gray-50"
                          style={{ 
                            color: getPrimaryColor(),
                            '--hover-color': getPrimaryColor() + 'dd'
                          } as React.CSSProperties}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(index)}
                          className="text-sm text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm mb-3">No addresses saved</p>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="text-sm font-medium"
                  style={{ 
                    color: getPrimaryColor(),
                    '--hover-color': getPrimaryColor() + 'dd'
                  } as React.CSSProperties}
                >
                  Add your first address
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrdersTab = () => (
    <div className="space-y-6">
      {/* <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b91c1c] text-sm"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={sortBy}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b91c1c] text-sm"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Value</option>
            <option value="lowest">Lowest Value</option>
          </select>
        </div>
      </div> */}

      {ordersLoading ? (
        <div className="text-center py-12">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
            style={{ borderBottomColor: getPrimaryColor() }}
          ></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No orders yet
          </h3>
          <p className="text-gray-600 mb-4">
            Start shopping to see your order history here
          </p>
          <button
            onClick={() => router.push("/search")}
            className="px-6 py-2 text-white rounded-md transition-colors"
            style={{ 
              backgroundColor: getPrimaryColor(),
              '--hover-color': getPrimaryColor() + 'dd'
            } as React.CSSProperties}
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: Order) => (
            <div
              key={order._id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <div
                className="flex flex-row items-center justify-between mb-4 cursor-pointer"
                onClick={() => router.push(`/orders/${order._id}`)}
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Placed on{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.items.length} item
                    {order.items.length !== 1 ? "s" : ""} •{" "}
                    {order.status === "delivered"
                      ? "Cash on Delivery"
                      : "Online Payment"}
                  </p>
                </div>
                <div className="flex flex-col m:flex-row items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === "delivered"
                        ? "bg-green-100 text-green-800"
                        : order.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    ₹{order.total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Product Preview */}
              <div className="mb-4">
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {order.items
                    .slice(0, 2)
                    .map((item: OrderItem, index: number) => (
                      <div
                        key={index}
                        onClick={() =>
                          router.push(`/products/${item.product?._id}`)
                        }
                        className="flex items-center gap-2 min-w-0 flex-shrink-0 cursor-pointer hover:border-2 w-full rounded-md"
                      >
                        <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                          {item.product?.images &&
                          item.product?.images.length > 0 ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product?.name || "Product"}
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <ShoppingBag className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {item.product?.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  {order.items.length > 2 && (
                    <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                      <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          +{order.items.length - 3}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* No orderNotes field, so this block is removed */}

              {/* Quick Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReorder(order)}
                    disabled={reorderLoading === order._id}
                    className="sm:px-3 px-1 py-1 text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      color: getPrimaryColor(),
                      '--hover-color': getPrimaryColor() + '10'
                    } as React.CSSProperties}
                  >
                    {reorderLoading === order._id ? "Adding..." : "Reorder"}
                  </button>
                  {order.status === "pending" && (
                    <button
                      onClick={() => handleCancelOrder(order)}
                      disabled={cancelLoading === order._id}
                      className="sm:px-3 px-1 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancelLoading === order._id
                        ? "Cancelling..."
                        : "Cancel Order"}
                    </button>
                  )}
                  {order.status === "delivered" && (
                    <button
                      onClick={() => handleReviewOrder(order)}
                      disabled={reviewLoading === order._id}
                      className="sm:px-3 px-1 py-1 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {reviewLoading === order._id
                        ? "Submitting..."
                        : "Rate & Review"}
                    </button>
                  )}
                </div>
                <Link
                  href={`/orders/${order._id}`}
                  className="px-4 py-2 text-white rounded-md transition-colors text-sm font-medium"
                  style={{ 
                    backgroundColor: getPrimaryColor(),
                    '--hover-color': getPrimaryColor() + 'dd'
                  } as React.CSSProperties}
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Account Security
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Phone Verification</h4>
              <p className="text-sm text-gray-600">
                Your phone number is verified via OTP
              </p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Verified
            </span>
          </div>
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">
                Mobile Authentication
              </h4>
              <p className="text-sm text-gray-600">
                Secure login with OTP verification
              </p>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Preferences
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-600">
                Receive updates about your orders
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div 
                className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                style={{ 
                  '--tw-ring-color': getPrimaryColor() + '20',
                  '--tw-ring-opacity': '0.2',
                  backgroundColor: 'var(--peer-checked-bg, rgb(229 231 235))'
                } as React.CSSProperties}
              ></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">SMS Notifications</h4>
              <p className="text-sm text-gray-600">
                Receive SMS updates about your orders
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div 
                className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                style={{ 
                  '--tw-ring-color': getPrimaryColor() + '20',
                  '--tw-ring-opacity': '0.2',
                  backgroundColor: 'var(--peer-checked-bg, rgb(229 231 235))'
                } as React.CSSProperties}
              ></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
          <LogOut className="w-5 h-5" />
          Danger Zone
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-red-900">Logout</h4>
            <p className="text-sm text-red-700">Sign out of your account</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <ul className="flex flex-row items-center sm:flex-col list-none">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <li key={tab.id} className=" w-full">
                      <button
                        onClick={() => {
                          setActiveTab(tab.id);
                          router.push(`/profile?tab=${tab.id}`);
                        }}
                        className={`w-full flex items-center sm:justify-start justify-center gap-3 px-4 py-3 rounded-md text-left transition-colors ${
                          activeTab === tab.id
                            ? "text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                        style={activeTab === tab.id ? {
                          backgroundColor: getPrimaryColor()
                        } : {} as React.CSSProperties}
                      >
                        <Icon className="w-5 h-5" />
                        <span
                          className={`hidden sm:block ${
                            activeTab === tab.id
                              ? "text-white"
                              : "text-gray-700"
                          }`}
                        >
                          {tab.label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "profile" && renderProfileTab()}
            {activeTab === "orders" && renderOrdersTab()}
            {activeTab === "security" && renderSecurityTab()}
            {activeTab === "settings" && renderSettingsTab()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfilePageInner />
    </Suspense>
  );
}
