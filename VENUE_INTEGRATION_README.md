# QuickCourt Venue Creation Integration

## Overview
This document outlines the complete integration of venue creation functionality for facility owners in the QuickCourt platform.

## Features Implemented

### 🏢 Venue Creation System
- **Multi-step Venue Form**: Comprehensive form with validation for all venue details
- **Sports Selection**: Dynamic sports selection with fallback data
- **Amenities Management**: Pre-defined amenities + custom amenity addition
- **Location Support**: Address input with optional GPS coordinates
- **Pricing Configuration**: Starting price per hour setup
- **Role-based Access**: Only facility owners can create venues

### 🎯 Owner Dashboard
- **Venue Management**: View all owned venues with status indicators
- **Statistics Overview**: Total venues, approved venues, pending approval counts
- **Quick Actions**: Easy access to create new venues and manage existing ones
- **Status Tracking**: Clear indication of venue approval status

### 🔐 Authentication & Authorization
- **Role-based Signup**: Users can register as "Player" or "Facility Owner"
- **Protected Routes**: Venue creation restricted to owners only
- **JWT Integration**: Secure API calls with automatic token management
- **Navigation Updates**: Dynamic navigation based on user role

## File Structure

```
src/
├── app/
│   ├── create-venue/
│   │   └── page.tsx              # Venue creation form
│   ├── owner-dashboard/
│   │   └── page.tsx              # Owner dashboard
│   └── signup/
│       └── page.tsx              # Updated with role selection
├── components/
│   ├── ui/
│   │   ├── badge.tsx             # Status badges
│   │   └── dropdown-menu.tsx     # User dropdown menu
│   └── Navigation.tsx            # Role-based navigation
└── lib/
    └── api.ts                    # Updated with venue APIs
```

## API Integration

### Venue Creation Endpoint
```typescript
POST /api/owner/venues/
Authorization: Bearer <access_token>

// Request Body
{
  name: "Your Venue Name",
  description: "Detailed description of your venue",
  city: "City Name",
  locality: "Area/Locality Name", // optional
  full_address: "Complete address",
  latitude: 12.345678, // optional
  longitude: 77.123456, // optional
  sport_ids: [1, 2, 3], // array of sport IDs
  amenities: ["parking", "wifi", "changing_rooms"],
  starting_price_per_hour: 500.00
}

// Success Response (201)
{
  id: 1,
  name: "Your Venue Name",
  description: "Detailed description...",
  city: "City Name",
  locality: "Area Name",
  full_address: "Complete address",
  latitude: 12.345678,
  longitude: 77.123456,
  sport_ids: [1, 2, 3],
  amenities: ["parking", "wifi", "changing_rooms"],
  starting_price_per_hour: 500.00,
  is_approved: false,
  owner: 1
}
```

### Sports API
```typescript
GET /api/sports/

// Response
[
  {
    id: 1,
    name: "Basketball",
    description: "Basketball court"
  },
  {
    id: 2,
    name: "Football",
    description: "Football field"
  }
]
```

### Owner Venues API
```typescript
GET /api/owner/venues/
Authorization: Bearer <access_token>

// Response: Array of venue objects
```

## User Experience Flow

### For Facility Owners

1. **Registration**
   - User selects "Facility Owner" role during signup
   - Additional location fields appear for owners
   - Account created with owner role

2. **Dashboard Access**
   - Owner logs in and sees owner-specific navigation
   - Dashboard shows venue statistics and management options
   - Quick access to create new venues

3. **Venue Creation**
   - Multi-step form with clear sections:
     - Basic Information (name, description, location)
     - Sports Selection (visual grid selection)
     - Amenities (pre-defined + custom options)
     - Pricing (starting price per hour)
   - Real-time validation and error handling
   - Success message with approval notice

4. **Venue Management**
   - View all venues with approval status
   - Edit and manage existing venues
   - Track performance metrics (coming soon)

## Form Validation

### Required Fields
- Venue name
- Description
- City
- Full address
- At least one sport
- Starting price per hour

