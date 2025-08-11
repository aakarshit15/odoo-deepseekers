"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { sportsApi, venueApi } from "@/lib/api";
import { getUserData, getStoredTokens } from "@/lib/auth";

export default function TestVenuePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const testSportsAPI = async () => {
    setLoading(true);
    setResult("Testing Sports API...");
    
    try {
      const response = await sportsApi.getAll();
      if (response.error) {
        setResult(`Sports API Error: ${response.error}`);
        toast.error("Sports API failed");
      } else {
        setResult(`Sports API Success: Found ${response.data?.length || 0} sports\n\nData: ${JSON.stringify(response.data, null, 2)}`);
        toast.success("Sports API working");
      }
    } catch (error) {
      setResult(`Sports API Exception: ${error}`);
      toast.error("Sports API exception");
    } finally {
      setLoading(false);
    }
  };

  const testVenueCreation = async () => {
    setLoading(true);
    setResult("Testing Venue Creation...");
    
    // Check authentication first
    const user = getUserData();
    const tokens = getStoredTokens();
    
    if (!user) {
      setResult("Venue Creation Error: No user data found. Please log in first.");
      toast.error("Please log in first");
      setLoading(false);
      return;
    }

    if (user.role !== "owner") {
      setResult(`Venue Creation Error: User role is '${user.role}', but 'owner' is required.`);
      toast.error("User must be an owner");
      setLoading(false);
      return;
    }

    if (!tokens.accessToken) {
      setResult("Venue Creation Error: No access token found. Please log in again.");
      toast.error("No access token");
      setLoading(false);
      return;
    }

    const testVenue = {
      name: "Test Venue",
      description: "This is a test venue for API testing",
      city: "Test City",
      locality: "Test Area",
      full_address: "123 Test Street, Test City",
      latitude: 12.345678,
      longitude: 77.123456,
      sport_ids: [1, 2],
      amenities: ["Parking", "WiFi"],
      starting_price_per_hour: 500.00
    };

    try {
      setResult(`Testing with user: ${user.username} (${user.role})\nAccess token: ${tokens.accessToken ? 'Present' : 'Missing'}\nVenue data: ${JSON.stringify(testVenue, null, 2)}`);
      
      const response = await venueApi.create(testVenue);
      
      if (response.error) {
        setResult(`Venue Creation Error: ${response.error}\n\nUser: ${user.username} (${user.role})\nToken: ${tokens.accessToken ? 'Present' : 'Missing'}`);
        toast.error("Venue creation failed");
      } else {
        setResult(`Venue Creation Success: Created venue with ID ${response.data?.id}\n\nResponse: ${JSON.stringify(response.data, null, 2)}`);
        toast.success("Venue created successfully");
      }
    } catch (error) {
      setResult(`Venue Creation Exception: ${error}\n\nUser: ${user.username} (${user.role})\nToken: ${tokens.accessToken ? 'Present' : 'Missing'}`);
      toast.error("Venue creation exception");
    } finally {
      setLoading(false);
    }
  };

  const testOwnerVenues = async () => {
    setLoading(true);
    setResult("Testing Owner Venues API...");
    
    try {
      const response = await venueApi.getOwnerVenues();
      if (response.error) {
        setResult(`Owner Venues Error: ${response.error}`);
        toast.error("Owner venues API failed");
      } else {
        setResult(`Owner Venues Success: Found ${response.data?.length || 0} venues\n\nData: ${JSON.stringify(response.data, null, 2)}`);
        toast.success("Owner venues API working");
      }
    } catch (error) {
      setResult(`Owner Venues Exception: ${error}`);
      toast.error("Owner venues API exception");
    } finally {
      setLoading(false);
    }
  };

  const testBackendConnection = async () => {
    setLoading(true);
    setResult("Testing Backend Connection...");
    
    try {
      const response = await fetch("http://127.0.0.1:8000/api/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.text();
        setResult(`Backend Connection Success: Server is running\nStatus: ${response.status}\nResponse: ${data}`);
        toast.success("Backend is running");
      } else {
        setResult(`Backend Connection Error: Status ${response.status}\nResponse: ${await response.text()}`);
        toast.error("Backend connection failed");
      }
    } catch (error) {
      setResult(`Backend Connection Exception: ${error}\n\nThis usually means the Django server is not running on port 8000.`);
      toast.error("Cannot connect to backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#1E1E1E] py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-[#2ECC71]">
              Venue API Integration Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Button
                onClick={testBackendConnection}
                disabled={loading}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white"
              >
                Test Backend Connection
              </Button>
              
              <Button
                onClick={testSportsAPI}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                Test Sports API
              </Button>
              
              <Button
                onClick={testVenueCreation}
                disabled={loading}
                className="w-full bg-[#2ECC71] hover:bg-[#27AE60] text-white"
              >
                Test Venue Creation (Requires Owner Login)
              </Button>
              
              <Button
                onClick={testOwnerVenues}
                disabled={loading}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white"
              >
                Test Owner Venues API (Requires Owner Login)
              </Button>
            </div>

            {result && (
              <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold mb-2">Test Result:</h3>
                <pre className="text-sm whitespace-pre-wrap overflow-x-auto">{result}</pre>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">
                Testing Instructions:
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• <strong>Backend Connection:</strong> Tests if Django server is running</li>
                <li>• <strong>Sports API:</strong> Should work without authentication</li>
                <li>• <strong>Venue Creation:</strong> Requires owner role and login</li>
                <li>• <strong>Owner Venues API:</strong> Requires owner role and login</li>
                <li>• Make sure backend server is running on port 8000</li>
                <li>• Check browser console for detailed error logs</li>
              </ul>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h3 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-200">
                Common Issues:
              </h3>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• <strong>Backend not running:</strong> Start with <code>python manage.py runserver</code></li>
                <li>• <strong>CORS issues:</strong> Check Django CORS settings</li>
                <li>• <strong>Authentication errors:</strong> Log in as facility owner</li>
                <li>• <strong>Endpoint not found:</strong> Check if venue endpoints exist in Django</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}