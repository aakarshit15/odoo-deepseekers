"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { validatePassword, storeEmailForVerification } from "@/lib/auth";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<string>();
  const [profileImage, setProfileImage] = useState<string>();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    city: "",
    locality: "",
    fullAddress: "",
    latitude: "",
    longitude: "",
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        // 1 MB
        alert("Please upload an image smaller than 1 MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.error);
      return;
    }

    // Validate email
    if (!formData.email) {
      toast.error("Email is required");
      return;
    }

    // Validate full name
    if (!formData.fullName) {
      toast.error("Full name is required");
      return;
    }

    // Validate user type
    if (!userType) {
      toast.error("Please select your role");
      return;
    }

    setIsLoading(true);

    try {
      // Prepare location data
      const locationData: any = {};
      if (formData.city) locationData.city = formData.city;
      if (formData.locality) locationData.locality = formData.locality;
      if (formData.fullAddress)
        locationData.full_address = formData.fullAddress;
      if (formData.latitude)
        locationData.latitude = parseFloat(formData.latitude);
      if (formData.longitude)
        locationData.longitude = parseFloat(formData.longitude);

      const response = await authApi.signup({
        email: formData.email,
        password: formData.password,
        username: formData.fullName,
        role: userType,
        avatar: profileImage,
        ...locationData,
      });

      if (response.error) {
        toast.error(response.error);
        return;
      }

      // Store email for OTP verification
      storeEmailForVerification(formData.email);

      // Show success message
      toast.success("Sign up successful! Please verify your email.");

      // Redirect to verify email page
      router.push("/verify-email");
    } catch (error) {
      toast.error("An error occurred during sign up");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1E1E1E] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#2ECC71] text-center mb-2">
          QUICKCOURT
        </h1>
        <h2 className="text-lg sm:text-xl font-semibold text-[#2D3436] dark:text-white text-center mb-8">
          SIGN UP
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span className="text-sm">Profile Picture</span>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="profile-image"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("profile-image")?.click()}
            >
              Upload Photo
            </Button>
          </div>

          {/* User Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2D3436] dark:text-white">
              Sign up as
            </label>
            <Select onValueChange={setUserType}>
              <SelectTrigger>
                <SelectValue placeholder="Player / Facility Owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="player">Player</SelectItem>
                <SelectItem value="owner">Facility Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2D3436] dark:text-white">
              Full Name
            </label>
            <Input
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2D3436] dark:text-white">
              Email
            </label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2D3436] dark:text-white">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="8-20 characters, 1 uppercase, 1 number, 1 symbol"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
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

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2D3436] dark:text-white">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          {/* Location Fields - Only shown for facility owners */}
          {userType === "owner" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2D3436] dark:text-white">
                  City
                </label>
                <Input
                  type="text"
                  placeholder="Enter your city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2D3436] dark:text-white">
                  Locality/Area
                </label>
                <Input
                  type="text"
                  placeholder="Enter your locality or area"
                  value={formData.locality}
                  onChange={(e) =>
                    setFormData({ ...formData, locality: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2D3436] dark:text-white">
                  Full Address
                </label>
                <Input
                  type="text"
                  placeholder="Enter your complete address"
                  value={formData.fullAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, fullAddress: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#2D3436] dark:text-white">
                    Latitude
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter latitude"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#2D3436] dark:text-white">
                    Longitude
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter longitude"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-[#2ECC71] hover:bg-[#27AE60]"
            disabled={isLoading}
          >
            {isLoading ? "Signing up..." : "Sign Up"}
          </Button>

          <p className="text-sm text-center text-[#636E72]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#2ECC71] hover:underline">
              Log In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
