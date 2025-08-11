# QuickCourt Venue Creation - Troubleshooting Guide

## 🚨 Current Issue: "Something went wrong" during venue creation

### Quick Diagnosis Steps

1. **Test Backend Connection**
   - Go to `/test-venue` in your browser
   - Click "Test Backend Connection"
   - This will tell you if Django is running

2. **Check Authentication**
   - Ensure you're logged in as a facility owner
   - Check browser console for authentication errors
   - Verify JWT token is present

3. **Test Individual APIs**
   - Use the test page to check each endpoint
   - Start with Sports API (no auth required)
   - Then test venue creation with proper auth

## 🔍 Common Causes & Solutions

### 1. Backend Server Not Running
**Symptoms:**
- "Cannot connect to the server" error
- Network errors in browser console

**Solution:**
```bash
# Navigate to your Django project directory
cd /path/to/your/django/project

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows

# Start Django server
python manage.py runserver
```

### 2. Missing Venue Endpoints in Django
**Symptoms:**
- HTTP 404 errors
- "Endpoint not found" messages

**Required Django Endpoints:**
```python
# In your Django urls.py
urlpatterns = [
    path('api/owner/venues/', VenueCreateView.as_view(), name='venue-create'),
    path('api/sports/', SportsListView.as_view(), name='sports-list'),
]
```

### 3. Authentication Issues
**Symptoms:**
- "Authentication required" errors
- HTTP 401 Unauthorized

**Check:**
- User is logged in with owner role
- JWT token is valid and not expired
- Token is being sent in Authorization header

### 4. CORS Configuration
**Symptoms:**
- CORS policy errors in browser console
- Preflight request failures

**Django CORS Settings:**
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True
```

### 5. Data Validation Errors
**Symptoms:**
- HTTP 400 Bad Request
- Validation error messages

**Check:**
- All required fields are provided
- Data types match expected format
- Sport IDs exist in database

## 🛠️ Debugging Steps

### Step 1: Check Browser Console
Open browser developer tools (F12) and look for:
- Network errors
- JavaScript errors
- Failed API requests

### Step 2: Check Network Tab
In browser dev tools, Network tab:
- Look for failed requests to `/api/owner/venues/`
- Check request headers (Authorization token)
- Check request payload
- Check response status and body

### Step 3: Check Django Logs
In your Django terminal, look for:
- Request logs
- Error messages
- Authentication failures

### Step 4: Test with cURL
Test the API directly:
```bash
# Test venue creation
curl -X POST http://127.0.0.1:8000/api/owner/venues/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Venue",
    "description": "Test description",
    "city": "Test City",
    "full_address": "123 Test St",
    "sport_ids": [1],
    "amenities": ["Parking"],
    "starting_price_per_hour": 500.00
  }'
```

## 🔧 Quick Fixes

### Fix 1: Update API Base URL
Check if your Django server is running on a different port:
```typescript
// src/lib/api.ts
export const API_BASE_URL = "http://127.0.0.1:8000"; // Remove /api if needed
```

### Fix 2: Check Environment Variables
Ensure your `.env` file has:
```env
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
```

### Fix 3: Clear Browser Storage
Sometimes old tokens cause issues:
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
// Then log in again
```

### Fix 4: Restart Both Servers
```bash
# Stop both servers (Ctrl+C)
# Restart Django
python manage.py runserver

# Restart Next.js (in another terminal)
npm run dev
```

## 📋 Verification Checklist

- [ ] Django server running on port 8000
- [ ] Next.js server running on port 3000
- [ ] User logged in with "owner" role
- [ ] JWT token present in localStorage
- [ ] CORS configured in Django
- [ ] Venue endpoints exist in Django
- [ ] Sports data exists in database
- [ ] No console errors in browser

## 🆘 If Still Not Working

### Collect Debug Information
1. Go to `/test-venue`
2. Run all tests and copy results
3. Check browser console for errors
4. Check Django terminal for errors
5. Check Network tab in browser dev tools

### Expected API Responses

**Sports API (`GET /api/sports/`):**
```json
[
  {"id": 1, "name": "Basketball"},
  {"id": 2, "name": "Football"}
]
```

**Venue Creation (`POST /api/owner/venues/`):**
```json
{
  "id": 1,
  "name": "Test Venue",
  "description": "Test description",
  "is_approved": false,
  "owner": 1
}
```

### Contact Information
If you're still having issues, provide:
1. Error messages from browser console
2. Error messages from Django terminal
3. Results from `/test-venue` page
4. Your Django model definitions
5. Your Django view implementations

## 🎯 Most Likely Solutions

Based on the error "Something went wrong", the most common causes are:

1. **Django server not running** (90% of cases)
2. **Missing venue endpoints in Django** (5% of cases)
3. **CORS configuration issues** (3% of cases)
4. **Authentication problems** (2% of cases)

Start with checking if Django is running, then work through the other possibilities.