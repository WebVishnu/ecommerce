"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Truck,
  MapPin,
  Home,
  Building,
  Map,
  Plus,
  Download,
  Clock,
  Package,
} from "lucide-react";

interface ShippingAddress {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated, updateUser } = useAuth();
  const { cart, loading: cartLoading, clearCart } = useCart();

  const [step, setStep] = useState<
    "address" | "payment" | "review" | "success"
  >("address");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<ShippingAddress>({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("cod");
  const [orderNotes, setOrderNotes] = useState("");
  const [orderData, setOrderData] = useState<any>(null);
  const [updatingUser, setUpdatingUser] = useState(false);

  // Payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: "cod",
      name: "Cash on Delivery",
      description: "Pay when you receive your order",
      icon: <Truck className="w-5 h-5" />,
    },
    {
      id: "card",
      name: "Credit/Debit Card",
      description: "Pay securely with your card",
      icon: <CreditCard className="w-5 h-5" />,
    },
  ];

  // Check authentication and cart
  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated && !updatingUser) {
      router.push("/auth/otp");
      return;
    }

    // Don't redirect to cart if we're on success step (order completed)
    if ((!cart || cart.items.length === 0) && step !== "success") {
      router.push("/cart");
      return;
    }
  }, [isAuthenticated, isHydrated, cart, router, updatingUser, step]);

  // Update shipping address when user data changes
  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      const defaultAddress = user.addresses.find((addr) => addr.isDefault);
      const firstAddress = user.addresses[0];
      const addressToUse = defaultAddress || firstAddress;

      setSelectedAddressId(addressToUse._id || "0");
      setShippingAddress({
        name: addressToUse.name || "",
        phone: addressToUse.phone || "",
        street: addressToUse.street,
        city: addressToUse.city,
        state: addressToUse.state,
        pincode: addressToUse.pincode,
        landmark: addressToUse.landmark,
      });
    }
  }, [user]);

  const handleAddressSelect = (address: any) => {
    setSelectedAddressId(address._id || "0");
    setShippingAddress({
      name: address.name,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      landmark: address.landmark,
    });
    setShowNewAddressForm(false);
  };

  const handleNewAddressChange = (
    field: keyof ShippingAddress,
    value: string
  ) => {
    setNewAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddNewAddress = async () => {
    if (
      !newAddress.name ||
      !newAddress.phone ||
      !newAddress.street ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.pincode
    ) {
      setError("Please fill in all required address fields");
      return;
    }

    try {
      setUpdatingUser(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Authentication required");
        return;
      }

      // Save the new address to user's profile
      const response = await fetch("/api/profile/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newAddress,
          addressType: "home",
          isDefault: false,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the user in auth context with new address
        updateUser(data.data.user);
        setShippingAddress(newAddress);
        setSelectedAddressId("new");
        setShowNewAddressForm(false);
        setError(null);

        // Show success message
      } else {
        setError(data.message || "Failed to save address");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      setError("Failed to save address. You can still proceed with the order.");

      // Still allow using the address for this order
      setShippingAddress(newAddress);
      setSelectedAddressId("new");
      setShowNewAddressForm(false);
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

  const handleDownloadInvoice = async () => {
    if (!orderData?.data?.order?._id) return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(
        `/api/orders/${orderData.data.order._id}/invoice`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${orderData.data.order._id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Failed to download invoice. Please try again later.");
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert("Failed to download invoice. Please try again later.");
    }
  };

  const handleNextStep = () => {
    if (step === "address") {
      // Validate address
      if (
        !shippingAddress.name ||
        !shippingAddress.phone ||
        !shippingAddress.street ||
        !shippingAddress.city ||
        !shippingAddress.state ||
        !shippingAddress.pincode
      ) {
        setError("Please fill in all address fields");
        return;
      }
      setStep("payment");
    } else if (step === "payment") {
      setStep("review");
    }
    setError(null);
  };

  const handlePreviousStep = () => {
    if (step === "payment") {
      setStep("address");
    } else if (step === "review") {
      setStep("payment");
    }
    setError(null);
  };

  const handlePlaceOrder = async () => {
    if (!cart || !user) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const orderData = {
        items: cart.items
          .filter((item) => item.product && item.product._id)
          .map((item) => ({
            productId: item.product._id,
            quantity: item.quantity,
          })),
        shippingAddress: shippingAddress,
        paymentMethod: selectedPaymentMethod,
        orderNotes: orderNotes,
        total: cart.total,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to place order");
      }

      // Store order data and clear cart
      setOrderData(data);
      await clearCart();
      setStep("success");
    } catch (err: any) {
      setError(err.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state (but not on success step)
  if ((!isHydrated || cartLoading || !cart) && step !== "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b91c1c] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Show success page
  if (step === "success") {
    return (
      <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 sm:p-8 text-center text-white">
              <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4" />
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-white">
                Order Placed Successfully!
              </h1>
              <p className="text-green-100 text-base sm:text-lg">
                Thank you for your order.
              </p>
            </div>

            {/* Order Details */}
            <div className="p-6 sm:p-8">
              {/* Delivery Timeline */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  <h3 className="text-base sm:text-lg font-semibold text-blue-900">
                    Delivery Timeline
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-sm sm:text-base text-blue-800">
                      Order confirmed and processing
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-sm sm:text-base text-blue-800">
                      Package prepared and shipped
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-sm sm:text-base text-blue-800 font-semibold">
                      Expected delivery: 5-7 working days
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-blue-700 mt-4">
                  <Package className="w-4 h-4 inline mr-1" />
                  We'll send you tracking updates via SMS and email
                </p>
              </div>

              {/* Order Summary */}
              {orderData?.data?.order && (
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                    Order Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm sm:text-base text-gray-600">
                        Order Total:
                      </span>
                      <span className="font-semibold text-sm sm:text-base">
                        ₹{orderData.data.order.total}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm sm:text-base text-gray-600">
                        Payment Method:
                      </span>
                      <span className="font-semibold capitalize text-sm sm:text-base">
                        {orderData.data.order.paymentMethod}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm sm:text-base text-gray-600">
                        Order Status:
                      </span>
                      <span className="font-semibold text-green-600 capitalize text-sm sm:text-base">
                        {orderData.data.order.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button
                  onClick={handleDownloadInvoice}
                  className="flex items-center justify-center gap-2 bg-[#b91c1c] text-white px-4 sm:px-6 py-3 rounded-md hover:bg-[#a31b1b] transition-colors font-medium text-sm sm:text-base"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                  Download Invoice
                </button>
                <Link
                  href={`/orders/${orderData?.data?.order?._id}`}
                  className="flex items-center justify-center gap-2 bg-white border-2 border-[#b91c1c] text-[#b91c1c] px-4 sm:px-6 py-3 rounded-md hover:bg-[#b91c1c] hover:text-white transition-colors font-medium text-sm sm:text-base"
                >
                  View Order Details
                </Link>
                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 sm:px-6 py-3 rounded-md hover:bg-gray-200 transition-colors font-medium text-sm sm:text-base"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Additional Information */}
              <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-600">
                <p className="mb-2">
                  A confirmation email has been sent to your registered email
                  address.
                </p>
                <p>
                  Need help? Contact our support team at{" "}
                  <span className="text-[#b91c1c]">
                    support@shivangibattery.com
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm sm:text-base">Back to Cart</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Checkout
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 text-red-500">⚠️</div>
              <p className="text-red-700 text-sm sm:text-base">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Progress Steps */}
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex flex-row items-center justify-between gap-4 sm:gap-0">
                  {[
                    { key: "address", label: "Shipping Address" },
                    { key: "payment", label: "Payment Method" },
                    { key: "review", label: "Review Order" },
                  ].map((stepItem, index) => (
                    <div key={stepItem.key} className="flex items-center">
                      <div
                        className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-medium ${
                          step === stepItem.key
                            ? "bg-[#b91c1c] text-white"
                            : index <
                              ["address", "payment", "review"].indexOf(step)
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span
                        className={`ml-1 text-xs sm:text-sm font-medium ${
                          step === stepItem.key
                            ? "text-[#b91c1c]"
                            : "text-gray-500"
                        }`}
                      >
                        <span className="hidden sm:block">
                          {stepItem.label}
                        </span>
                        <span className="block sm:hidden">
                          {stepItem.label.split(" ")[0]}
                        </span>
                      </span>
                      {index < 2 && (
                        <div
                          className={`hidden sm:block w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${
                            index <
                            ["address", "payment", "review"].indexOf(step)
                              ? "bg-green-500"
                              : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step Content */}
              <div className="p-4 sm:p-6">
                {step === "address" && (
                  <div className="space-y-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                      Shipping Address
                    </h2>

                    {/* Saved Addresses */}
                    {user?.addresses && user.addresses.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900">
                          Saved Addresses
                        </h3>
                        {user.addresses.map((address, index) => (
                          <div
                            key={address._id || index}
                            className={`border rounded-lg p-3 sm:p-4 cursor-pointer transition-colors ${
                              selectedAddressId ===
                              (address._id || index.toString())
                                ? "border-[#b91c1c] bg-[#b91c1c]/5"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => handleAddressSelect(address)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  {getAddressTypeIcon(address.addressType)}
                                  <span className="font-medium text-gray-900 text-sm sm:text-base truncate">
                                    {address.name}
                                  </span>
                                  {address.isDefault && (
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex-shrink-0">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm text-gray-600 mb-1">
                                  {address.phone}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600 break-words">
                                  {address.street}, {address.city},{" "}
                                  {address.state} - {address.pincode}
                                </p>
                                {address.landmark && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Landmark: {address.landmark}
                                  </p>
                                )}
                              </div>
                              <div
                                className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ml-2 ${
                                  selectedAddressId ===
                                  (address._id || index.toString())
                                    ? "border-[#b91c1c] bg-[#b91c1c]"
                                    : "border-gray-300"
                                }`}
                              >
                                {selectedAddressId ===
                                  (address._id || index.toString()) && (
                                  <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add New Address Button */}
                    <div className="border-t pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          setShowNewAddressForm(!showNewAddressForm)
                        }
                        className="flex items-center gap-2 text-[#b91c1c] hover:text-[#a31b1b] transition-colors text-sm sm:text-base"
                      >
                        <Plus className="w-4 h-4" />
                        {showNewAddressForm ? "Cancel" : "Add New Address"}
                      </button>
                    </div>

                    {/* New Address Form */}
                    {showNewAddressForm && (
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <h4 className="font-medium text-gray-900 mb-4 text-sm sm:text-base">
                          Add New Address
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              value={newAddress.name}
                              onChange={(e) =>
                                handleNewAddressChange("name", e.target.value)
                              }
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b91c1c] text-sm"
                              placeholder="Recipient name"
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700">
                              Phone Number *
                            </label>
                            <input
                              type="tel"
                              maxLength={10}
                              value={newAddress.phone}
                              onChange={(e) =>
                                handleNewAddressChange(
                                  "phone",
                                  e.target.value.replace(/\D/g, "")
                                )
                              }
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b91c1c] text-sm"
                              placeholder="10-digit mobile number"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs sm:text-sm font-medium text-gray-700">
                              Street Address *
                            </label>
                            <input
                              type="text"
                              value={newAddress.street}
                              onChange={(e) =>
                                handleNewAddressChange("street", e.target.value)
                              }
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b91c1c] text-sm"
                              placeholder="House/Flat number, Street name"
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700">
                              City *
                            </label>
                            <input
                              type="text"
                              value={newAddress.city}
                              onChange={(e) =>
                                handleNewAddressChange("city", e.target.value)
                              }
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b91c1c] text-sm"
                              placeholder="City"
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700">
                              State *
                            </label>
                            <input
                              type="text"
                              value={newAddress.state}
                              onChange={(e) =>
                                handleNewAddressChange("state", e.target.value)
                              }
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b91c1c] text-sm"
                              placeholder="State"
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700">
                              Pincode *
                            </label>
                            <input
                              type="text"
                              maxLength={6}
                              value={newAddress.pincode}
                              onChange={(e) =>
                                handleNewAddressChange(
                                  "pincode",
                                  e.target.value.replace(/\D/g, "")
                                )
                              }
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b91c1c] text-sm"
                              placeholder="6-digit pincode"
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700">
                              Landmark (Optional)
                            </label>
                            <input
                              type="text"
                              value={newAddress.landmark || ""}
                              onChange={(e) =>
                                handleNewAddressChange(
                                  "landmark",
                                  e.target.value
                                )
                              }
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b91c1c] text-sm"
                              placeholder="Nearby landmark"
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={handleAddNewAddress}
                            className="bg-[#b91c1c] text-white px-4 py-2 rounded-md hover:bg-[#a31b1b] transition-colors text-sm sm:text-base"
                          >
                            Use This Address
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Selected Address Display */}
                    {selectedAddressId && (
                      <div className="border-t pt-4">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3">
                          Selected Address
                        </h3>
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 text-sm sm:text-base">
                                {shippingAddress.name}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {shippingAddress.phone}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600 break-words">
                                {shippingAddress.street}, {shippingAddress.city}
                                , {shippingAddress.state} -{" "}
                                {shippingAddress.pincode}
                              </p>
                              {shippingAddress.landmark && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Landmark: {shippingAddress.landmark}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {step === "payment" && (
                  <div className="space-y-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                      Payment Method
                    </h2>
                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <label
                          key={method.id}
                          className={`flex items-center p-3 sm:p-4 border rounded-md cursor-pointer transition-colors ${
                            selectedPaymentMethod === method.id
                              ? "border-[#b91c1c] bg-[#b91c1c]/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={selectedPaymentMethod === method.id}
                            onChange={(e) =>
                              setSelectedPaymentMethod(e.target.value)
                            }
                            className="sr-only"
                          />
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center ${
                                selectedPaymentMethod === method.id
                                  ? "border-[#b91c1c]"
                                  : "border-gray-300"
                              }`}
                            >
                              {selectedPaymentMethod === method.id && (
                                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#b91c1c] rounded-full"></div>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              {method.icon}
                              <div>
                                <p className="font-medium text-gray-900 text-sm sm:text-base">
                                  {method.name}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600">
                                  {method.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {step === "review" && (
                  <div className="space-y-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                      Review Order
                    </h2>

                    {/* Shipping Address */}
                    <div>
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3">
                        Shipping Address
                      </h3>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 text-sm sm:text-base">
                              {shippingAddress.name}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {shippingAddress.phone}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 break-words">
                              {shippingAddress.street}, {shippingAddress.city},{" "}
                              {shippingAddress.state} -{" "}
                              {shippingAddress.pincode}
                            </p>
                            {shippingAddress.landmark && (
                              <p className="text-xs text-gray-500 mt-1">
                                Landmark: {shippingAddress.landmark}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3">
                        Payment Method
                      </h3>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          {
                            paymentMethods.find(
                              (m) => m.id === selectedPaymentMethod
                            )?.icon
                          }
                          <span className="font-medium text-gray-900 text-sm sm:text-base">
                            {
                              paymentMethods.find(
                                (m) => m.id === selectedPaymentMethod
                              )?.name
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order Notes */}
                    <div>
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3">
                        Order Notes (Optional)
                      </h3>
                      <textarea
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b91c1c] text-sm"
                        placeholder="Any special instructions for delivery..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 sticky top-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-4">
                {cart?.items
                  ?.filter((item) => item.product !== null)
                  ?.map((item) => (
                    <div key={item._id} className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                        {item.product?.images && item.product.images.length > 0 ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <span className="text-xs text-gray-500">IMG</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                          {item.product?.name || "Product Unavailable"}
                        </p>
                        <p className="text-xs text-gray-600">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-gray-900 flex-shrink-0">
                        ₹{item.price}
                      </p>
                    </div>
                  ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">₹{cart?.total || 0}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">Free</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span className="text-gray-900 text-sm sm:text-base">
                    Total
                  </span>
                  <span className="text-gray-900 text-sm sm:text-base">
                    ₹{cart?.total || 0}
                  </span>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="mt-6 space-y-3">
                {step !== "address" && (
                  <button
                    onClick={handlePreviousStep}
                    className="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  >
                    Back
                  </button>
                )}

                {step !== "review" ? (
                  <button
                    onClick={handleNextStep}
                    className="w-full bg-[#b91c1c] text-white py-2 rounded-md hover:bg-[#a31b1b] transition-colors text-sm sm:text-base"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="w-full bg-[#b91c1c] text-white py-2 rounded-md hover:bg-[#a31b1b] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Placing Order...
                      </>
                    ) : (
                      "Place Order"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
