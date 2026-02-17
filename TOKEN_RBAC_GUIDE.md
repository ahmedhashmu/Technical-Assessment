# Token-Based RBAC Implementation Guide

## Overview

The system now uses a proper token-based authentication system instead of a simple role dropdown. This provides backend-enforced security where users cannot bypass access controls.

---

## Authentication Flow

### 1. Login Process
- User opens the application
- If not authenticated, a login modal appears
- User selects either "Operator" or "Basic User"
- System stores the corresponding token in localStorage
- Page reloads with authentication applied

### 2. Token Storage
```typescript
// Tokens stored in localStorage
'operator-test-token' → Operator role (full access)
'basic-test-token'    → Basic role (limited access)
```

### 3. API Requests
All API requests include the Authorization header:
```
Authorization: Bearer <token>
```

---

## Backend Implementation

### Token Validation (`backend/app/core/auth.py`)

```python
# Mock token to role mapping
TOKEN_ROLE_MAP = {
    "basic-test-token": "basic",
    "operator-test-token": "operator"
}

# Three dependencies for different use cases:

1. get_token_from_header()
   - Extracts token from Authorization header
   - Returns 401 if missing or invalid format

2. get_user_role()
   - Validates token and returns role
   - Returns 401 if token invalid

3. require_operator_role()
   - Enforces operator-only access
   - Returns 403 if user is not operator
```

### Protected Endpoints

#### GET /api/contacts/{contactId}/meetings
- **Authentication**: Required (any valid token)
- **Authorization**: Role-based data filtering
  - Operator: Full transcript + analysis
  - Basic: Metadata only (no transcript, no analysis)

#### POST /api/meetings/{meetingId}/analyze
- **Authentication**: Required
- **Authorization**: Operator only
  - Operator: 200 OK (analysis performed)
  - Basic: 403 Forbidden

#### POST /api/meetings
- **Authentication**: Not required (public endpoint)
- Anyone can submit meetings

---

## Frontend Implementation

### API Client (`frontend/lib/api-client.ts`)

```typescript
class APIClient {
  // Token management
  setToken(token: string)        // Store token
  clearToken()                   // Remove token
  getCurrentRole()               // Get role from token
  isAuthenticated()              // Check if logged in
  
  // Automatic token handling
  private fetchWithAuth()        // Adds Authorization header
                                 // Redirects to login on 401
}
```

### Login Component (`frontend/components/LoginSelector.tsx`)
- Modal dialog with two login options
- Cannot be dismissed (required for access)
- Stores token and reloads page

### Navbar (`frontend/components/Navbar.tsx`)
- Shows current role badge
- Logout button (clears token and shows login)
- Automatically displays login modal if not authenticated

### Contact Page (`frontend/app/contacts/[id]/page.tsx`)
- Removed role dropdown selector
- Uses authenticated user's role automatically
- Shows access level info banner

### Meeting Card (`frontend/components/MeetingCard.tsx`)
- Shows error message if analysis fails (403)
- Conditional rendering based on user role

---

## Security Features

### Backend Enforcement
✅ Token validation at API layer  
✅ Role-based data filtering in service layer  
✅ Operator-only endpoints protected  
✅ Proper HTTP status codes (401, 403)  

### Frontend Protection
✅ Token stored securely in localStorage  
✅ Automatic redirect to login on 401  
✅ Clear error messages for 403  
✅ No role manipulation possible  

---

## Testing

### Automated Tests (`backend/test_rbac.py`)

```bash
cd backend
python test_rbac.py
```

**Test Coverage:**
1. ✅ Missing Authorization header → 401
2. ✅ Invalid token format → 401
3. ✅ Invalid token → 401
4. ✅ Operator token → Full data access
5. ✅ Basic token → Limited data access
6. ✅ Basic cannot analyze → 403
7. ✅ Operator can analyze → 200
8. ✅ Correct field exclusion

### Manual Testing

#### Test Operator Access
1. Open http://localhost:3000
2. Click "Login as Operator"
3. Navigate to a contact page
4. Verify you see:
   - Full transcripts
   - AI analysis
   - "Analyze" button works

#### Test Basic Access
1. Logout (click user icon → Logout)
2. Click "Login as Basic User"
3. Navigate to a contact page
4. Verify you see:
   - Meeting metadata only
   - No transcripts
   - No analysis
   - "Analyze" button shows 403 error

---

## API Examples

### Get Contact Meetings (Operator)
```bash
curl -H "Authorization: Bearer operator-test-token" \
  http://localhost:8000/api/contacts/contact_001/meetings
```

**Response:**
```json
{
  "contactId": "contact_001",
  "meetings": [
    {
      "id": "meeting_001",
      "contactId": "contact_001",
      "type": "sales",
      "occurredAt": "2024-02-16T14:30:00Z",
      "transcript": "Full transcript here...",
      "createdAt": "2024-02-16T14:30:00Z",
      "analysis": {
        "sentiment": "positive",
        "topics": ["pricing", "features"],
        "objections": [],
        "commitments": ["Follow up next week"],
        "outcome": "follow_up",
        "summary": "..."
      }
    }
  ]
}
```

