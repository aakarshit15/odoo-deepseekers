"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Clock, User, MapPin } from "lucide-react";
import { toast } from "sonner";
import { ownerApi } from "@/lib/api";
import { getUserData } from "@/lib/auth";

interface Booking {
  id: number;
  user_name: string;
  court_name: string;
  time: string;
  status: string;
}

export default function OwnerBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Check if user is owner
  useEffect(() => {
    const userData = getUserData();
    if (!userData) {
      toast.error("Please log in to access bookings");
      router.push("/login");
      return;
    }
    if (userData.role !== "owner") {
      toast.error("Only facility owners can access this page");
      router.push("/");
      return;
    }
    setUser(userData);
  }, [router]);

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await ownerApi.getBookings();
        if (response.error) {
          toast.error("Failed to load bookings: " + response.error);
          setBookings([]);
        } else if (response.data && Array.isArray(response.data)) {
          setBookings(response.data);
        } else {
          setBookings([]);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Failed to load bookings");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1E1E1E] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#2ECC71] mx-auto mb-4" />
          <p className="text-[#636E72]">Loading bookings...</p>
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
            <h1 className="text-3xl font-bold text-[#2ECC71] mb-2">Bookings Management</h1>
            <p className="text-[#636E72]">
              Manage all bookings for your venues and courts.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.push("/owner-dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>

        {/* Bookings List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-[#2D3436] dark:text-white">
              Recent Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-[#636E72] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#2D3436] dark:text-white mb-2">
                  No bookings yet
                </h3>
                <p className="text-[#636E72] mb-4">
                  Bookings will appear here once customers start booking your venues.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-[#2D3436] dark:text-white">
                            Booking #{booking.id}
                          </h3>
                          <Badge
                            className={getStatusColor(booking.status)}
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-[#636E72]">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {booking.user_name}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {booking.court_name}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {booking.time}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {booking.status.toLowerCase() === 'pending' && (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              Confirm
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-[#2D3436] dark:text-white mb-1">
                {bookings.length}
              </div>
              <p className="text-sm text-[#636E72]">Total Bookings</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {bookings.filter(b => b.status.toLowerCase() === 'confirmed').length}
              </div>
              <p className="text-sm text-[#636E72]">Confirmed</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {bookings.filter(b => b.status.toLowerCase() === 'pending').length}
              </div>
              <p className="text-sm text-[#636E72]">Pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {bookings.filter(b => b.status.toLowerCase() === 'completed').length}
              </div>
              <p className="text-sm text-[#636E72]">Completed</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}