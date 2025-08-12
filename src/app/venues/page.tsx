"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MapPin, DollarSign, Star, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { publicApi, sportsApi } from "@/lib/api";
import { Navigation } from "@/components/Navigation";

interface Venue {
  id: number;
  name: string;
  description: string;
  city: string;
  locality: string;
  full_address: string;
  starting_price_per_hour: string;
  rating: number | null;
  amenities: string[];
  sports: Array<{ id: number; name: string }>;
  photos: any[];
}

interface Sport {
  id: number;
  name: string;
}

export default function VenuesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    city: "",
    sport: "",
    price_min: "",
    price_max: "",
    sort: "popularity",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    hasNext: false,
    hasPrevious: false,
    total: 0,
  });

  // Initialize filters from URL parameters
  useEffect(() => {
    const city = searchParams.get('city') || '';
    const sport = searchParams.get('sport') || '';
    const search = searchParams.get('search') || '';
    
    setFilters(prev => ({
      ...prev,
      city,
      sport,
      search,
    }));
  }, [searchParams]);

  // Fetch sports for filter
  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await sportsApi.getAll();
        if (response.data && Array.isArray(response.data)) {
          setSports(response.data);
        }
      } catch (error) {
        console.error("Error fetching sports:", error);
      }
    };
    fetchSports();
  }, []);

  // Fetch venues
  const fetchVenues = async (page = 1) => {
    setIsSearching(true);
    try {
      const searchFilters = {
        ...filters,
        page,
        page_size: 12,
        is_approved: true,
        price_min: filters.price_min ? parseFloat(filters.price_min) : undefined,
        price_max: filters.price_max ? parseFloat(filters.price_max) : undefined,
        sport: filters.sport ? parseInt(filters.sport) : undefined,
      };

      // Remove empty filters
      Object.keys(searchFilters).forEach(key => {
        if (searchFilters[key as keyof typeof searchFilters] === "" || 
            searchFilters[key as keyof typeof searchFilters] === undefined) {
          delete searchFilters[key as keyof typeof searchFilters];
        }
      });

      const response = await publicApi.getVenues(searchFilters);
      
      if (response.error) {
        toast.error("Failed to load venues: " + response.error);
        setVenues([]);
      } else if (response.data) {
        setVenues(response.data.results || response.data);
        setPagination({
          page,
          hasNext: !!response.data.next,
          hasPrevious: !!response.data.previous,
          total: response.data.count || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching venues:", error);
      toast.error("Failed to load venues");
    } finally {
      setIsSearching(false);
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchVenues();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchVenues(1);
  };

  const handlePageChange = (newPage: number) => {
    fetchVenues(newPage);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      city: "",
      sport: "",
      price_min: "",
      price_max: "",
      sort: "popularity",
    });
    fetchVenues(1);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1E1E1E]">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2ECC71] mb-2">Find Sports Venues</h1>
          <p className="text-[#636E72]">
            Discover and book amazing sports facilities near you
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-[#2D3436] dark:text-white flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search venues..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={isSearching}
                className="bg-[#2ECC71] hover:bg-[#27AE60]"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Input
                placeholder="City"
                value={filters.city}
                onChange={(e) => handleFilterChange("city", e.target.value)}
              />

              <Select value={filters.sport} onValueChange={(value) => handleFilterChange("sport", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Sports</SelectItem>
                  {sports.map((sport) => (
                    <SelectItem key={sport.id} value={sport.id.toString()}>
                      {sport.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="number"
                placeholder="Min Price"
                value={filters.price_min}
                onChange={(e) => handleFilterChange("price_min", e.target.value)}
              />

              <Input
                type="number"
                placeholder="Max Price"
                value={filters.price_max}
                onChange={(e) => handleFilterChange("price_max", e.target.value)}
              />

              <Select value={filters.sort} onValueChange={(value) => handleFilterChange("sort", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
              <p className="text-sm text-[#636E72]">
                {pagination.total} venues found
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#2ECC71] mx-auto mb-4" />
            <p className="text-[#636E72]">Loading venues...</p>
          </div>
        )}

        {/* Venues Grid */}
        {!isLoading && (
          <>
            {venues.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-[#636E72] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#2D3436] dark:text-white mb-2">
                  No venues found
                </h3>
                <p className="text-[#636E72] mb-4">
                  Try adjusting your search criteria or filters.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {venues.map((venue) => (
                    <Card key={venue.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold text-[#2D3436] dark:text-white line-clamp-1">
                            {venue.name}
                          </h3>
                          {venue.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm text-[#636E72]">{venue.rating}</span>
                            </div>
                          )}
                        </div>

                        <p className="text-[#636E72] text-sm mb-4 line-clamp-2">
                          {venue.description}
                        </p>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-[#636E72]">
                            <MapPin className="h-4 w-4" />
                            <span className="line-clamp-1">
                              {venue.city}{venue.locality && `, ${venue.locality}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-[#636E72]">
                            <DollarSign className="h-4 w-4" />
                            <span>₹{venue.starting_price_per_hour}/hour</span>
                          </div>
                        </div>

                        {/* Sports */}
                        {venue.sports.length > 0 && (
                          <div className="mb-4">
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
                          <div className="mb-4">
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

                        <Button className="w-full bg-[#2ECC71] hover:bg-[#27AE60]">
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {(pagination.hasNext || pagination.hasPrevious) && (
                  <div className="flex justify-center items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrevious || isSearching}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-[#636E72]">
                      Page {pagination.page}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNext || isSearching}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}