### Optional Fields
- Locality/Area
- GPS coordinates (latitude/longitude)
- Amenities

### Validation Rules
- Name: Non-empty string
- Description: Minimum meaningful content
- Price: Positive number
- Coordinates: Valid decimal numbers if provided
- Sports: At least one sport must be selected

## UI/UX Features

### Venue Creation Form
- **Progressive Disclosure**: Information organized in logical sections
- **Visual Sports Selection**: Grid-based sport selection with visual feedback
- **Smart Amenities**: Common amenities as quick-select buttons
- **Custom Amenities**: Add custom amenities with tag-style display
- **Real-time Feedback**: Immediate validation and error messages
- **Loading States**: Clear loading indicators during submission

### Owner Dashboard
- **Statistics Cards**: Visual overview of venue metrics
- **Status Indicators**: Color-coded badges for approval status
- **Empty States**: Helpful guidance when no venues exist
- **Quick Actions**: Easy access to common tasks

### Navigation
- **Role-based Menus**: Different navigation options for owners vs players
- **User Dropdown**: Profile access and role-specific actions
- **Responsive Design**: Works on all device sizes

## Error Handling

### API Errors
- Network connectivity issues
- Authentication failures
- Validation errors from backend
- Server errors

### User Feedback
- Toast notifications for success/error states
- Inline form validation
- Loading states during API calls
- Clear error messages with actionable guidance

## Security Considerations

### Authentication
- JWT tokens required for all venue operations
- Role-based access control (only owners can create venues)
- Automatic token refresh handling

### Data Validation
- Client-side validation for user experience
- Server-side validation for security
- Input sanitization and type checking

### Authorization
- Route protection middleware
- API endpoint authorization
- User role verification

## Future Enhancements

### Planned Features
1. **Venue Editing**: Update existing venue information
2. **Photo Upload**: Add venue photos and galleries
3. **Court Management**: Add individual courts within venues
4. **Availability Management**: Set operating hours and blocked slots
5. **Booking Management**: Handle venue bookings and reservations
6. **Revenue Analytics**: Track earnings and performance metrics
7. **Review System**: Manage venue reviews and ratings

### Technical Improvements
1. **Image Upload**: Cloudinary or AWS S3 integration
2. **Maps Integration**: Google Maps for location selection
3. **Real-time Updates**: WebSocket for live booking updates
4. **Mobile App**: React Native implementation
5. **Advanced Search**: Elasticsearch integration

## Testing

### Manual Testing Checklist
- [ ] Owner can register with role selection
- [ ] Owner can access dashboard after login
- [ ] Venue creation form validates all fields
- [ ] Sports selection works correctly
- [ ] Amenities can be added and removed
- [ ] Form submission creates venue successfully
- [ ] Dashboard shows created venues
- [ ] Approval status is displayed correctly
- [ ] Navigation updates based on user role

### API Testing
- [ ] Venue creation endpoint works with valid data
- [ ] Authentication is required for venue operations
- [ ] Sports API returns available sports
- [ ] Owner venues API returns user's venues only
- [ ] Error handling works for invalid requests

## Deployment Notes

### Environment Variables
```env
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
```

### Dependencies Added
```json
{
  "@radix-ui/react-dropdown-menu": "^2.1.4"
}
```

### Installation
```bash
npm install @radix-ui/react-dropdown-menu
```

## Support

### Common Issues
1. **"Only facility owners can create venues"**: User needs to register with owner role
2. **"Failed to load sports"**: Backend sports endpoint may be unavailable
3. **"Authentication required"**: User needs to log in with valid credentials
4. **"Venue pending approval"**: Normal flow - admin approval required

### Troubleshooting
1. Check backend server is running on correct port
2. Verify JWT tokens are being sent correctly
3. Ensure user has correct role in database
4. Check network connectivity and CORS settings

This integration provides a complete venue creation system for facility owners with proper authentication, validation, and user experience considerations.