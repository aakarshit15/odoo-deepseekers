"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, X, MapPin, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { sportsApi, ownerApi } from "@/lib/api";
import { getUserData } from "@/lib/auth";

interface Sport {
  id: number;
  name: string;
  description?: string;
}

const COMMON_AMENITIES = [
  "Parking",
  "WiFi",
  "Changing Rooms",
  "Cafeteria",
  "Restrooms",
  "Air Conditioning",
  "Lockers",
  "First Aid",
  "Equipment Rental",
  "Shower Facilities",
];

export default function CreateVenuePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loadingSports, setLoadingSports] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    city: "",
    locality: "",
    full_address: "",
    latitude: "",
    longitude: "",
    sport_ids: [] as number[],
    amenities: [] as string[],
    starting_price_per_hour: "",
  });

  // Check if user is owner
  useEffect(() => {
    const user = getUserData();
    if (!user) {
      toast.error("Please log in to create a venue");
      router.push("/login");
      return;
    }
    if (user.role !== "owner") {
      toast.error("Only facility owners can create venues");
      router.push("/");
      return;
    }
  }, [router]);

  // Fetch sports
  useEffect(() => {
    const fetchSports = async () => {
      try {
        console.log("Fetching sports from API...");
        const response = await sportsApi.getAll();
        console.log("Sports API response:", response);

        if (response.error) {
          console.error("Sports API error:", response.error);
          toast.error("Failed to load sports from server. Using default sports.");
          // Fallback sports if API fails
          setSports([
            { id: 1, name: "Basketball" },
            { id: 2, name: "Football" },
            { id: 3, name: "Tennis" },
            { id: 4, name: "Swimming" },
            { id: 5, name: "Cricket" },
            { id: 6, name: "Table Tennis" },
            { id: 7, name: "Badminton" },
            { id: 8, name: "Volleyball" },
          ]);
        } else if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          console.log("Successfully loaded sports:", response.data);
          setSports(response.data);
        } else {
          console.warn("Sports API returned empty or invalid data, using fallback");
          // Use fallback sports if API returns empty data
          setSports([
            { id: 1, name: "Basketball" },
            { id: 2, name: "Football" },
            { id: 3, name: "Tennis" },
            { id: 4, name: "Swimming" },
            { id: 5, name: "Cricket" },
            { id: 6, name: "Table Tennis" },
            { id: 7, name: "Badminton" },
            { id: 8, name: "Volleyball" },
          ]);
          toast.info("Using default sports list. Sports API may not be configured yet.");
        }
      } catch (error) {
        console.error("Error fetching sports:", error);
        toast.error("Failed to load sports. Using default sports list.");
        // Fallback sports on exception
        setSports([
          { id: 1, name: "Basketball" },
          { id: 2, name: "Football" },
          { id: 3, name: "Tennis" },
          { id: 4, name: "Swimming" },
          { id: 5, name: "Cricket" },
          { id: 6, name: "Table Tennis" },
          { id: 7, name: "Badminton" },
          { id: 8, name: "Volleyball" },
        ]);
      } finally {
        setLoadingSports(false);
      }
    };

    fetchSports();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSport = (sportId: number) => {
    setFormData(prev => ({
      ...prev,
      sport_ids: prev.sport_ids.includes(sportId)
        ? prev.sport_ids.filter(id => id !== sportId)
        : [...prev.sport_ids, sportId]
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const addCustomAmenity = (customAmenity: string) => {
    if (customAmenity.trim() && !formData.amenities.includes(customAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, customAmenity.trim()]
      }));
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Venue name is required");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Venue description is required");
      return false;
    }
    if (!formData.city.trim()) {
      toast.error("City is required");
      return false;
    }
    if (!formData.full_address.trim()) {
      toast.error("Full address is required");
      return false;
    }
    if (formData.sport_ids.length === 0) {
      toast.error("Please select at least one sport");
      return false;
    }
    if (!formData.starting_price_per_hour || parseFloat(formData.starting_price_per_hour) <= 0) {
      toast.error("Please enter a valid starting price per hour");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Check if user is still authenticated
      const currentUser = getUserData();
      if (!currentUser) {
        toast.error("Please log in again to create a venue");
        router.push("/login");
        return;
      }

      if (currentUser.role !== "owner") {
        toast.error("Only facility owners can create venues");
        router.push("/");
        return;
      }

      const venueData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        city: formData.city.trim(),
        locality: formData.locality.trim() || undefined,
        full_address: formData.full_address.trim(),
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        sport_ids: formData.sport_ids, // Backend expects 'sport_ids' according to docs
        amenities: formData.amenities,
        starting_price_per_hour: parseFloat(formData.starting_price_per_hour),
      };

      console.log("Submitting venue data:", venueData);
      console.log("Current user:", currentUser);
      console.log("Sports selected:", formData.sport_ids);
      console.log("Final sport_ids field:", venueData.sport_ids);

      const response = await ownerApi.createVenue(venueData);

      console.log("Venue creation response:", response);

      if (response.error) {
        console.error("Venue creation error:", response.error);

        // Handle specific error cases
        if (response.error.includes("Authentication required")) {
          toast.error("Please log in again to create a venue");
          router.push("/login");
          return;
        } else if (response.error.includes("Cannot connect to the server")) {
          toast.error("Cannot connect to server. Please ensure the backend is running on port 8000.");
          return;
        } else {
          toast.error(`Failed to create venue: ${response.error}`);
          return;
        }
      }

      if (response.data) {
        toast.success(
          "Venue created successfully! Your venue is pending admin approval and will be visible once approved."
        );
        router.push("/owner-dashboard");
      } else {
        toast.error("Unexpected response from server. Please try again.");
      }
    } catch (error) {
      console.error("Error creating venue:", error);
      toast.error(`An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingSports) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1E1E1E] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#2ECC71] mx-auto mb-4" />
          <p className="text-[#636E72]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1E1E1E] py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2ECC71] mb-2">Create New Venue</h1>
          <p className="text-[#636E72]">
            Add your sports facility to QuickCourt. Your venue will be reviewed by our team before going live.
          </p>

          {/* Debug section - remove in production */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Debug: Sports loaded: {sports.length} |
                  Selected sports: {formData.sport_ids.length}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  console.log("Manual sports test...");
                  const response = await sportsApi.getAll();
                  console.log("Manual test result:", response);
                  toast.info(`Sports API test: ${response.error ? 'Failed' : 'Success'}`);
                }}
              >
                Test Sports API
              </Button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-[#2D3436] dark:text-white">
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2D3436] dark:text-white mb-2">
                  Venue Name *
                </label>
                <Input
                  placeholder="Enter venue name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2D3436] dark:text-white mb-2">
                  Description *
                </label>
                <textarea
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent"
                  placeholder="Describe your venue, facilities, and what makes it special..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2D3436] dark:text-white mb-2">
                    City *
                  </label>
                  <Input
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3436] dark:text-white mb-2">
                    Locality/Area
                  </label>
                  <Input
                    placeholder="Enter locality or area"
                    value={formData.locality}
                    onChange={(e) => handleInputChange("locality", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2D3436] dark:text-white mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Full Address *
                </label>
                <Input
                  placeholder="Enter complete address"
                  value={formData.full_address}
                  onChange={(e) => handleInputChange("full_address", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2D3436] dark:text-white mb-2">
                    Latitude (Optional)
                  </label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="e.g., 12.345678"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange("latitude", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3436] dark:text-white mb-2">
                    Longitude (Optional)
                  </label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="e.g., 77.123456"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange("longitude", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sports Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-[#2D3436] dark:text-white">
                Available Sports *
              </CardTitle>
              {/* Debug info */}
              <div className="text-sm text-gray-500">
                Loaded {sports.length} sports {sports.length > 0 && sports[0].id > 100 ? "(from API)" : "(fallback)"}
              </div>
            </CardHeader>
            <CardContent>
              {sports.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No sports available. Please check the backend connection.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {sports.map((sport) => (
                    <div
                      key={sport.id}
                      onClick={() => toggleSport(sport.id)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${formData.sport_ids.includes(sport.id)
                        ? "border-[#2ECC71] bg-[#2ECC71]/10"
                        : "border-gray-200 hover:border-[#2ECC71]/50"
                        }`}
                    >
                      <div className="text-center">
                        <div className="font-medium text-sm">{sport.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-[#2D3436] dark:text-white">
                Amenities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {COMMON_AMENITIES.map((amenity) => (
                  <div
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className={`p-2 rounded-lg border cursor-pointer transition-all text-sm ${formData.amenities.includes(amenity)
                      ? "border-[#2ECC71] bg-[#2ECC71]/10 text-[#2ECC71]"
                      : "border-gray-200 hover:border-[#2ECC71]/50"
                      }`}
                  >
                    {amenity}
                  </div>
                ))}
              </div>

              {/* Custom Amenity Input */}
              <div>
                <label className="block text-sm font-medium text-[#2D3436] dark:text-white mb-2">
                  Add Custom Amenity
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter custom amenity"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomAmenity(e.currentTarget.value);
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      addCustomAmenity(input.value);
                      input.value = "";
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Selected Amenities */}
              {formData.amenities.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-[#2D3436] dark:text-white mb-2">
                    Selected Amenities
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.amenities.map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center gap-1 bg-[#2ECC71]/10 text-[#2ECC71] px-2 py-1 rounded-full text-sm"
                      >
                        {amenity}
                        <button
                          type="button"
                          onClick={() => removeAmenity(amenity)}
                          className="hover:bg-[#2ECC71]/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-[#2D3436] dark:text-white">
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="block text-sm font-medium text-[#2D3436] dark:text-white mb-2">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  Starting Price per Hour (₹) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g., 500.00"
                  value={formData.starting_price_per_hour}
                  onChange={(e) => handleInputChange("starting_price_per_hour", e.target.value)}
                  required
                />
                <p className="text-xs text-[#636E72] mt-1">
                  This is the base price. You can set different prices for different courts and time slots later.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#2ECC71] hover:bg-[#27AE60] text-white px-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Venue...
                </>
              ) : (
                "Create Venue"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}