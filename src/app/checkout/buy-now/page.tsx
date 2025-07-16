"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Product } from "@/lib/api";
import {
  Home,
  Building,
  Map,
  ArrowLeft,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  Package,
  AlertTriangle,
} from "lucide-react";

interface ShippingAddress {
  _id?: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault?: boolean;
  addressType?: "home" | "work" | "other";
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

function BuyNowCheckoutPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const productId = searchParams.get("productId");
  const quantity = parseInt(searchParams.get("quantity") || "1", 10);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<
    "address" | "payment" | "review" | "success"
  >("address");
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
    landmark: "",
  });
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<ShippingAddress>({
    name: user?.name || "",
    phone: user?.phone || "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("cod");
  // No order notes or orderData needed for Buy Now flow
  const [purchasing, setPurchasing] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: "cod",
      name: "Cash on Delivery",
      description: "Pay when you receive your order",
      icon: <Truck className="w-5 h-5 text-black" />,
    },
    {
      id: "card",
      name: "Credit/Debit Card",
      description: "Pay securely with your card",
      icon: <CreditCard className="w-5 h-5 text-black" />,
    },
  ];

  useEffect(() => {
    if (!productId) {
      setError("No product specified.");
      setLoading(false);
      return;
    }
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();
        if (data.success) {
          setProduct(data.data);
        } else {
          setError(data.message || "Product not found.");
        }
      } catch {
        setError("Failed to load product.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  // Pre-fill address if user has one
  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      const defaultAddress = user.addresses.find((addr: any) => addr.isDefault);
      const firstAddress = user.addresses[0];
      const addressToUse = defaultAddress || firstAddress;
      setSelectedAddressId(addressToUse._id || "0");
      setShippingAddress({
        ...addressToUse,
        name:
          addressToUse.name == "" ? user.name || "" : addressToUse.name || "",
        phone:
          addressToUse.phone == ""
            ? user.phone || ""
            : addressToUse.phone || "",
      });
    }
  }, [user]);

  const handleAddressSelect = (address: ShippingAddress) => {
    setSelectedAddressId(address._id || "0");
    setShippingAddress({
      ...address,
      name: address.name ?? "",
      phone: address.phone ?? "",
    });
    setShowNewAddressForm(false);
  };

  const handleNewAddressChange = (
    field: keyof ShippingAddress,
    value: string
  ) => {
    setNewAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddNewAddress = async () => {
    if (
      !newAddress.street ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.pincode
    ) {
      setError("Please fill in all required address fields");
      return;
    }
    try {
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
        updateUser(data.data.user);
        setShippingAddress(newAddress);
        setSelectedAddressId("new");
        setShowNewAddressForm(false);
        setError(null);
      } else {
        setError(data.message || "Failed to save address");
      }
    } catch {
      setError("Failed to save address. You can still proceed with the order.");
      setShippingAddress(newAddress);
      setSelectedAddressId("new");
      setShowNewAddressForm(false);
    }
  };

  // Function to use current location and autofill address
  const handleUseCurrentLocation = async () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://us1.locationiq.com/v1/reverse.php?key=${process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY}&lat=${latitude}&lon=${longitude}&format=json`
          );
          if (!response.ok) {
            setError("Failed to fetch address from location (network error)");
            setLocationLoading(false);
            return;
          }
          const data = await response.json();
          if (!data.address) {
            setError("No address found for your location.");
            setLocationLoading(false);
            return;
          }
          const address = data.address;
          setNewAddress((prev) => ({
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
          setError("Failed to fetch address from location");
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationLoading(false);
        setError("Unable to retrieve your location. Add Manually");
      }
    );
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case "home":
        return <Home className="w-4 h-4 text-black" />;
      case "work":
        return <Building className="w-4 h-4 text-black" />;
      default:
        return <Map className="w-4 h-4 text-black" />;
    }
  };

  const handleNextStep = () => {
    if (step === "address") {
      if (
        !selectedAddressId ||
        !shippingAddress.street ||
        !shippingAddress.city ||
        !shippingAddress.state ||
        !shippingAddress.pincode
      ) {
        setShowNewAddressForm((v) => !v);
        setNewAddress({
          name: user?.name || "",
          phone: user?.phone || "",
          street: "",
          city: "",
          state: "",
          pincode: "",
          isDefault: false,
          addressType: "home",
          landmark: "",
        });
        setError("Please select or add a shipping address.");
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
    if (!product || !user) return;
    setPurchasing(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Authentication required");
      const orderData = {
        items: [{ productId: product._id, quantity }],
        shippingAddress,
        paymentMethod: selectedPaymentMethod,
        total: product.price * quantity,
      };
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });
      const data: { success: boolean; message?: string } =
        await response.json();
      if (!data.success)
        throw new Error(data.message || "Failed to place order");
      setStep("success");
    } catch (err: unknown) {
      if (typeof err === "object" && err && "message" in err) {
        setError(
          (err as { message?: string }).message || "Failed to place order"
        );
      } else {
        setError("Failed to place order");
      }
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-black">
        Loading...
      </div>
    );
  }
  if (!product) return null;

  // Success Page
  if (step === "success") {
    return (
      <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 sm:p-8 text-center text-white">
              <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4" />
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-white">
                Order Placed Successfully!
              </h1>
              <p className="text-green-100 text-base sm:text-lg">
                Thank you for your order.
              </p>
            </div>
            <div className="p-6 sm:p-8">
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
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                  Order Summary
                </h3>
                <div className="flex gap-4 items-center mb-4">
                  <div className="w-20 h-20 relative flex-shrink-0">
                    <Image
                      src={
                        product.images &&
                        typeof product.images[0] === "string" &&
                        product.images[0]
                          ? product.images[0]
                          : "/public/placeholder.png"
                      }
                      alt={
                        typeof product.name === "string"
                          ? product.name
                          : "Product image"
                      }
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{product.name}</div>
                    <div className="text-gray-600 text-sm mb-1">
                      {product.brand}
                    </div>
                    <div className="text-gray-700">Qty: {quantity}</div>
                    <div className="text-[#b91c1c] font-bold text-xl mt-2">
                      ₹{(product.price * quantity).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm sm:text-base text-gray-600">
                      Order Total:
                    </span>
                    <span className="font-semibold text-sm sm:text-base">
                      ₹{(product.price * quantity).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm sm:text-base text-gray-600">
                      Payment Method:
                    </span>
                    <span className="font-semibold capitalize text-sm sm:text-base">
                      {selectedPaymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm sm:text-base text-gray-600">
                      Order Status:
                    </span>
                    <span className="font-semibold text-green-600 capitalize text-sm sm:text-base">
                      Confirmed
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link
                  href="/profile?tab=orders"
                  className="flex items-center justify-center gap-2 bg-white border-2 border-[#b91c1c] text-[#b91c1c] px-4 sm:px-6 py-3 rounded-md hover:bg-[#b91c1c] hover:text-white transition-colors font-medium text-sm sm:text-base"
                >
                  View Orders
                </Link>
                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 sm:px-6 py-3 rounded-md hover:bg-gray-200 transition-colors font-medium text-sm sm:text-base"
                >
                  Continue Shopping
                </Link>
              </div>
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

  // Main Multi-Step UI
  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Progress Steps */}
        <div className="mb-6">
          <div className="flex flex-row items-center gap-4 sm:gap-0">
            {[
              { key: "address", label: "Shipping Address" },
              { key: "payment", label: "Payment Method" },
              { key: "review", label: "Review Order" },
            ].map((stepItem, index) => (
              <div
                key={stepItem.key}
                className="flex items-center cursor-pointer"
                onClick={() => {
                  if (step == "address" && !selectedAddressId) {
                    return;
                  }
                  if (step === stepItem.key) {
                    return;
                  }
                  setStep(stepItem.key as "address" | "payment" | "review");
                }}
              >
                <div
                  className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-medium ${
                    step === stepItem.key
                      ? "bg-[#b91c1c] text-white"
                      : index < ["address", "payment", "review"].indexOf(step)
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`ml-1 text-xs sm:text-sm font-medium ${
                    step === stepItem.key ? "text-[#b91c1c]" : "text-gray-500"
                  }`}
                >
                  <span className="hidden sm:block">{stepItem.label}</span>
                  <span className="block sm:hidden">
                    {stepItem.label.split(" ")[0]}
                  </span>
                </span>
                {index < 2 && (
                  <div
                    className={`hidden sm:block w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${
                      index < ["address", "payment", "review"].indexOf(step)
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
        <div className="bg-white rounded-lg shadow-md overflow-hidden p-4 sm:p-6">
          {step === "address" && (
            <div className="space-y-6">
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => router.back()}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNextStep}
                  className="bg-[#b91c1c] text-white flex items-center gap-2 px-6 py-2 rounded-md font-medium hover:bg-[#a31b1b] transition-colors"
                >
                  {!selectedAddressId ||
                  !shippingAddress.street ||
                  !shippingAddress.city ||
                  !shippingAddress.state ||
                  !shippingAddress.pincode ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />{" "}
                      Address missing
                    </>
                  ) : (
                    "Next"
                  )}
                </button>
              </div>
              {error && (
                <div
                  onClick={() => setError(null)}
                  className="text-lg border p-1 rounded-md border-red-500 font-semibold mb-2 text-red-500 cursor-pointer"
                >
                  ⚠️ {error}
                </div>
              )}
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Shipping Address
              </h2>
              {/* Saved Addresses */}
              {user?.addresses && user.addresses.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">
                    Saved Addresses
                  </h3>
                  {user.addresses.map((address: any, index: number) => (
                    <div
                      key={address._id || index}
                      className={`border rounded-lg p-3 sm:p-4 cursor-pointer transition-colors ${
                        selectedAddressId === (address._id || index.toString())
                          ? "border-[#b91c1c] bg-[#b91c1c]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleAddressSelect(address)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {getAddressTypeIcon(address.addressType ?? "home")}
                            <span className="font-medium text-gray-900 text-sm sm:text-base truncate">
                              {address.name ?? user?.name}
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-700">
                            {address.street}, {address.city}, {address.state} -{" "}
                            {address.pincode}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">
                            {address.phone ?? user?.phone ?? ""}
                          </div>
                        </div>
                        {address.isDefault && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full ml-2">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* New Address Form Toggle */}
              <button
                onClick={() => {
                  setShowNewAddressForm((v) => !v);
                  setNewAddress({
                    name: user?.name || "",
                    phone: user?.phone || "",
                    street: "",
                    city: "",
                    state: "",
                    pincode: "",
                    isDefault: false,
                    addressType: "home",
                    landmark: "",
                  });
                }}
                className="mt-4 text-[#b91c1c] underline text-sm font-medium"
              >
                {showNewAddressForm ? "Cancel" : "Add New Address"}
              </button>
              {/* New Address Form */}
              {showNewAddressForm && (
                <div className="mt-4 space-y-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-base font-medium text-gray-900 mb-2">
                    Add New Address
                  </h3>
                  <div className="mb-3">
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={locationLoading}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {locationLoading ? (
                        <span className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"></span>
                      ) : (
                        <Map className="w-4 h-4" />
                      )}
                      Use Current Location
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-[#b91c1c] focus:ring-[#b91c1c] focus:ring-1 focus:outline-none transition"
                        value={newAddress.name}
                        onChange={(e) =>
                          handleNewAddressChange("name", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-[#b91c1c] focus:ring-[#b91c1c] focus:ring-1 focus:outline-none transition"
                        value={newAddress.phone}
                        onChange={(e) =>
                          handleNewAddressChange("phone", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-[#b91c1c] focus:ring-[#b91c1c] focus:ring-1 focus:outline-none transition"
                        value={newAddress.street}
                        onChange={(e) =>
                          handleNewAddressChange("street", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-[#b91c1c] focus:ring-[#b91c1c] focus:ring-1 focus:outline-none transition"
                        value={newAddress.city}
                        onChange={(e) =>
                          handleNewAddressChange("city", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-[#b91c1c] focus:ring-[#b91c1c] focus:ring-1 focus:outline-none transition"
                        value={newAddress.state}
                        onChange={(e) =>
                          handleNewAddressChange("state", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-[#b91c1c] focus:ring-[#b91c1c] focus:ring-1 focus:outline-none transition"
                        value={newAddress.pincode}
                        onChange={(e) =>
                          handleNewAddressChange("pincode", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Landmark (optional)
                      </label>
                      <input
                        type="text"
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-[#b91c1c] focus:ring-[#b91c1c] focus:ring-1 focus:outline-none transition"
                        value={newAddress.landmark}
                        onChange={(e) =>
                          handleNewAddressChange("landmark", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleAddNewAddress}
                    className="w-full bg-[#b91c1c] text-white py-2 rounded-md font-medium hover:bg-[#a31b1b] transition-colors mt-4"
                  >
                    Save Address
                  </button>
                </div>
              )}
            </div>
          )}
          {step === "payment" && (
            <div className="space-y-6">
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={handlePreviousStep}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  className="bg-[#b91c1c] text-white px-6 py-2 rounded-md font-medium hover:bg-[#a31b1b] transition-colors"
                >
                  Next
                </button>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Payment Method
              </h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedPaymentMethod === method.id
                        ? "border-[#b91c1c] bg-[#b91c1c]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    {method.icon}
                    <div>
                      <div className="font-medium text-gray-900">
                        {method.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {method.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {step === "review" && (
            <div className="space-y-6">
              <div className="flex flex-row gap-2 justify-end mt-6">
                <button
                  onClick={handlePreviousStep}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={purchasing}
                  className="bg-[#b91c1c] text-white px-6 py-2 rounded-md font-medium hover:bg-[#a31b1b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {purchasing ? "Placing Order..." : "Place Order"}
                </button>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Review Order
              </h2>
              <div
                className="bg-gray-50 rounded-lg p-4 flex gap-4 items-center mb-4 cursor-pointer"
                onClick={() => router.push(`/products/${product._id}`)}
              >
                <div className="w-20 h-20 relative flex-shrink-0">
                  <Image
                    src={
                      product.images &&
                      typeof product.images[0] === "string" &&
                      product.images[0]
                        ? product.images[0]
                        : "/public/placeholder.png"
                    }
                    alt={
                      typeof product.name === "string"
                        ? product.name
                        : "Product image"
                    }
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div>
                  <div
                    className="font-semibold text-md text-black truncate"
                    title={typeof product.name === "string" ? product.name : ""}
                  >
                    {product.name}
                  </div>
                  <div className="text-gray-700">Qty: {quantity}</div>
                  <div className="text-[#b91c1c] font-bold text-xl mt-2">
                    ₹{(product.price * quantity).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base text-gray-600">
                    Order Total:
                  </span>
                  <span className="font-semibold text-sm sm:text-base">
                    ₹{(product.price * quantity).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base text-gray-600">
                    Payment Method:
                  </span>
                  <span className="font-semibold capitalize text-sm sm:text-base">
                    {selectedPaymentMethod}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mt-4 border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">
                  Shipping Address
                </h3>
                <div className="text-sm text-gray-700">
                  {shippingAddress.name}, {shippingAddress.phone}
                  <br />
                  {shippingAddress.street}, {shippingAddress.city},{" "}
                  {shippingAddress.state} - {shippingAddress.pincode}
                  {shippingAddress.landmark && (
                    <>, {shippingAddress.landmark}</>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BuyNowCheckoutPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BuyNowCheckoutPageInner />
    </Suspense>
  );
}
