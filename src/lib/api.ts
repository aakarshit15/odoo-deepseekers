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

// Owner API - Complete integration based on backend docs
export const ownerApi = {
  // Dashboard analytics
  getDashboard: async () => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) return { error: "Authentication required" };

    return fetchApi<{
      kpis: {
        total_bookings: number;
        active_courts: number;
        earnings: number;
        today_bookings: number;
      };
      calendar: Array<{
        date: string;
        count: number;
        total_earnings: number;
      }>;
      trends: {
        daily: any[];
        weekly: any[];
        monthly: any[];
      };
      earnings_summary: {
        daily: number;
        weekly: number;
        monthly: number;
      };
      peak_hours: Array<{
        hour: number;
        count: number;
      }>;
    }>("/owner/dashboard/", {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  // List all owner venues with full details
  getVenues: async () => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) return { error: "Authentication required" };

    return fetchApi<Array<{
      id: number;
      name: string;
      description: string;
      city: string;
      locality: string;
      full_address: string;
      latitude: string;
      longitude: string;
      starting_price_per_hour: string;
      rating: number | null;
      popularity_score: string;
      is_approved: boolean;
      created_at: string;
      amenities: string[];
      sports: Array<{ id: number; name: string }>;
      photos: any[];
      owner: number;
    }>>("/owner/venues/all/", {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  // Create venue
  createVenue: async (venueData: {
    name: string;
    description: string;
    city: string;
    locality?: string;
    full_address: string;
    latitude?: number;
    longitude?: number;
    sport_ids: number[];
    amenities: string[];
    starting_price_per_hour: number;
  }) => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) return { error: "Authentication required" };

    return fetchApi("/owner/venues/", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(venueData),
    });
  },

  // Update venue
  updateVenue: async (venueId: number, venueData: any) => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) return { error: "Authentication required" };

    return fetchApi(`/owner/venues/${venueId}/`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(venueData),
    });
  },

  // Upload venue photos
  uploadVenuePhoto: async (venueId: number, imageFile: File) => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) return { error: "Authentication required" };

    const formData = new FormData();
    formData.append('image', imageFile);

    return fetchApi(`/owner/venues/${venueId}/photos/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });
  },

  // Get owner bookings
  getBookings: async () => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) return { error: "Authentication required" };

    return fetchApi<Array<{
      id: number;
      user_name: string;
      court_name: string;
      time: string;
      status: string;
    }>>("/owner/bookings/", {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  // Court management
  createCourt: async (courtData: {
    venue_id: number;
    type: "indoor" | "outdoor";
    name: string;
    sport: { id: number; name: string };
  }) => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) return { error: "Authentication required" };

    return fetchApi("/owner/courts/", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(courtData),
    });
  },

  updateCourt: async (courtId: number, courtData: any) => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) return { error: "Authentication required" };

    return fetchApi(`/owner/courts/${courtId}/`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(courtData),
    });
  },

  // Court availability
  addAvailability: async (courtId: number, availabilityData: {
    day_type: "mon_fri" | "sat_sun" | "holidays";
    start_time: string;
    end_time: string;
    price_per_hour: number;
  }) => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) return { error: "Authentication required" };

    return fetchApi(`/owner/courts/${courtId}/availability/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(availabilityData),
    });
  },

  updateAvailability: async (availabilityId: number, availabilityData: any) => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) return { error: "Authentication required" };

    return fetchApi(`/owner/availability/${availabilityId}/`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(availabilityData),
    });
  },

  // Block court slot
  blockSlot: async (courtId: number, blockData: {
    date: string;
    start_time: string;
    end_time: string;
    reason?: string;
  }) => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) return { error: "Authentication required" };

    return fetchApi(`/owner/courts/${courtId}/block/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(blockData),
    });
  },
};

// Profile API
export const profileApi = {
  getProfile: async () => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) return { error: "Authentication required" };

    return fetchApi("/profile/", {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  updateProfile: async (profileData: any) => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) return { error: "Authentication required" };

    return fetchApi("/profile/", {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(profileData),
    });
  },

  changePassword: async (passwordData: {
    old_password: string;
    new_password: string;
    new_password2: string;
  }) => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) return { error: "Authentication required" };

    return fetchApi("/profile/change-password/", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(passwordData),
    });
  },
};

// Admin API
export const adminApi = {
  getDashboard: async () => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) return { error: "Authentication required" };

    return fetchApi<{
      total_users: number;
      total_facility_owners: number;
      total_bookings: number;
      total_active_courts: number;
      booking_activity: any[];
      user_registration_trends: any[];
      facility_approval_trends: any[];
      most_active_sports: any[];
      earnings_simulation: number;
    }>("/admin/dashboard/", {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  getPendingVenues: async () => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) return { error: "Authentication required" };

    return fetchApi("/admin/venues/pending/", {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  approveVenue: async (venueId: number) => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) return { error: "Authentication required" };

    return fetchApi(`/admin/venues/${venueId}/approve/`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  rejectVenue: async (venueId: number) => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) return { error: "Authentication required" };

    return fetchApi(`/admin/venues/${venueId}/reject/`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  getUsers: async (filters?: { role?: string; status?: string }) => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) return { error: "Authentication required" };

    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status) params.append('status', filters.status);

    return fetchApi(`/admin/users/?${params.toString()}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  banUser: async (userId: number) => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) return { error: "Authentication required" };

    return fetchApi(`/admin/users/${userId}/ban/`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  unbanUser: async (userId: number) => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) return { error: "Authentication required" };

    return fetchApi(`/admin/users/${userId}/unban/`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
};

// Public API
export const publicApi = {
  getHomeData: async () => {
    return fetchApi<{
      popular_venues: any[];
      popular_sports: any[];
    }>("/home/", {
      method: "GET",
    });
  },

  getVenues: async (filters?: {
    city?: string;
    search?: string;
    type?: string;
    price_min?: number;
    price_max?: number;
    sport?: number;
    rating_min?: number;
    is_approved?: boolean;
    sort?: string;
    page?: number;
    page_size?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }

    return fetchApi(`/venues/?${params.toString()}`, {
      method: "GET",
    });
  },

  getVenueById: async (venueId: string) => {
    return fetchApi<{
      id: number;
      name: string;
      description: string;
      city: string;
      locality: string;
      full_address: string;
      latitude: string;
      longitude: string;
      starting_price_per_hour: string;
      rating: number | null;
      popularity_score: string;
      is_approved: boolean;
      created_at: string;
      amenities: string[];
      sports: Array<{ id: number; name: string }>;
      photos: any[];
      owner: number;
    }>(`/venues/${venueId}/`, {
      method: "GET",
    });
  },

  getCourts: async (venueId: string) => {
    return fetchApi<{
      results: Array<{
        id: number;
        name: string;
        sport: string;
        price_per_hour: number;
        type: string;
        venue: number;
      }>;
    }>(`/venues/${venueId}/courts/`, {
      method: "GET",
    });
  },
};

// Legacy venue API (keeping for backward compatibility)
export const venueApi = {
  create: ownerApi.createVenue,
  getOwnerVenues: ownerApi.getVenues,
};
