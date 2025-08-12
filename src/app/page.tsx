"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { publicApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { MapPin, DollarSign, Star, Loader2 } from "lucide-react";
import Link from "next/link";


interface Venue {
  id: number;
  name: string;
  description: string;
  city: string;
  locality: string;
  starting_price_per_hour: string;
  rating: number | null;
  amenities: string[];
  sports: Array<{ id: number; name: string }>;
}

export default function Home() {
  const router = useRouter();
  const [searchLocation, setSearchLocation] = useState("");
  const [popularVenues, setPopularVenues] = useState<Venue[]>([]);
  const [popularSports, setPopularSports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // Try to fetch home data first
        const homeResponse = await publicApi.getHomeData();
        if (homeResponse.data) {
          setPopularVenues(homeResponse.data.popular_venues || []);
          setPopularSports(homeResponse.data.popular_sports || []);
        } else {
          // Fallback: fetch venues directly
          const venuesResponse = await publicApi.getVenues({
            is_approved: true,
            sort: "popularity",
            page_size: 6
          });
          if (venuesResponse.data) {
            setPopularVenues(venuesResponse.data.results || venuesResponse.data || []);
          }
        }
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const handleSearch = () => {
    if (searchLocation.trim()) {
      router.push(`/venues?city=${encodeURIComponent(searchLocation.trim())}`);
    } else {
      router.push('/venues');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1E1E1E] text-[#2D3436]">
      <Navigation />
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">

        <main>
          <section className="mb-8 sm:mb-12">
            <div className="flex flex-col justify-center items-center sm:items-start gap-2 w-full">
              <div className="w-full sm:max-w-md">
                <Input
                  type="text"
                  placeholder="Enter location..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full border-[#DADADA] rounded-lg text-sm sm:text-base"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="w-full sm:max-w-md bg-[#2ECC71] hover:bg-[#27AE60] text-white px-4 py-2 rounded hover:scale-98 text-sm sm:text-base"
              >
                Search
              </Button>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 mt-6 text-center sm:text-left">
              FIND PLAYERS & VENUES NEARBY
            </h2>
            <p className="text-[#636E72] mb-4 sm:mb-6 text-sm sm:text-base text-center sm:text-left max-w-2xl">
              Seamlessly explore sports venues and play with other sports
              enthusiasts near you!
            </p>
          </section>

          {/* Popular Venues Section */}
          <section className="mb-8 sm:mb-12">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl sm:text-2xl font-semibold text-center sm:text-left">
                Popular Venues
              </h3>
              <Link href="/venues">
                <Button variant="outline">View All</Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#2ECC71] mx-auto mb-4" />
                <p className="text-[#636E72]">Loading popular venues...</p>
              </div>
            ) : popularVenues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Add Shrimad Sports as first venue if not already present */}
                {!popularVenues.some(v => v.name === "Shrimad Sports") && (
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-lg font-semibold text-[#2D3436] dark:text-white line-clamp-1">
                          Shrimad Sports
                        </h4>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-[#636E72]">4.8</span>
                        </div>
                      </div>

                      <p className="text-[#636E72] text-sm mb-4 line-clamp-2">
                        Premium sports facility with world-class courts and amenities
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-[#636E72]">
                          <MapPin className="h-4 w-4" />
                          <span className="line-clamp-1">Mumbai, Andheri West</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#636E72]">
                          <DollarSign className="h-4 w-4" />
                          <span>₹500/hour</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            Badminton
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            Tennis
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            Basketball
                          </Badge>
                        </div>
                      </div>

                      <Link href="/venues/1/booking">
                        <Button className="w-full bg-[#2ECC71] hover:bg-[#27AE60]">
                          Book Now
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
                {popularVenues.map((venue) => (
                  <Card key={venue.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-lg font-semibold text-[#2D3436] dark:text-white line-clamp-1">
                          {venue.name}
                        </h4>
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
                      {venue.sports && venue.sports.length > 0 && (
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

                      <Link href={venue.name === "Shrimad Sports" ? `/venues/1/booking` : `/venues/${venue.id}/booking`}>
                        <Button className="w-full bg-[#2ECC71] hover:bg-[#27AE60]">
                          {venue.name === "Shrimad Sports" ? "Book Now" : "View Details"}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Show Shrimad Sports when no venues from API */}
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-lg font-semibold text-[#2D3436] dark:text-white line-clamp-1">
                        Shrimad Sports
                      </h4>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-[#636E72]">4.8</span>
                      </div>
                    </div>

                    <p className="text-[#636E72] text-sm mb-4 line-clamp-2">
                      Premium sports facility with world-class courts and amenities
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-[#636E72]">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">Mumbai, Andheri West</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#636E72]">
                        <DollarSign className="h-4 w-4" />
                        <span>₹500/hour</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                          Badminton
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                          Tennis
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                          Basketball
                        </Badge>
                      </div>
                    </div>

                    <Link href="/venues/1/booking">
                      <Button className="w-full bg-[#2ECC71] hover:bg-[#27AE60]">
                        Book Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            )}
          </section>

          <section className="mb-8 sm:mb-12">
            <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-center sm:text-left">
              Popular Sports
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 px-2 sm:px-0">
              {(popularSports.length > 0 ? popularSports : [
                { id: 1, name: "Basketball" },
                { id: 2, name: "Football" },
                { id: 3, name: "Tennis" },
                { id: 4, name: "Swimming" },
                { id: 5, name: "Cricket" },
                { id: 6, name: "Table Tennis" },
              ]).map((sport) => (
                <Link
                  key={sport.id || sport.name}
                  href={`/venues?sport=${sport.id || ''}`}
                  className="block"
                >
                  <div className="bg-white dark:bg-[#2C2C2C] rounded-lg shadow-sm p-3 sm:p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 bg-[#A3E4D7] rounded-full flex items-center justify-center">
                      {/* Sport icon would go here */}
                    </div>
                    <p className="font-medium text-sm sm:text-base">{sport.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </main>

        <footer className="text-center text-[#636E72] mt-8 sm:mt-12 text-sm sm:text-base">
          <p>© 2025 QuickCourt. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
