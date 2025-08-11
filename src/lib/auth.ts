interface AuthTokens {
  access: string;
  refresh: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  is_active: boolean;
}

// Function to validate password
export function validatePassword(password: string): {
  isValid: boolean;
  error?: string;
} {
  if (password.length < 8) {
    return {
      isValid: false,
      error: "Password must be at least 8 characters long",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one uppercase letter",
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one number",
    };
  }

  if (!/[!@#$%^&*]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one special character (!@#$%^&*)",
    };
  }

  return { isValid: true };
}

// Function to store auth tokens
export function storeAuthTokens(tokens: AuthTokens) {
  localStorage.setItem("accessToken", tokens.access);
  localStorage.setItem("refreshToken", tokens.refresh);
}

// Function to store user data
export function storeUserData(user: User) {
  localStorage.setItem("user", JSON.stringify(user));
}

// Function to get stored user data
export function getUserData(): User | null {
  const userData = localStorage.getItem("user");
  return userData ? JSON.parse(userData) : null;
}

// Function to clear auth data
export function clearAuthData() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

// Function to get stored tokens
export function getStoredTokens(): {
  accessToken?: string;
  refreshToken?: string;
} {
  return {
    accessToken: localStorage.getItem("accessToken") || undefined,
    refreshToken: localStorage.getItem("refreshToken") || undefined,
  };
}

// Function to check if user is logged in
export function isLoggedIn(): boolean {
  const { accessToken } = getStoredTokens();
  return !!accessToken;
}

// Function to store email for OTP verification
export function storeEmailForVerification(email: string) {
  sessionStorage.setItem("verificationEmail", email);
}

// Function to get stored email for verification
export function getStoredEmailForVerification(): string | null {
  return sessionStorage.getItem("verificationEmail");
}

// Function to clear stored email for verification
export function clearStoredEmailForVerification() {
  sessionStorage.removeItem("verificationEmail");
}
