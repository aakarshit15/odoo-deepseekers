export const API_BASE_URL = "http://your-domain.com";

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Something went wrong");
    }

    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Something went wrong",
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
    return fetchApi("/api/auth/login/", {
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
