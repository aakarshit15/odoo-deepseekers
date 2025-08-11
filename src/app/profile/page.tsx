"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import {
  Clock,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Edit,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function UserProfilePage() {
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login');
    }
  }, [router]);

  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      return {
        name: userData.username || '',
        email: userData.email || '',
        phone: 'Not set',
        location: `${userData.locality || ''}, ${userData.city || ''}`,
        joinedDate: 'Recently joined',
        type: userData.role || 'User',
        profileImage: userData.avatar || '/images/hero-section-img.png',
        upcomingBookings: [
          {
            id: 1,
            venue: "Basketball Court",
            date: "Aug 15, 2025",
            time: "10:00 AM - 11:00 AM",
            price: 1200,
          },
          {
            id: 2,
            venue: "Tennis Court",
            date: "Aug 18, 2025",
            time: "04:00 PM - 05:00 PM",
            price: 800,
          },
        ],
        pastBookings: [
          {
            id: 3,
            venue: "Football Ground",
            date: "Aug 5, 2025",
            time: "06:00 PM - 07:00 PM",
            price: 1500,
          },
        ],
      };
    }
    return {
      name: '',
      email: '',
      phone: 'Not set',
      location: '',
      joinedDate: 'Recently joined',
      type: 'User',
      profileImage: '/images/hero-section-img.png',
      upcomingBookings: [],
      pastBookings: []
    };
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1E1E1E]">
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#2ECC71]">
            QUICKCOURT
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4">
                    <Image
                      src={user.profileImage}
                      alt={user.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h2 className="text-xl font-semibold text-[#2D3436] dark:text-white mb-1">
                    {user.name}
                  </h2>
                  <span className="text-sm text-[#636E72] mb-4">
                    {user.type}
                  </span>
                  <Button className="w-full bg-[#2ECC71] hover:bg-[#27AE60]">
                    <Edit className="w-4 h-4 mr-2" /> Edit Profile
                  </Button>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div className="flex items-center text-[#636E72]">
                    <Mail className="w-4 h-4 mr-3" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center text-[#636E72]">
                    <Phone className="w-4 h-4 mr-3" />
                    <span className="text-sm">{user.phone}</span>
                  </div>
                  <div className="flex items-center text-[#636E72]">
                    <MapPin className="w-4 h-4 mr-3" />
                    <span className="text-sm">{user.location}</span>
                  </div>
                  <div className="flex items-center text-[#636E72]">
                    <Calendar className="w-4 h-4 mr-3" />
                    <span className="text-sm">Joined {user.joinedDate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-[#2D3436] dark:text-white mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-[#636E72]"
                  >
                    <User className="w-4 h-4 mr-2" />
                    View Public Profile
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-[#636E72]"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Account Settings
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-500"
                    onClick={() => {
                      localStorage.removeItem('user');
                      localStorage.removeItem('accessToken');
                      localStorage.removeItem('refreshToken');
                      router.push('/login');
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bookings Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Bookings */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-[#2D3436] dark:text-white mb-4">
                  Upcoming Bookings
                </h3>
                <div className="space-y-4">
                  {user.upcomingBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="space-y-2 sm:space-y-1">
                        <h4 className="font-medium text-[#2D3436] dark:text-white">
                          {booking.venue}
                        </h4>
                        <div className="flex items-center text-sm text-[#636E72]">
                          <Calendar className="w-4 h-4 mr-2" />
                          {booking.date}
                        </div>
                        <div className="flex items-center text-sm text-[#636E72]">
                          <Clock className="w-4 h-4 mr-2" />
                          {booking.time}
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0 flex items-center gap-4">
                        <span className="text-[#2ECC71] font-medium">
                          ₹{booking.price}
                        </span>
                        <Button
                          variant="outline"
                          className="border-[#2ECC71] text-[#2ECC71] hover:bg-[#2ECC71] hover:text-white"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Past Bookings */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-[#2D3436] dark:text-white mb-4">
                  Past Bookings
                </h3>
                <div className="space-y-4">
                  {user.pastBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="space-y-2 sm:space-y-1">
                        <h4 className="font-medium text-[#2D3436] dark:text-white">
                          {booking.venue}
                        </h4>
                        <div className="flex items-center text-sm text-[#636E72]">
                          <Calendar className="w-4 h-4 mr-2" />
                          {booking.date}
                        </div>
                        <div className="flex items-center text-sm text-[#636E72]">
                          <Clock className="w-4 h-4 mr-2" />
                          {booking.time}
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0 flex items-center gap-4">
                        <span className="text-[#636E72] font-medium">
                          ₹{booking.price}
                        </span>
                        <Button variant="outline" className="text-[#636E72]">
                          Book Again
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
