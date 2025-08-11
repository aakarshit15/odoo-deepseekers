"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your login logic here
    console.log(formData);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1E1E1E] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#2ECC71]">
            QUICKCOURT
          </h1>
          <h2 className="text-lg sm:text-xl font-semibold text-[#2D3436] dark:text-white">
            LOGIN
          </h2>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-[#2D3436] dark:text-white"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-[#2D3436] dark:text-white"
            >
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            className="w-full bg-[#2ECC71] hover:bg-[#27AE60] text-white font-medium"
          >
            Login
          </Button>

          {/* Links */}
          <div className="space-y-2 text-center text-sm">
            <div>
              <span className="text-[#636E72]">
                Don&apos;t have an account?{" "}
              </span>
              <Link
                href="/signup"
                className="text-[#2ECC71] hover:underline font-medium"
              >
                Sign up
              </Link>
            </div>
            <div>
              <Link
                href="/forgot-password"
                className="text-[#2ECC71] hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
