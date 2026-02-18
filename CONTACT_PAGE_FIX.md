# Contact Page Authentication Fix

## Problem
When entering a contact ID, the page showed an error and redirected to the login page. This was caused by authentication issues with the contact meetings endpoint.

## Root Causes

1. **Frontend Contact Page** (`frontend/app/contacts/[id]/page.tsx`):
   - Still had the old role selector dropdown (from mock token system)
   - Was calling `apiClient.getContactMeetings(contactId, role)` with a role parameter
   - The API client method doesn't accept a role parameter anymore

2. **Next.js API Route** (`frontend/app/api/contacts/[id]/meetings/route.ts`):
   - Was looking for `x-user-role` header (old mock system)
   - Was NOT forwarding the JWT Authorization header to the backend
   - Backend requires JWT token for authentication

3. **API Client** (`frontend/lib/api-client.ts`):
   - Method signature was correct: `getContactMeetings(contactId: string)`
   - But the contact page was calling it with wrong parameters

## Changes Made

### 1. Fixed Contact Page (`frontend/app/contacts/[id]/page.tsx`)

**Removed:**
- Role selector dropdown (FormControl with Select)
- `handleRoleChange()` function
- Role parameter from `fetchMeetings()` function
- Role parameter from `apiClient.getContactMeetings()` call

**Changed:**
- `userRole` state now gets value from `apiClient.getCurrentRole()` (reads from localStorage)
- Removed role as dependency in useEffect
- Simplified the UI to show current role as a badge instead of dropdown
- Role info now displays as an Alert banner instead of in a separate Paper

**Before:**
```typescript
const [userRole, setUserRole] = useState<UserRole>('operator')

const fetchMeetings = async (role: UserRole) => {
  const data = await apiClient.getContactMeetings(contactId, role)
  // ...
}

useEffect(() => {
  fetchMeetings(userRole)
}, [contactId, userRole])
```

**After:**
```typescript
const [userRole, setUserRole] = useState<UserRole | null>(null)

const fetchMeetings = async () => {
  const data = await apiClient.getContactMeetings(contactId)
  // ...
}

useEffect(() => {
  const role = apiClient.getCurrentRole()
  setUserRole(role)
  fetchMeetings()
}, [contactId])
```

### 2. Fixed Next.js API Route (`frontend/app/api/contacts/[id]/meetings/route.ts`)

**Changed:**
- Extract `authorization` header instead of `x-user-role`
- Forward `Authorization` header to backend instead of `x-user-role`

**Before:**
```typescript
// Extract role header from incoming request
const userRole = request.headers.get('x-user-role')

// Forward role header if present
if (userRole) {
  headers['x-user-role'] = userRole
}
```

**After:**
```typescript
// Extract Authorization header from incoming request
const authHeader = request.headers.get('authorization')

// Forward Authorization header if present
if (authHeader) {
  headers['Authorization'] = authHeader
}
```

## How It Works Now

### Authentication Flow:

1. **User logs in** → JWT token stored in localStorage
2. **User navigates to contact page** → Page loads
3. **Frontend reads role** from localStorage (for display only)
4. **Frontend calls API** → `apiClient.getContactMeetings(contactId)`
5. **API client adds JWT token** → `Authorization: Bearer <token>` header
6. **Next.js API route forwards token** → To backend
7. **Backend validates JWT** → Extracts user email and role
8. **Backend returns data** → Based on role in JWT:
   - Operator: Full data (transcript + analysis)
   - Basic: Limited data (metadata only)

### Key Points:

- Role is determined by the JWT token (backend authority)
- Frontend displays role from localStorage (for UI only)
- User cannot change their role (no dropdown)
- Role comes from login credentials (admin vs user account)
- Backend enforces all access control

## Testing

### Test as Operator:
1. Login with: admin@truthos.com / AdminPass123
2. Submit a meeting with a contact ID
3. Navigate to contact page
4. Should see: Full transcript and analysis
5. Badge shows: "Operator Access" (green)

### Test as Basic User:
1. Login with: user@truthos.com / UserPass123
2. Navigate to same contact page
3. Should see: Meeting metadata only (no transcript, no analysis)
4. Badge shows: "Basic Access" (orange)

## Files Modified

1. `frontend/app/contacts/[id]/page.tsx` - Removed role selector, fixed API call
2. `frontend/app/api/contacts/[id]/meetings/route.ts` - Forward JWT token instead of role header

## Result

✅ Contact page now works correctly with JWT authentication
✅ No more redirect to login page
✅ Role-based access control enforced by backend
✅ Clean UI without confusing role selector
✅ User role displayed as informational badge
