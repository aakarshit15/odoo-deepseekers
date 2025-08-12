"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, User, Mail, MapPin, Edit, Save, X } from "lucide-react";
import { toast } from "sonner";
import { profileApi } from "@/lib/api";
import { getUserData, storeUserData } from "@/lib/auth";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  avatar: string | null;
  city: string;
  locality: string;
  full_address: string;
  latitude: string;
  longitude: string;
  is_active: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    city: "",
    locality: "",
    full_address: "",
    latitude: "",
    longitude: "",
  });

  // Check authentication
  useEffect(() => {
    const userData = getUserData();
    if (!userData) {
      toast.error("Please log in to view your profile");
      router.push("/login");
      return;
    }
  }, [router]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await profileApi.getProfile();
        if (response.error) {
          toast.error("Failed to load profile: " + response.error);
        } else if (response.data) {
          setProfile(response.data);
          setFormData({
            username: response.data.username || "",
            city: response.data.city || "",
            locality: response.data.locality || "",
            full_address: response.data.full_address || "",
            latitude: response.data.latitude || "",
            longitude: response.data.longitude || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData = {
        username: formData.username,
        city: formData.city,
        locality: formData.locality,
        full_address: formData.full_address,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };

      const response = await profileApi.updateProfile(updateData);
      if (response.error) {
        toast.error("Failed to update profile: " + response.error);
      } else {
        toast.success("Profile updated successfully!");
        setProfile(response.data);
        storeUserData(response.data); // Update stored user data
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        city: profile.city || "",
        locality: profile.locality || "",
        full_address: profile.full_address || "",
        latitude: profile.latitude || "",
        longitude: profile.longitude || "",
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1E1E1E] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#2ECC71] mx-auto mb-4" />
          <p className="text-[#636E72]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1E1E1E] flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-[#636E72] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#2D3436] dark:text-white mb-2">
            Profile not found
          </h3>
          <p className="text-[#636E72] mb-4">Unable to load your profile information.</p>
          <Button onClick={() => router.push("/")} variant="outline">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1E1E1E] py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#2ECC71] mb-2">My Profile</h1>
            <p className="text-[#636E72]">Manage your account information</p>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleCancel} variant="outline" disabled={isSaving}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-[#2ECC71] hover:bg-[#27AE60]">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar || ""} alt={profile.username} />
                <AvatarFallback className="bg-[#2ECC71] text-white text-xl">
                  {profile.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold text-[#2D3436] dark:text-white">
                  {profile.username}
                </h2>
                <p className="text-[#636E72] capitalize">{profile.role}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Mail className="h-4 w-4 text-[#636E72]" />
                  <span className="text-sm text-[#636E72]">{profile.email}</span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-[#2D3436] dark:text-white">
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2D3436] dark:text-white mb-2">
                Username
              </label>
              {isEditing ? (
                <Input
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  placeholder="Enter username"
                />
              ) : (
                <p className="text-[#636E72] py-2">{profile.username}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D3436] dark:text-white mb-2">
                Email
              </label>
              <p className="text-[#636E72] py-2">{profile.email}</p>
              <p className="text-xs text-[#636E72]">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D3436] dark:text-white mb-2">
                Role
              </label>
              <p className="text-[#636E72] py-2 capitalize">{profile.role}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2D3436] dark:text-white mb-2">
                  City
                </label>
                {isEditing ? (
                  <Input
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Enter city"
                  />
                ) : (
                  <p className="text-[#636E72] py-2">{profile.city || "Not specified"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2D3436] dark:text-white mb-2">
                  Locality
                </label>
                {isEditing ? (
                  <Input
                    value={formData.locality}
                    onChange={(e) => handleInputChange("locality", e.target.value)}
                    placeholder="Enter locality"
                  />
                ) : (
                  <p className="text-[#636E72] py-2">{profile.locality || "Not specified"}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D3436] dark:text-white mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Full Address
              </label>
              {isEditing ? (
                <Input
                  value={formData.full_address}
                  onChange={(e) => handleInputChange("full_address", e.target.value)}
                  placeholder="Enter full address"
                />
              ) : (
                <p className="text-[#636E72] py-2">{profile.full_address || "Not specified"}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2D3436] dark:text-white mb-2">
                  Latitude
                </label>
                {isEditing ? (
                  <Input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange("latitude", e.target.value)}
                    placeholder="Enter latitude"
                  />
                ) : (
                  <p className="text-[#636E72] py-2">{profile.latitude || "Not specified"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2D3436] dark:text-white mb-2">
                  Longitude
                </label>
                {isEditing ? (
                  <Input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange("longitude", e.target.value)}
                    placeholder="Enter longitude"
                  />
                ) : (
                  <p className="text-[#636E72] py-2">{profile.longitude || "Not specified"}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-xl text-[#2D3436] dark:text-white">
              Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={() => router.push("/change-password")}
              className="w-full sm:w-auto"
            >
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}