"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
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

  console.log("hello world!!! topper");
  const cityRef = useRef<HTMLInputElement>(null);
  const localityRef = useRef<HTMLInputElement>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<string>();
  const [profileImage, setProfileImage] = useState<string>();
  const [formData, setFormData] = useState({
    fullName: "",
    role: "",
    email: "",
    password: "",
    confirmPassword: "",
    city: "",
    locality: "",
    fullAddress: "",
    latitude: "",
    longitude: "",
    avatar: null as File | null,
  });

  const handleUserTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadScript = (url: string) => {
      const script = document.createElement("script");
      script.src = url;
      script.async = true;
      document.head.appendChild(script);
    };

    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!googleMapsApiKey) {
      console.error("Google Maps API key is not configured");
      return;
    }

    if (!(window as any).google) {
      loadScript(
        `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`
      );
    }

    const initAutocomplete = () => {
      const google = (window as any).google;
      if (!google?.maps?.places) {
        console.error("Google Maps Places API not loaded");
        return;
      }

      // City autocomplete
      const cityAutocomplete = new google.maps.places.Autocomplete(
        cityRef.current!,
        {
          componentRestrictions: { country: "in" },
          types: ["(cities)"],
        }
      );

      cityAutocomplete.addListener("place_changed", () => {
        const place = cityAutocomplete.getPlace();
        if (!place.address_components) {
          console.error("No address components found");
          return;
        }

        const cityComponent = place.address_components?.find(
          (c: { types: string[]; long_name: string }) =>
            c.types.includes("locality") ||
            c.types.includes("administrative_area_level_2")
        );

        if (cityComponent) {
          const coordinates = {
            lat: place.geometry?.location?.lat(),
            lng: place.geometry?.location?.lng(),
          };

          // Use the full formatted text for the city input
          const selectedCity =
            place.formatted_address || place.name || cityComponent.long_name;

          setFormData((prev) => ({
            ...prev,
            city: selectedCity,
            fullAddress: place.formatted_address || "",
            latitude: coordinates.lat ? coordinates.lat.toString() : "",
            longitude: coordinates.lng ? coordinates.lng.toString() : "",
            // Clear locality when city changes
            locality: "",
          }));
        }
      });

      // Locality autocomplete
      const localityAutocomplete = new google.maps.places.Autocomplete(
        localityRef.current!,
        {
          componentRestrictions: { country: "in" },
          types: ["geocode"],
        }
      );

      localityAutocomplete.addListener("place_changed", () => {
        const place = localityAutocomplete.getPlace();
        if (!place.address_components) {
          console.error("No address components found");
          return;
        }

        const localityComponent = place.address_components?.find(
          (c: { types: string[]; long_name: string }) =>
            c.types.includes("sublocality") ||
            c.types.includes("sublocality_level_1") ||
            c.types.includes("neighborhood")
        );

        const cityComponent = place.address_components?.find(
          (c: { types: string[]; long_name: string }) =>
            c.types.includes("locality") ||
            c.types.includes("administrative_area_level_2")
        );

        const coordinates = {
          lat: place.geometry?.location?.lat(),
          lng: place.geometry?.location?.lng(),
        };

        // Get the selected locality name from the place
        const selectedLocality =
          place.formatted_address ||
          place.name ||
          localityComponent?.long_name ||
          "";

        setFormData((prev) => ({
          ...prev,
          // Update city if it was empty or different
          city: prev.city || cityComponent?.long_name || "",
          // Update locality from the selected place
          locality: selectedLocality,
          // Always update full address and coordinates
          fullAddress: place.formatted_address || "",
          latitude: coordinates.lat ? coordinates.lat.toString() : "",
          longitude: coordinates.lng ? coordinates.lng.toString() : "",
        }));
      });
    };

    // Wait for script load
    const interval = setInterval(() => {
      if ((window as any).google?.maps) {
        initAutocomplete();
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        // 1 MB
        alert("Please upload an image smaller than 1 MB");
        return;
      }
      // Store the file object in form state
      setFormData((prev) => ({ ...prev, avatar: file }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // ... your existing validation code ...
  
    setIsLoading(true);
  
    try {
      // Create FormData object with correct field names
      const formDataToSend = new FormData();
  
      // Append all form fields
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("role", formData.role || "");
  
      // Append location data with correct field names
      if (formData.city) formDataToSend.append("city", formData.city);
      if (formData.locality) formDataToSend.append("locality", formData.locality);
      if (formData.fullAddress) formDataToSend.append("full_address", formData.fullAddress); // ✅ Key change
      if (formData.latitude) formDataToSend.append("latitude", formData.latitude);
      if (formData.longitude) formDataToSend.append("longitude", formData.longitude);
  
      // Append avatar file if it exists
      if (formData.avatar) {
        formDataToSend.append("avatar", formData.avatar);
      }
  
      // Debug: Log what's being sent
      console.log("FormData contents:");
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }
  
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/signup/`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      if (response.data) {
        storeEmailForVerification(formData.email);
        toast.success("Sign up successful! Please verify your email.");
        router.push("/verify-email");
      }
    } catch (axiosError: any) {
      const errorMessage =
        axiosError.response?.data?.message ||
        "An error occurred during sign up";
      alert(errorMessage);
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

        <form className="space-y-6">
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
            <Select onValueChange={handleUserTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Player / Facility Owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Player</SelectItem>
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

          {/* Location Fields - Shown for all users */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#2D3436] dark:text-white">
                City
              </label>
              <Input
                type="text"
                placeholder="Search for your city"
                ref={cityRef}
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
                placeholder="Search for your locality or area"
                ref={localityRef}
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
                placeholder="Full address will be generated automatically"
                value={formData.fullAddress}
                disabled
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2D3436] dark:text-white">
                  Latitude
                </label>
                <Input
                  type="text"
                  placeholder="Will be set automatically"
                  value={formData.latitude}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2D3436] dark:text-white">
                  Longitude
                </label>
                <Input
                  type="text"
                  placeholder="Will be set automatically"
                  value={formData.longitude}
                  disabled
                />
              </div>
            </div>
          </div>

          <Button
            // type="submit"
            onClick={(e) => {handleSubmit(e)}}
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