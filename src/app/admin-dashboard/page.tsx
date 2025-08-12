"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Building, Calendar, DollarSign, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/lib/api";
import { getUserData } from "@/lib/auth";
import Link from "next/link";

interface AdminDashboardData {
  total_users: number;
  total_facility_owners: number;
  total_bookings: number;
  total_active_courts: number;
  booking_activity: any[];
  user_registration_trends: any[];
  facility_approval_trends: any[];
  most_active_sports: any[];
  earnings_simulation: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Check if user is admin
  useEffect(() => {
    const userData = getUserData();
    if (!userData) {
      toast.error("Please log in to access the admin dashboard");
      router.push("/login");
      return;
    }
    if (userData.role !== "admin") {
      toast.error("Only administrators can access this dashboard");
      router.push("/");
      return;
    }
    setUser(userData);
  }, [router]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await adminApi.getDashboard();
        if (response.error) {
          toast.error("Failed to load dashboard data: " + response.error);
        } else if (response.data) {
          setDashboardData(response.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1E1E1E] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#2ECC71] mx-auto mb-4" />
          <p className="text-[#636E72]">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1E1E1E] py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#2ECC71] mb-2">Admin Dashboard</h1>
            <p className="text-[#636E72]">
              Welcome, {user?.username}! Manage the QuickCourt platform.
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#636E72]">Total Users</p>
                  <p className="text-2xl font-bold text-[#2D3436] dark:text-white">
                    {dashboardData?.total_users?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#636E72]">Facility Owners</p>
                  <p className="text-2xl font-bold text-[#2D3436] dark:text-white">
                    {dashboardData?.total_facility_owners?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-[#2ECC71]/10 rounded-full flex items-center justify-center">
                  <Building className="h-6 w-6 text-[#2ECC71]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#636E72]">Total Bookings</p>
                  <p className="text-2xl font-bold text-[#2D3436] dark:text-white">
                    {dashboardData?.total_bookings?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#636E72]">Active Courts</p>
                  <p className="text-2xl font-bold text-[#2D3436] dark:text-white">
                    {dashboardData?.total_active_courts?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Simulation */}
        {dashboardData?.earnings_simulation && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl text-[#2D3436] dark:text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Platform Earnings Simulation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">
                ₹{dashboardData.earnings_simulation.toLocaleString()}
              </div>
              <p className="text-[#636E72]">Estimated platform revenue based on current activity</p>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/admin-venues">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Building className="h-8 w-8 text-[#2ECC71] mx-auto mb-3" />
                <h3 className="font-semibold text-[#2D3436] dark:text-white mb-2">
                  Manage Venues
                </h3>
                <p className="text-sm text-[#636E72]">
                  Approve or reject venue applications
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin-users">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-[#2D3436] dark:text-white mb-2">
                  Manage Users
                </h3>
                <p className="text-sm text-[#636E72]">
                  View and manage user accounts
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card className="cursor-pointer hover:shadow-md transition-shadow opacity-50">
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 text-[#636E72] mx-auto mb-3" />
              <h3 className="font-semibold text-[#2D3436] dark:text-white mb-2">
                Reports
              </h3>
              <p className="text-sm text-[#636E72]">
                View platform reports (Coming Soon)
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow opacity-50">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-[#636E72] mx-auto mb-3" />
              <h3 className="font-semibold text-[#2D3436] dark:text-white mb-2">
                Analytics
              </h3>
              <p className="text-sm text-[#636E72]">
                Detailed platform analytics (Coming Soon)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Most Active Sports */}
        {dashboardData?.most_active_sports && dashboardData.most_active_sports.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-[#2D3436] dark:text-white">
                Most Active Sports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {dashboardData.most_active_sports.slice(0, 8).map((sport, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-lg font-bold text-[#2D3436] dark:text-white">
                      {sport.name || `Sport ${index + 1}`}
                    </div>
                    <div className="text-sm text-[#636E72]">
                      {sport.count || 0} venues
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}