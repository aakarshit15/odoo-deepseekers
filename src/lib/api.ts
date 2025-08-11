import { getStoredTokens } from './auth';

export const API_BASE_URL = "http://127.0.0.1:8000/api";

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('Making request to:', url);
    console.log('Request options:', {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...options.headers,
      },
    });

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...options.headers,
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', JSON.stringify(Object.fromEntries([...response.headers]), null, 2));

    const data = await response.json().catch(e => {
      console.error('Error parsing JSON:', e);
      return null;
    });

    console.log('Response data:', data);

    if (!response.ok) {
      const errorMessage = data?.detail || data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        data: data,
        url: url
      });
      throw new Error(errorMessage);
    }

    return { data };
  } catch (error) {
    console.error('API Error:', error);
    
    // Check if the server is running
    try {
      await fetch(API_BASE_URL);
    } catch (e) {
      return {
        error: 'Cannot connect to the server. Please make sure:\n1. The Django server is running on port 8000\n2. You have activated your virtual environment\n3. Run "python manage.py runserver"',
      };
    }

    // If server is running but there's another error
    if (error instanceof Error) {
      if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        return {
          error: 'Connection error. Please check your network connection.',
        };
      }
      return {
        error: error.message,
      };
    }
    return {
      error: "An unexpected error occurred",
    };
  }
}

// Auth related API calls
export const authApi = {
  signup: async (data: {
    email: string;
    password: string;
    role?: string;
    username?: string;
    avatar?: string;
  }) => {
    return fetchApi("/api/auth/signup/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  verifyOtp: async (data: { email: string; code: string }) => {
    return fetchApi("/api/auth/verify-otp/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  resendOtp: async (data: { email: string }) => {
    return fetchApi("/api/auth/resend-otp/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login: async (data: { email: string; password: string }) => {
    return fetchApi<{
      refresh: string;
      access: string;
      user: {
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
      };
    }>("/auth/login/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  logout: async (refreshToken: string) => {
    return fetchApi("/api/auth/logout/", {
      method: "POST",
      body: JSON.stringify({ refresh: refreshToken }),
    });
  },
};

// Sports API
export const sportsApi = {
  getAll: async () => {
    // Try different possible endpoints for sports
    const possibleEndpoints = ["/sports/", "/api/sports/", "/sports"];
    
    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Trying sports endpoint: ${endpoint}`);
        const response = await fetchApi<Array<{
          id: number;
          name: string;
          description?: string;
        }>>(endpoint, {
          method: "GET",
        });
        
        if (!response.error && response.data) {
          console.log(`Successfully fetched sports from: ${endpoint}`);
          return response;
        }
      } catch (error) {
        console.log(`Failed to fetch from ${endpoint}:`, error);
        continue;
      }
    }
    
    // If all endpoints fail, return an error
    return {
      error: "Sports API endpoint not found. Tried: " + possibleEndpoints.join(", ")
    };
  },
};

// Venue API for owners
export const venueApi = {
  create: async (venueData: {
    name: string;
    description: string;
    city: string;
    locality?: string;
    full_address: string;
    latitude?: number;
    longitude?: number;
    sports: number[]; // Backend expects 'sports' field
    amenities: string[];
    starting_price_per_hour: number;
  }) => {
    const { accessToken } = getStoredTokens();
    
    if (!accessToken) {
      return {
        error: "Authentication required. Please log in again."
      };
    }

    console.log('Creating venue with data:', venueData);
    console.log('Using access token:', accessToken ? 'Present' : 'Missing');

    return fetchApi<{
      id: number;
      name: string;
      description: string;
      city: string;
      locality: string;
      full_address: string;
      latitude: number | null;
      longitude: number | null;
      sports: number[]; // Backend returns 'sports' field
      amenities: string[];
      starting_price_per_hour: number;
      is_approved: boolean;
      owner: number;
    }>("/owner/venues/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(venueData),
    });
  },

  getOwnerVenues: async () => {
    const { accessToken } = getStoredTokens();
    
    if (!accessToken) {
      return {
        error: "Authentication required. Please log in again."
      };
    }

    return fetchApi<Array<{
      id: number;
      name: string;
      description: string;
      city: string;
      locality: string;
      full_address: string;
      latitude: number | null;
      longitude: number | null;
      sports: number[]; // Backend returns 'sports' field
      amenities: string[];
      starting_price_per_hour: number;
      is_approved: boolean;
      owner: number;
    }>>("/owner/venues/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },
};
