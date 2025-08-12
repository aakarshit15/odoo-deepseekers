"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Building, CheckCircle, XCircle, MapPin, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/lib/api";
import { getUserData } from "@/lib/auth";

interface PendingVenue {
  id: number;
  name: string;
  description: string;
  city: string;
  locality: string;
  full_address: string;
  starting_price_per_hour: string;
  amenities: string[];
  sports: Array<{ id: number; name: string }>;
  owner: number;
  created_at: string;
}

export default function AdminVenuesPage() {
  const router = useRouter();
  const [pendingVenues, setPendingVenues] = useState<PendingVenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingVenues, setProcessingVenues] = useState<Set<number>>(new Set());
  const [user, setUser] = useState<any>(null);

  // Check if user is admin
  useEffect(() => {
    const userData = getUserData();
    if (!userData) {
      toast.error("Please log in to access admin panel");
      router.push("/login");
      return;
    }
    if (userData.role !== "admin") {
      toast.error("Only administrators can access this page");
      router.push("/");
      return;
    }
    setUser(userData);
  }, [router]);

  // Fetch pending venues
  useEffect(() => {
    const fetchPendingVenues = async () => {
      try {
        const response = await adminApi.getPendingVenues();
        if (response.error) {
          toast.error("Failed to load pending venues: " + response.error);
          setPendingVenues([]);
        } else if (response.data && Array.isArray(response.data)) {
          setPendingVenues(response.data);
        } else {
          setPendingVenues([]);
        }
      } catch (error) {
        console.error("Error fetching pending venues:", error);
        toast.error("Failed to load pending venues");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchPendingVenues();
    }
  }, [user]);

  const handleApproveVenue = async (venueId: number) => {
    setProcessingVenues(prev => new Set(prev).add(venueId));
    
    try {
      const response = await adminApi.approveVenue(venueId);
      if (response.error) {
        toast.error("Failed to approve venue: " + response.error);
      } else {
        toast.success("Venue approved successfully!");
        setPendingVenues(prev => prev.filter(venue => venue.id !== venueId));
      }
    } catch (error) {
      console.error("Error approving venue:", error);
      toast.error("Failed to approve venue");
    } finally {
      setProcessingVenues(prev => {
        const newSet = new Set(prev);
        newSet.delete(venueId);
        return newSet;
      });
    }
  };

  const handleRejectVenue = async (venueId: number) => {
    setProcessingVenues(prev => new Set(prev).add(venueId));
    
    try {
      const response = await adminApi.rejectVenue(venueId);
      if (response.error) {
        toast.error("Failed to reject venue: " + response.error);
      } else {
        toast.success("Venue rejected successfully!");
        setPendingVenues(prev => prev.filter(venue => venue.id !== venueId));
      }
    } catch (error) {
      console.error("Error rejecting venue:", error);
      toast.error("Failed to reject venue");
    } finally {
      setProcessingVenues(prev => {
        const newSet = new Set(prev);
        newSet.delete(venueId);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1E1E1E] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#2ECC71] mx-auto mb-4" />
          <p className="text-[#636E72]">Loading pending venues...</p>
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
            <h1 className="text-3xl font-bold text-[#2ECC71] mb-2">Venue Management</h1>
            <p className="text-[#636E72]">
              Review and approve venue applications from facility owners.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.push("/admin-dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-[#2D3436] dark:text-white mb-1">
                {pendingVenues.length}
              </div>
              <p className="text-sm text-[#636E72]">Pending Approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                0
              </div>
              <p className="text-sm text-[#636E72]">Approved Today</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">
                0
              </div>
              <p className="text-sm text-[#636E72]">Rejected Today</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Venues */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-[#2D3436] dark:text-white">
              Pending Venue Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingVenues.length === 0 ? (
              <div className="text-center py-12">
                <Building className="h-12 w-12 text-[#636E72] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#2D3436] dark:text-white mb-2">
                  No pending venues
                </h3>
                <p className="text-[#636E72] mb-4">
                  All venue applications have been reviewed.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingVenues.map((venue) => (
                  <div
                    key={venue.id}
                    className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Venue Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-semibold text-[#2D3436] dark:text-white">
                            {venue.name}
                          </h3>
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Pending Review
                          </Badge>
                        </div>
                        
                        <p className="text-[#636E72] mb-4 line-clamp-2">
                          {venue.description}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-[#636E72]">
                            <MapPin className="h-4 w-4" />
                            <span>{venue.city}{venue.locality && `, ${venue.locality}`}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-[#636E72]">
                            <DollarSign className="h-4 w-4" />
                            <span>₹{venue.starting_price_per_hour}/hour</span>
                          </div>
                        </div>

                        <div className="text-sm text-[#636E72] mb-3">
                          <strong>Address:</strong> {venue.full_address}
                        </div>

                        {/* Sports */}
                        {venue.sports.length > 0 && (
                          <div className="mb-3">
                            <div className="text-sm font-medium text-[#2D3436] dark:text-white mb-2">
                              Sports:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {venue.sports.map((sport) => (
                                <Badge
                                  key={sport.id}
                                  variant="outline"
                                  className="text-xs bg-blue-50 text-blue-700"
                                >
                                  {sport.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Amenities */}
                        {venue.amenities.length > 0 && (
                          <div className="mb-4">
                            <div className="text-sm font-medium text-[#2D3436] dark:text-white mb-2">
                              Amenities:
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {venue.amenities.slice(0, 5).map((amenity) => (
                                <Badge
                                  key={amenity}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {amenity}
                                </Badge>
                              ))}
                              {venue.amenities.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{venue.amenities.length - 5} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="text-xs text-[#636E72]">
                          Applied: {new Date(venue.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex lg:flex-col gap-3 lg:w-48">
                        <Button
                          onClick={() => handleApproveVenue(venue.id)}
                          disabled={processingVenues.has(venue.id)}
                          className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700 text-white"
                        >
                          {processingVenues.has(venue.id) ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </>
                          )}
                        </Button>
                        
                        <Button
                          onClick={() => handleRejectVenue(venue.id)}
                          disabled={processingVenues.has(venue.id)}
                          variant="outline"
                          className="flex-1 lg:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {processingVenues.has(venue.id) ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </>
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          className="flex-1 lg:flex-none"
                        >
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
      </div>
    </div>
  );
}