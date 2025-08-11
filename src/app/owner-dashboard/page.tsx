"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, MapPin, DollarSign, Users, Clock } from "lucide-react";
import { toast } from "sonner";
import { venueApi } from "@/lib/api";
import { getUserData } from "@/lib/auth";
import Link from "next/link";

interface Venue {
  id: number;
  name: string;
  description: string;
  city: string;
  locality: string;
  full_address: string;
  latitude: number | null;
  longitude: number | null;
  sports: number[]; // Backend uses 'sports' field
  amenities: string[];
  starting_price_per_hour: number;
  is_approved: boolean;
  owner: number;
}

export default function OwnerDashboardPage() {
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
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

  // Fetch owner's venues
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await venueApi.getOwnerVenues();
        if (response.error) {
          toast.error("Failed to load venues: " + response.error);
          setVenues([]);
        } else if (response.data && Array.isArray(response.data)) {
          setVenues(response.data);
        } else {
          setVenues([]);
        }
      } catch (error) {
        console.error("Error fetching venues:", error);
        toast.error("Failed to load venues");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchVenues();
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#636E72]">Total Venues</p>
                  <p className="text-2xl font-bold text-[#2D3436] dark:text-white">
                    {venues.length}
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
                  <p className="text-sm font-medium text-[#636E72]">Approved Venues</p>
                  <p className="text-2xl font-bold text-[#2D3436] dark:text-white">
                    {venues.filter(v => v.is_approved).length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#636E72]">Pending Approval</p>
                  <p className="text-2xl font-bold text-[#2D3436] dark:text-white">
                    {venues.filter(v => !v.is_approved).length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
                        </div>

                        {venue.amenities.length > 0 && (
                          <div className="mt-3">
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

          <Card className="cursor-pointer hover:shadow-md transition-shadow opacity-50">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-[#636E72] mx-auto mb-3" />
              <h3 className="font-semibold text-[#2D3436] dark:text-white mb-2">
                Manage Bookings
              </h3>
              <p className="text-sm text-[#636E72]">
                View and manage venue bookings (Coming Soon)
              </p>
            </CardContent>
          </Card>

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