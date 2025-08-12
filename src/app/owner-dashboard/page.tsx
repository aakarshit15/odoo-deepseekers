"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, MapPin, DollarSign, Users, Clock, Calendar, TrendingUp, Star } from "lucide-react";
import { toast } from "sonner";
import { ownerApi } from "@/lib/api";
import { getUserData } from "@/lib/auth";
import Link from "next/link";

interface Venue {
  id: number;
  name: string;
  description: string;
  city: string;
  locality: string;
  full_address: string;
  latitude: string;
  longitude: string;
  starting_price_per_hour: string;
  rating: number | null;
  popularity_score: string;
  is_approved: boolean;
  created_at: string;
  amenities: string[];
  sports: Array<{ id: number; name: string }>;
  photos: any[];
  owner: number;
}

interface DashboardData {
  kpis: {
    total_bookings: number;
    active_courts: number;
    earnings: number;
    today_bookings: number;
  };
  calendar: Array<{
    date: string;
    count: number;
    total_earnings: number;
  }>;
  earnings_summary: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  peak_hours: Array<{
    hour: number;
    count: number;
  }>;
}

export default function OwnerDashboardPage() {
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Check if user is owner
  useEffect(() => {
    const userData = getUserData();
    if (!userData) {
      toast.error("Please log in to access the dashboard");
      router.push("/login");
      return;
    }
    if (userData.role !== "owner") {
      toast.error("Only facility owners can access this dashboard");
      router.push("/");
      return;
    }
    setUser(userData);
  }, [router]);

  // Fetch dashboard data and venues
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch dashboard analytics
        const dashboardResponse = await ownerApi.getDashboard();
        if (dashboardResponse.data) {
          setDashboardData(dashboardResponse.data);
        }

        // Fetch venues
        const venuesResponse = await ownerApi.getVenues();
        if (venuesResponse.error) {
          toast.error("Failed to load venues: " + venuesResponse.error);
          setVenues([]);
        } else if (venuesResponse.data && Array.isArray(venuesResponse.data)) {
          setVenues(venuesResponse.data);
        } else {
          setVenues([]);
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
          <p className="text-[#636E72]">Loading dashboard...</p>
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
            <h1 className="text-3xl font-bold text-[#2ECC71] mb-2">Owner Dashboard</h1>
            <p className="text-[#636E72]">
              Welcome back, {user?.username}! Manage your venues and track performance.
            </p>
          </div>
          <Link href="/create-venue">
            <Button className="bg-[#2ECC71] hover:bg-[#27AE60] text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add New Venue
            </Button>
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#636E72]">Total Bookings</p>
                  <p className="text-2xl font-bold text-[#2D3436] dark:text-white">
                    {dashboardData?.kpis.total_bookings || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
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
                    {dashboardData?.kpis.active_courts || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-[#2ECC71]/10 rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-[#2ECC71]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#636E72]">Total Earnings</p>
                  <p className="text-2xl font-bold text-[#2D3436] dark:text-white">
                    ₹{dashboardData?.kpis.earnings?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#636E72]">Today's Bookings</p>
                  <p className="text-2xl font-bold text-[#2D3436] dark:text-white">
                    {dashboardData?.kpis.today_bookings || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Summary */}
        {dashboardData?.earnings_summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#636E72]">Daily Earnings</p>
                    <p className="text-xl font-bold text-[#2D3436] dark:text-white">
                      ₹{dashboardData.earnings_summary.daily.toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#636E72]">Weekly Earnings</p>
                    <p className="text-xl font-bold text-[#2D3436] dark:text-white">
                      ₹{dashboardData.earnings_summary.weekly.toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#636E72]">Monthly Earnings</p>
                    <p className="text-xl font-bold text-[#2D3436] dark:text-white">
                      ₹{dashboardData.earnings_summary.monthly.toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Venues List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-[#2D3436] dark:text-white">
              Your Venues
            </CardTitle>
          </CardHeader>
          <CardContent>
            {venues.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-[#636E72] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#2D3436] dark:text-white mb-2">
                  No venues yet
                </h3>
                <p className="text-[#636E72] mb-4">
                  Start by creating your first venue to attract players and grow your business.
                </p>
                <Link href="/create-venue">
                  <Button className="bg-[#2ECC71] hover:bg-[#27AE60] text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Venue
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {venues.map((venue) => (
                  <div
                    key={venue.id}
                    className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-[#2D3436] dark:text-white">
                            {venue.name}
                          </h3>
                          <Badge
                            variant={venue.is_approved ? "default" : "secondary"}
                            className={
                              venue.is_approved
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {venue.is_approved ? "Approved" : "Pending Approval"}
                          </Badge>
                          {venue.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm text-[#636E72]">{venue.rating}</span>
                            </div>
                          )}
                        </div>

                        <p className="text-[#636E72] mb-3 line-clamp-2">
                          {venue.description}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm text-[#636E72]">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {venue.city}
                            {venue.locality && `, ${venue.locality}`}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ₹{venue.starting_price_per_hour}/hour
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {venue.sports.length} sports
                          </div>
                        </div>

                        {/* Sports */}
                        {venue.sports.length > 0 && (
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-1">
                              {venue.sports.slice(0, 3).map((sport) => (
                                <Badge
                                  key={sport.id}
                                  variant="outline"
                                  className="text-xs bg-blue-50 text-blue-700"
                                >
                                  {sport.name}
                                </Badge>
                              ))}
                              {venue.sports.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{venue.sports.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Amenities */}
                        {venue.amenities.length > 0 && (
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-1">
                              {venue.amenities.slice(0, 3).map((amenity) => (
                                <Badge
                                  key={amenity}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {amenity}
                                </Badge>
                              ))}
                              {venue.amenities.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{venue.amenities.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/create-venue">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Plus className="h-8 w-8 text-[#2ECC71] mx-auto mb-3" />
                <h3 className="font-semibold text-[#2D3436] dark:text-white mb-2">
                  Add New Venue
                </h3>
                <p className="text-sm text-[#636E72]">
                  Create a new venue listing to attract more players
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/owner-bookings">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-[#2ECC71] mx-auto mb-3" />
                <h3 className="font-semibold text-[#2D3436] dark:text-white mb-2">
                  Manage Bookings
                </h3>
                <p className="text-sm text-[#636E72]">
                  View and manage venue bookings
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card className="cursor-pointer hover:shadow-md transition-shadow opacity-50">
            <CardContent className="p-6 text-center">
              <DollarSign className="h-8 w-8 text-[#636E72] mx-auto mb-3" />
              <h3 className="font-semibold text-[#2D3436] dark:text-white mb-2">
                Revenue Analytics
              </h3>
              <p className="text-sm text-[#636E72]">
                Track your earnings and performance (Coming Soon)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}