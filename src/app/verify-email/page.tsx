"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import {
  getStoredEmailForVerification,
  clearStoredEmailForVerification,
  storeAuthTokens,
  storeUserData,
} from "@/lib/auth";
import axios from "axios";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Get stored email
    const storedEmail = getStoredEmailForVerification();
    if (!storedEmail) {
      // If no email is stored, redirect to signup
      router.replace("/signup");
      return;
    }
    setEmail(storedEmail);
  }, [router]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0]; // Only take the first character if multiple characters are pasted
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      // Move to previous input on backspace if current input is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length; i++) {
      if (i < 6) {
        newOtp[i] = pastedData[i];
      }
    }

    setOtp(newOtp);

    // Focus the next empty input or the last input
    const nextEmptyIndex = newOtp.findIndex((val) => val === "");
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    if (!email) return;

    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast.error("Please enter the complete OTP");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/verify-otp`,
        {
          email: email,
          code: otpString,
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      // if (response.error) {
      //   toast.error(response.error);
      //   return;
      // }

      if (
        response.data &&
        typeof response.data === "object" &&
        response.data !== null
      ) {
        const data = response.data as {
          access: string;
          refresh: string;
          user: any;
        };
        // Store auth tokens and user data
        storeAuthTokens({
          access: data.access,
          refresh: data.refresh,
        });
        storeUserData(data.user);

        // Clear stored email
        clearStoredEmailForVerification();

        toast.success("Email verified successfully!");

        // Redirect to login
        router.replace("/login");
      }
    } catch (error) {
      toast.error("Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;

    setIsResending(true);

    try {
      const response = await authApi.resendOtp({ email });

      if (response.error) {
        toast.error(response.error);
        return;
      }

      toast.success("OTP resent successfully!");
      // Clear current OTP
      setOtp(["", "", "", "", "", ""]);
      // Focus first input
      inputRefs.current[0]?.focus();
    } catch (error) {
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1E1E1E] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#2ECC71]">
            QUICKCOURT
          </h1>
          <div className="flex items-center justify-center gap-2 text-lg sm:text-xl font-semibold text-[#2D3436] dark:text-white">
            <Lock className="w-5 h-5" />
            <h2>VERIFY YOUR EMAIL</h2>
          </div>
        </div>

        <div className="text-center space-y-4">
          <p className="text-sm text-[#636E72]">
            We&apos;ve sent a code to your email:
          </p>
          <p className="text-sm font-medium text-[#2ECC71]">{email}</p>
        </div>

        <div className="space-y-6">
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el: HTMLInputElement | null) => {
                  if (el) {
                    inputRefs.current[index] = el;
                  }
                }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-11 h-11 text-center text-lg font-semibold p-0"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            ))}
          </div>

          <Button
            onClick={handleVerify}
            className="w-full bg-[#2ECC71] hover:bg-[#27AE60] text-white font-medium"
          >
            Verify & Continue
          </Button>

          <div className="text-center space-y-2 text-sm">
            <div>
              <span className="text-[#636E72]">
                Didn&apos;t receive the code?{" "}
              </span>
              <button
                onClick={handleResend}
                className="text-[#2ECC71] hover:underline font-medium"
              >
                Resend OTP
              </button>
            </div>
            <div>
              <span className="text-[#636E72]">Wrong email? </span>
              <Link
                href="/signup"
                className="text-[#2ECC71] hover:underline font-medium"
              >
                Edit Email
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
