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
      throw new Error(data?.detail || data?.message || "Something went wrong");
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
