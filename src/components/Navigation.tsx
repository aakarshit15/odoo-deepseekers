"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Building, Plus } from "lucide-react";
import { getUserData, clearAuthData, isLoggedIn } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  avatar: string | null;
  city: string;
  locality: string;
  full_address: string;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
}

export function Navigation() {
  const [user, setUser] = useState<User | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = getUserData();
    const isAuth = isLoggedIn();
    setUser(userData);
    setAuthenticated(isAuth);
  }, []);

  const handleLogout = () => {
    clearAuthData();
    setUser(null);
    setAuthenticated(false);
    toast.success("Logged out successfully");
    router.push("/");
  };

  return (
    <header className="bg-white dark:bg-[#2C2C2C] shadow-sm border-b">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#2ECC71]">
              QUICKCOURT
            </h1>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            {!authenticated ? (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-[#3498DB] hover:text-[#2C80B4]">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-[#2ECC71] hover:bg-[#27AE60] text-white">
                    Sign Up
                  </Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                {/* Owner-specific navigation */}
                {user?.role === "owner" && (
                  <>
                    <Link href="/create-venue">
                      <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Venue
                      </Button>
                    </Link>
                    <Link href="/owner-dashboard">
                      <Button variant="ghost" size="sm">
                        <Building className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                  </>
                )}

                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.avatar || ""} alt={user?.username} />
                        <AvatarFallback className="bg-[#2ECC71] text-white">
                          {user?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium leading-none">{user?.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">
                        {user?.role}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === "owner" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/owner-dashboard" className="cursor-pointer">
                            <Building className="mr-2 h-4 w-4" />
                            My Venues
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/create-venue" className="cursor-pointer">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Venue
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}