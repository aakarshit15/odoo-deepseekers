# QuickCourt API Integration Documentation

## Base URL

```
http://your-domain.com/
```

## Authentication

The API uses JWT (JSON Web Token) authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## API Endpoints

### 1. Authentication Endpoints

#### Sign Up

- **URL**: `/api/auth/signup/`
- **Method**: POST
- **Input**:

```json
{
  "email": "user@example.com",
  "password": "password123", // minimum 8 characters
  "role": "file", // optional
  "username": "username", // optional, will be generated from email if not provided
  "avatar": "url", // optional
  "city": "City Name", // optional
  "locality": "Area Name", // optional
  "full_address": "Full Address", // optional
  "latitude": 12.34567, // optional
  "longitude": 45.6789 // optional
}
```

- **Success Response** (201):

```json
{
  "detail": "User created. OTP sent to email."
}
```

#### Resend OTP

- **URL**: `/api/auth/resend-otp/`
- **Method**: POST
- **Input**:

```json
{
  "email": "user@example.com"
}
```

- **Success Response** (200):

```json
{
  "detail": "OTP resent."
}
```

#### Verify OTP

- **URL**: `/api/auth/verify-otp/`
- **Method**: POST
- **Input**:

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

- **Success Response** (200):

```json
{
  "refresh": "refresh_token",
  "access": "access_token",
  "user": {
    "id": 1,
    "username": "username",
    "email": "user@example.com",
    "role": "user",
    "avatar": "url",
    "city": "City Name",
    "locality": "Area Name",
    "full_address": "Full Address",
    "latitude": 12.34567,
    "longitude": 45.6789,
    "is_active": true
  }
}
```

#### Login

- **URL**: `/api/auth/login/`
- **Method**: POST
- **Input**:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

- **Success Response** (200):

```json
{
  "refresh": "refresh_token",
  "access": "access_token",
  "user": {
    // same as verify OTP response
  }
}
```

#### Logout (Single Device)

- **URL**: `/api/auth/logout/`
- **Method**: POST
- **Authentication**: Required
- **Input**:

```json
{
  "refresh": "refresh_token"
}
```

- **Success Response** (200):

```json
{
  "detail": "Logged out successfully"
}
```

#### Logout All Devices

- **URL**: `/api/auth/logout-all/`
- **Method**: POST
- **Authentication**: Required
- **Success Response** (200):

```json
{
  "detail": "Logged out from all devices"
}
```

### 2. Profile Management

#### Get/Update Profile

- **URL**: `/api/profile/`
- **Methods**: GET, PUT, PATCH
- **Authentication**: Required
- **GET Response** (200):

```json
{
  "id": 1,
  "username": "username",
  "email": "user@example.com",
  "role": "user",
  "avatar": "url",
  "city": "City Name",
  "locality": "Area Name",
  "full_address": "Full Address",
  "latitude": 12.34567,
  "longitude": 45.6789,
  "is_active": true
}
```

- **PUT/PATCH Input**:

```json
{
  "username": "new_username",
  "avatar": "new_url",
  "city": "New City"
  // ... any other fields except email and is_active
}
```

#### Change Password

- **URL**: `/api/profile/change-password/`
- **Method**: POST
- **Authentication**: Required
- **Input**:

```json
{
  "old_password": "current_password",
  "new_password": "new_password123",
  "new_password2": "new_password123"
}
```

- **Success Response** (200):

```json
{
  "detail": "Password changed successfully. Please log in again."
}
```

### 3. Payment Integration

- **URL**: `/apii/payment/`
- **Method**: GET
- **Description**: Returns a page with PayPal integration
- **Note**: The payment system uses PayPal. The frontend will receive PayPal client ID and currency configuration.

## Important Notes for Frontend Integration:

1. **Token Management**:

   - Store both access and refresh tokens securely
   - Use access token for all authenticated requests
   - If a request returns 401, try refreshing the token

2. **Error Handling**:

   - All endpoints may return 400-level errors with detailed messages
   - Implement proper error handling for network issues
   - Show appropriate user feedback for validation errors

3. **OTP Workflow**:

   - OTP expires after 10 minutes
   - Users can request new OTP using resend endpoint
   - Account remains inactive until OTP verification

4. **Password Requirements**:

   - Minimum 8 characters
   - Validate passwords match on frontend before submitting

5. **Session Management**:

   - Implement proper logout handling
   - Clear local storage/cookies on logout
   - Handle multi-device logout scenarios

6. **Security Considerations**:
   - Never store passwords
   - Use HTTPS for all API calls
   - Implement proper CORS handling
   - Validate input before sending to API

## Models Available for Future Endpoints:

The backend has models set up for the following features that might be implemented:

- Sports
- Venues and Venue Photos
- Courts and Court Availability
- Bookings
- Reviews
- Blocked Slots
- Reports

If you need any specific endpoints for these features, please let the backend team know.
