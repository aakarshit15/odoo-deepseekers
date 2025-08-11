"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import type { UseEmblaCarouselType } from "embla-carousel-react";

type CarouselApi = UseEmblaCarouselType[1];

export default function VenueDetailsPage() {
  const [date, setDate] = useState<Date>();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Mock data - replace with real data fetching
  const venue = {
    name: "Basketball Court",
    location: "123 Sports Avenue, City",
    rating: 4.5,
    description:
      "Professional indoor basketball court with high-quality flooring and equipment. Perfect for both casual games and serious training sessions.",
    pricePerHour: 1200,
    images: [
      "/images/hero-section-img.png",
      "/images/hero-section-img.png",
      "/images/hero-section-img.png",
    ],
    amenities: ["Changing Rooms", "Parking", "Water", "First Aid"],
    reviews: [
      {
        id: 1,
        user: "John D.",
        rating: 5,
        comment: "Excellent court! Great surface and well-maintained.",
        date: "2 weeks ago",
      },
      {
        id: 2,
        user: "Sarah M.",
        rating: 4,
        comment: "Good facility, but could use better lighting.",
        date: "1 month ago",
      },
      // Add more reviews as needed
    ],
    availableTimeSlots: [
      "09:00 AM - 10:00 AM",
      "10:00 AM - 11:00 AM",
      "11:00 AM - 12:00 PM",
      "02:00 PM - 03:00 PM",
      "03:00 PM - 04:00 PM",
      "04:00 PM - 05:00 PM",
    ],
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1E1E1E]">
      <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <header className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-[#2ECC71]">
            QUICKCOURT
          </h1>
        </header>

        <div className="mb-8">
          <div className="max-w-[90%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%] mx-auto">
            <Carousel className="w-full">
              <CarouselContent>
                {venue.images.map((img, id) => {
                  return (
                    <CarouselItem
                      key={id}
                      className="flex items-center justify-center"
                    >
                      <div className="relative aspect-[4/3] w-full">
                        <Image
                          src={img}
                          alt="turf-image"
                          fill
                          className="object-cover rounded-lg"
                          priority={id === 0}
                        />
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Venue Details */}
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-[#2D3436] dark:text-white mb-2">
                    {venue.name}
                  </h1>
                  <div className="flex items-center text-[#636E72] gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{venue.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-[#2ECC71] text-white px-2 py-1 rounded">
                  <Star className="h-4 w-4 fill-current" />
                  <span>{venue.rating}</span>
                </div>
              </div>
              <Separator className="my-4" />
              <p className="text-[#636E72]">{venue.description}</p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-semibold text-[#2D3436] dark:text-white mb-4">
                Amenities
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {venue.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="bg-white dark:bg-[#2C2C2C] rounded-lg p-2 sm:p-3 text-center text-[#636E72] text-sm sm:text-base"
                  >
                    {amenity}
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div>
              <h2 className="text-xl font-semibold text-[#2D3436] dark:text-white mb-4">
                Reviews
              </h2>
              <div className="space-y-4">
                {venue.reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between mb-2">
                        <div className="font-semibold text-[#2D3436] dark:text-white">
                          {review.user}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-[#2ECC71] text-[#2ECC71]" />
                          <span className="text-[#636E72]">
                            {review.rating}
                          </span>
                        </div>
                      </div>
                      <p className="text-[#636E72] mb-2">{review.comment}</p>
                      <div className="text-sm text-[#636E72]">
                        {review.date}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-[#2D3436] dark:text-white mb-4">
                  ₹{venue.pricePerHour}
                  <span className="text-base font-normal text-[#636E72]">
                    {" "}
                    / hour
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-[#2D3436] dark:text-white mb-2 block">
                      Select Date
                    </label>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </div>

                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="w-full border rounded-lg"
                  />

                  {date && (
                    <div>
                      <label className="text-sm font-medium text-[#2D3436] dark:text-white mb-2 block">
                        Available Time Slots
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {venue.availableTimeSlots.map((slot) => (
                          <Button
                            key={slot}
                            variant="outline"
                            className="w-full text-xs"
                          >
                            {slot}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button className="w-full bg-[#2ECC71] hover:bg-[#27AE60] text-white">
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