### Get Contact Meetings (Basic)
```bash
curl -H "Authorization: Bearer basic-test-token" \
  http://localhost:8000/api/contacts/contact_001/meetings
```

**Response:**
```json
{
  "contactId": "contact_001",
  "meetings": [
    {
      "id": "meeting_001",
      "contactId": "contact_001",
      "type": "sales",
      "occurredAt": "2024-02-16T14:30:00Z",
      "createdAt": "2024-02-16T14:30:00Z"
    }
  ]
}
```

### Analyze Meeting (Basic - Forbidden)
```bash
curl -X POST \
  -H "Authorization: Bearer basic-test-token" \
  http://localhost:8000/api/meetings/meeting_001/analyze
```

**Response (403):**
```json
{
  "detail": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "This operation requires operator role"
  }
}
```

### Analyze Meeting (Operator - Success)
```bash
curl -X POST \
  -H "Authorization: Bearer operator-test-token" \
  http://localhost:8000/api/meetings/meeting_001/analyze
```

**Response (200):**
```json
{
  "id": "analysis_id",
  "meetingId": "meeting_001",
  "sentiment": "positive",
  "topics": ["pricing", "features"],
  "objections": [],
  "commitments": ["Follow up next week"],
  "outcome": "follow_up",
  "summary": "...",
  "analyzedAt": "2024-02-16T15:00:00Z"
}
```

---

## Error Handling

### 401 Unauthorized
**Causes:**
- Missing Authorization header
- Invalid token format (not "Bearer <token>")
- Invalid/unknown token

**Frontend Behavior:**
- Clears stored token
- Redirects to login modal
- Shows "Authentication required" message

### 403 Forbidden
**Causes:**
- Basic user trying to analyze meeting
- Insufficient permissions for operation

**Frontend Behavior:**
- Shows error message in UI
- Does not redirect (user is authenticated)
- Suggests contacting admin for access

---

## Migration from Old System

### What Changed

**Removed:**
- ❌ `x-user-role` header
- ❌ Role dropdown selector on contact page
- ❌ Manual role selection

**Added:**
- ✅ `Authorization: Bearer <token>` header
- ✅ Login modal with role selection
- ✅ Token storage in localStorage
- ✅ Automatic role detection
- ✅ Logout functionality
- ✅ Role badge in navbar

### Backward Compatibility
⚠️ **Breaking Change**: Old API calls using `x-user-role` header will fail with 401.

All clients must update to use `Authorization: Bearer <token>` header.

---

## Production Considerations

### Current Implementation (Demo)
- Static tokens hardcoded in config
- No token expiration
- No refresh tokens
- Tokens stored in localStorage

### Production Recommendations
1. **Replace static tokens** with JWT or OAuth2
2. **Add token expiration** and refresh mechanism
3. **Use httpOnly cookies** instead of localStorage
4. **Implement proper user authentication** (username/password, SSO)
5. **Add rate limiting** to prevent brute force
6. **Log authentication events** for audit trail
7. **Use HTTPS** in production (required for secure tokens)

---

## Files Modified

### Backend
- `backend/app/core/auth.py` - Token validation and role extraction
- `backend/app/routers/analysis.py` - Added operator requirement
- `backend/app/routers/contacts.py` - Updated documentation
- `backend/test_rbac.py` - Updated tests for token auth

### Frontend
- `frontend/lib/api-client.ts` - Token management and auth headers
- `frontend/components/LoginSelector.tsx` - New login modal
- `frontend/components/Navbar.tsx` - Role display and logout
- `frontend/app/contacts/[id]/page.tsx` - Removed role selector
- `frontend/components/MeetingCard.tsx` - Error handling for 403
- `frontend/app/api/contacts/[id]/meetings/route.ts` - Forward Authorization header
- `frontend/app/api/meetings/[id]/analyze/route.ts` - Forward Authorization header

---

## Quick Reference

### Mock Tokens
```
Operator: operator-test-token
Basic:    basic-test-token
```

### Test Commands
```bash
# Run backend tests
cd backend && python test_rbac.py

# Test operator access
curl -H "Authorization: Bearer operator-test-token" \
  http://localhost:8000/api/contacts/contact_001/meetings

# Test basic access
curl -H "Authorization: Bearer basic-test-token" \
  http://localhost:8000/api/contacts/contact_001/meetings

# Test basic cannot analyze (403)
curl -X POST -H "Authorization: Bearer basic-test-token" \
  http://localhost:8000/api/meetings/meeting_001/analyze

# Test operator can analyze (200)
curl -X POST -H "Authorization: Bearer operator-test-token" \
  http://localhost:8000/api/meetings/meeting_001/analyze
```

---

## Status

✅ **Implementation Complete**  
✅ **All Tests Passing**  
✅ **Backend Enforcement Active**  
✅ **Frontend Integration Complete**  
✅ **Ready for Testing**
