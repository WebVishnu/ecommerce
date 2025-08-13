"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Head from "next/head";
import { getPrimaryColor } from "@/config/company-config";

export default function OtpAuthPage() {
  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [pendingRedirect, setPendingRedirect] = useState<{
    requiresProfileCompletion: boolean;
  } | null>(null);
  const router = useRouter();
  const { login, user, isAuthenticated, isHydrated } = useAuth();
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if user is already authenticated
  useEffect(() => {
    if (!isHydrated) return; // Wait for auth to hydrate

    if (isAuthenticated && user) {
      router.push("/");
      return;
    }

    // User is not authenticated, allow access to login page
    setCheckingAuth(false);
  }, [isAuthenticated, isHydrated, router, user]);

  // Handle redirect after successful login
  useEffect(() => {
    if (isAuthenticated && user && pendingRedirect) {
      if (pendingRedirect.requiresProfileCompletion) {
        router.push("/auth/profile-complete");
      } else {
        router.push("/");
      }
      setPendingRedirect(null);
    }
  }, [isAuthenticated, user, pendingRedirect, router]);


  // Cleanup countdown timer on unmount
  useEffect(() => {
    return () => {
      // Clear any existing countdown timer when component unmounts
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      setCountdown(0);
    };
  }, []);

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 
            className="w-8 h-8 animate-spin mx-auto mb-4" 
            style={{ color: getPrimaryColor() }}
          />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to send OTP");
      }

      setStep("otp");
      setInfo("OTP sent to your mobile number");

      // Start countdown for resend (use backend expiration time or default to 2 minutes)
      const resendTime = data.expiresIn
        ? Math.min(data.expiresIn - 180, 120)
        : 120; // 3 minutes before OTP expires, max 2 minutes

      setCountdown(resendTime);

      // Clear any existing timer
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }

      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownTimerRef.current) {
              clearInterval(countdownTimerRef.current);
              countdownTimerRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Invalid OTP");
      }

      // Login using auth context
      login(data.data.token, data.data.user);

      // Set pending redirect - the useEffect will handle the actual redirect
      setPendingRedirect({
        requiresProfileCompletion: data.data.requiresProfileCompletion,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to resend OTP");
      }

      setInfo("OTP resent successfully");
      setOtp(""); // Clear previous OTP

      // Start countdown again (use backend expiration time or default to 2 minutes)
      const resendTime = data.expiresIn
        ? Math.min(data.expiresIn - 180, 120)
        : 120; // 3 minutes before OTP expires, max 2 minutes

      setCountdown(resendTime);

      // Clear any existing timer
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }

      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownTimerRef.current) {
              clearInterval(countdownTimerRef.current);
              countdownTimerRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      console.error("❌ Resend OTP error:", err);
      setError(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Head>
        <script src="https://widget.msg91.com/otp/v2/widget.min.js"></script>
      </Head>
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">
          {step === "mobile" ? "Sign In / Register" : "Verify OTP"}
        </h1>

        {step === "mobile" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label
                htmlFor="mobile"
                className="block text-sm font-medium text-gray-700"
              >
                Mobile Number
              </label>
              <input
                id="mobile"
                type="tel"
                pattern="[0-9]{10}"
                maxLength={10}
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ 
                  '--tw-ring-color': getPrimaryColor(),
                  '--tw-ring-opacity': '0.5'
                } as React.CSSProperties}
                placeholder="Enter your 10-digit mobile number"
              />
              <p className="mt-1 text-xs text-gray-500">
                We&apos;ll send you a 4-digit OTP to verify your number
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || mobile.length !== 10}
              className="w-full text-white py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ 
                backgroundColor: getPrimaryColor(),
                '--hover-color': getPrimaryColor() + 'dd'
              } as React.CSSProperties}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Send OTP"
              )}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">
                Enter the 4-digit code sent to
              </p>
              <p className="font-medium text-gray-900">+91 {mobile}</p>
              <p className="text-xs text-gray-500 mt-1">
                OTP expires in 5 minutes
              </p>
            </div>

            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700"
              >
                Enter OTP
              </label>
              <input
                id="otp"
                type="text"
                pattern="[0-9]{4}"
                maxLength={4}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent tracking-widest text-lg text-center"
                style={{ 
                  '--tw-ring-color': getPrimaryColor(),
                  '--tw-ring-opacity': '0.5'
                } as React.CSSProperties}
                placeholder="4-digit OTP"
                autoFocus
              />
            </div>
            {/* MSG91 OTP Widget */}
            <div id="otp_widget" className="my-4"></div>
            <button
              type="submit"
              disabled={loading || otp.length !== 4}
              className="w-full text-white py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ 
                backgroundColor: getPrimaryColor(),
                '--hover-color': getPrimaryColor() + 'dd'
              } as React.CSSProperties}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Verify OTP"
              )}
            </button>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={countdown > 0 || loading}
                className="text-sm disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-1 mx-auto"
                style={{ 
                  color: getPrimaryColor(),
                  '--hover-color': getPrimaryColor() + 'dd'
                } as React.CSSProperties}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Resending...
                  </>
                ) : countdown > 0 ? (
                  `Resend in ${formatCountdown(countdown)}`
                ) : (
                  "Resend OTP"
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("mobile");
                  setOtp("");
                  setCountdown(0);
                  setError(null);
                  setInfo(null);
                }}
                className="flex items-center justify-center gap-1 text-sm text-gray-500 w-full"
                style={{ 
                  '--hover-color': getPrimaryColor()
                } as React.CSSProperties}
              >
                <ArrowLeft className="w-4 h-4" />
                Change mobile number
              </button>
            </div>
          </form>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {info && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-600 text-sm text-center">{info}</p>
          </div>
        )}
      </div>
    </div>
  );
}
