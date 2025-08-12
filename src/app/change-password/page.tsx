"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";
import { profileApi } from "@/lib/api";
import { validatePassword } from "@/lib/auth";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    new_password2: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords
    if (!formData.old_password) {
      toast.error("Current password is required");
      return;
    }

    if (!formData.new_password) {
      toast.error("New password is required");
      return;
    }

    if (formData.new_password !== formData.new_password2) {
      toast.error("New passwords do not match");
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(formData.new_password);
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.error);
      return;
    }

    setIsLoading(true);

    try {
      const response = await profileApi.changePassword(formData);
      
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("Password changed successfully! Please log in again.");
        router.push("/login");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1E1E1E] py-8">
      <div className="container mx-auto px-4 max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-12 w-12 bg-[#2ECC71]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-6 w-6 text-[#2ECC71]" />
          </div>
          <h1 className="text-3xl font-bold text-[#2ECC71] mb-2">Change Password</h1>
          <p className="text-[#636E72]">Update your account password</p>
        </div>

        {/* Change Password Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-[#2D3436] dark:text-white">
              Password Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-[#2D3436] dark:text-white mb-2">
                  Current Password *
                </label>
                <div className="relative">
                  <Input
                    type={showPasswords.old ? "text" : "password"}
                    placeholder="Enter current password"
                    value={formData.old_password}
                    onChange={(e) => handleInputChange("old_password", e.target.value)}
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('old')}
                  >
                    {showPasswords.old ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-[#2D3436] dark:text-white mb-2">
                  New Password *
                </label>
                <div className="relative">
                  <Input
                    type={showPasswords.new ? "text" : "password"}
                    placeholder="Enter new password"
                    value={formData.new_password}
                    onChange={(e) => handleInputChange("new_password", e.target.value)}
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-[#636E72] mt-1">
                  Password must be at least 8 characters with uppercase, number, and special character
                </p>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-sm font-medium text-[#2D3436] dark:text-white mb-2">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Input
                    type={showPasswords.confirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={formData.new_password2}
                    onChange={(e) => handleInputChange("new_password2", e.target.value)}
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-[#2ECC71] hover:bg-[#27AE60] text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security Tips */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <h3 className="font-semibold text-[#2D3436] dark:text-white mb-2">
              Password Security Tips
            </h3>
            <ul className="text-sm text-[#636E72] space-y-1">
              <li>• Use at least 8 characters</li>
              <li>• Include uppercase and lowercase letters</li>
              <li>• Add numbers and special characters</li>
              <li>• Avoid using personal information</li>
              <li>• Don't reuse passwords from other accounts</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}