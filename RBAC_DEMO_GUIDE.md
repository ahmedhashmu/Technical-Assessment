# Token-Based RBAC - Demo Guide

## Quick Demo Script

Follow this script to demonstrate the new token-based RBAC system.

---

## Setup

1. **Start Backend**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

2. **Start Frontend**
```bash
cd frontend
npm run dev
```

3. **Open Browser**
```
http://localhost:3000
```

---

## Demo Flow

### Part 1: Login System

**What to Show:**
1. Open http://localhost:3000
2. Login modal appears automatically
3. Two options visible:
   - "Login as Operator" (green icon)
   - "Login as Basic User" (yellow icon)
4. Click "Login as Operator"
5. Page reloads
6. Navbar now shows:
   - Green "Operator" badge
   - User icon for logout

**Key Points:**
- ✅ Cannot access app without logging in
- ✅ Modal cannot be dismissed
- ✅ Clear visual distinction between roles

---

### Part 2: Operator Access (Full Permissions)

**What to Show:**
1. Click "Contacts" in navbar
2. Click on "contact_001"
3. Show access level banner:
   - Green "Operator - Full Access" badge
   - Blue info alert: "You can see full transcripts and AI analysis"
4. Scroll to meeting cards
5. Point out visible elements:
   - ✅ Full transcript preview
   - ✅ AI analysis (sentiment, outcome, summary)
   - ✅ "Analyze" button (if no analysis yet)
6. Click "Analyze" button on a meeting without analysis
7. Show successful analysis (200 OK)

**Key Points:**
- ✅ Operator sees everything
- ✅ Can trigger AI analysis
- ✅ Full transcript visible
- ✅ Analysis results displayed

---

### Part 3: Logout and Switch to Basic User

**What to Show:**
1. Click user icon in navbar (top right)
2. Click "Logout"
3. Login modal appears again
4. Click "Login as Basic User"
5. Page reloads
6. Navbar now shows:
   - Yellow "Basic User" badge

**Key Points:**
- ✅ Clean logout process
- ✅ Must re-authenticate
- ✅ Visual indication of role change

---

### Part 4: Basic User Access (Limited Permissions)

**What to Show:**
1. Navigate to same contact page
2. Show access level banner:
   - Yellow "Basic User - Limited Access" badge
   - Orange warning alert: "You can only see meeting metadata"
3. Scroll to meeting cards
4. Point out what's visible:
   - ✅ Meeting ID
   - ✅ Meeting type (sales/coaching)
   - ✅ Date and time
   - ✅ "Limited Access" badge
5. Point out what's hidden:
   - ❌ No transcript
   - ❌ No analysis
   - ❌ Message: "Transcript and analysis are only available to operators"

**Key Points:**
- ✅ Basic user sees metadata only
- ✅ Sensitive data completely hidden
- ✅ Clear messaging about restrictions

---

### Part 5: Authorization Failure (403)

**What to Show:**
1. Still logged in as Basic User
2. Find a meeting without analysis
3. Click "Analyze" button
4. Show error message appears:
   - Red text: "Insufficient permissions. Only operators can analyze meetings."
5. Explain: Backend returned 403 Forbidden

**Key Points:**
- ✅ Basic users cannot analyze
- ✅ Backend enforces restriction
- ✅ Clear error message
- ✅ User stays logged in (not kicked out)

---

### Part 6: Backend API Testing

**What to Show:**

1. **Test Missing Token (401)**
```bash
curl http://localhost:8000/api/contacts/contact_001/meetings
```
**Expected:** 401 Unauthorized

2. **Test Invalid Token (401)**
```bash
curl -H "Authorization: Bearer fake-token" \
  http://localhost:8000/api/contacts/contact_001/meetings
```
**Expected:** 401 Unauthorized

3. **Test Basic Token (Limited Data)**
```bash
curl -H "Authorization: Bearer basic-test-token" \
  http://localhost:8000/api/contacts/contact_001/meetings
```
**Expected:** 200 OK with metadata only (no transcript, no analysis)

4. **Test Operator Token (Full Data)**
```bash
curl -H "Authorization: Bearer operator-test-token" \
  http://localhost:8000/api/contacts/contact_001/meetings
```
**Expected:** 200 OK with full data (transcript + analysis)

5. **Test Basic Cannot Analyze (403)**
```bash
curl -X POST \
  -H "Authorization: Bearer basic-test-token" \
  http://localhost:8000/api/meetings/meeting_001/analyze
```
**Expected:** 403 Forbidden

6. **Test Operator Can Analyze (200)**
```bash
curl -X POST \
  -H "Authorization: Bearer operator-test-token" \
  http://localhost:8000/api/meetings/meeting_001/analyze
```
**Expected:** 200 OK with analysis result

**Key Points:**
- ✅ Backend enforces all restrictions
- ✅ Cannot bypass with frontend manipulation
- ✅ Proper HTTP status codes
- ✅ Clear error messages

---

### Part 7: Automated Test Suite

**What to Show:**
```bash
cd backend
python test_rbac.py
```

**Expected Output:**
```
================================================================================
Token-Based RBAC - Validation Tests
================================================================================

1. Testing missing Authorization header...
   ✓ PASS: Returns 401 Unauthorized

2. Testing invalid token format...
   ✓ PASS: Returns 401 Unauthorized

3. Testing invalid token...
   ✓ PASS: Returns 401 Unauthorized

4. Testing operator token (full access)...
   ✓ PASS: Returns 200 OK
   - Has transcript: True
   - Has analysis: True

5. Testing basic token (limited access)...
   ✓ PASS: Returns 200 OK
   - Has transcript: False
   - Has analysis: False
   ✓ PASS: Transcript and analysis correctly excluded

6. Testing basic user cannot analyze meeting...
   ✓ PASS: Returns 403 Forbidden

7. Testing operator can analyze meeting...
   ✓ PASS: Returns 200 OK

8. Comparing operator vs basic responses...
   ✓ PASS: Correct fields excluded for basic users

================================================================================
Test Summary: ALL TESTS PASSING ✓
================================================================================
```

**Key Points:**
- ✅ Comprehensive test coverage
- ✅ All 8 tests passing
- ✅ Validates authentication and authorization
- ✅ Confirms data filtering works

---

## Comparison: Before vs After

### Before (Insecure)
```
❌ Role dropdown on contact page
❌ User could select any role
❌ Frontend sent x-user-role header
❌ No real authentication
❌ Easy to bypass restrictions
```

### After (Secure)
```
✅ Login modal at app level
✅ Token-based authentication
✅ Backend validates tokens
✅ Cannot manipulate role
✅ Proper 401/403 error handling
✅ Role badge in navbar
✅ Logout functionality
```

---

## Key Talking Points

### Security
- "Backend enforces all access control - frontend cannot bypass"
- "Tokens are validated on every request"
- "Operator-only endpoints return 403 for basic users"
- "Clear separation between authentication (401) and authorization (403)"

### User Experience
- "Simple login flow with clear role selection"
- "Visual feedback showing current role"
- "Helpful error messages when access denied"
- "Clean logout and re-login process"

### Implementation Quality
- "Production-style code with dependency injection"
- "Comprehensive test coverage"
- "Proper HTTP status codes"
- "Clean separation of concerns"

---

## Common Questions

**Q: Are these real tokens?**
A: No, these are mock tokens for demo purposes. In production, you'd use JWT or OAuth2.

**Q: Where are tokens stored?**
A: In localStorage. For production, use httpOnly cookies for better security.

**Q: Can users bypass this?**
A: No. Even if they manipulate the frontend, the backend validates every request.

**Q: What happens if token expires?**
A: Currently tokens don't expire. In production, implement token expiration and refresh.

**Q: Can basic users see any meeting data?**
A: Yes, they see metadata (ID, type, date) but not transcripts or analysis.

---

## Demo Checklist

Before starting demo:
- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Database has sample meetings
- [ ] Browser cleared (no cached tokens)
- [ ] Terminal ready for curl commands

During demo:
- [ ] Show login modal
- [ ] Demo operator access (full data)
- [ ] Demo logout process
- [ ] Demo basic access (limited data)
- [ ] Show 403 error when basic tries to analyze
- [ ] Run curl commands to show backend enforcement
- [ ] Run automated test suite

After demo:
- [ ] Answer questions
- [ ] Show documentation (TOKEN_RBAC_GUIDE.md)
- [ ] Discuss production considerations

---

## URLs for Demo

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Sample Contact**: http://localhost:3000/contacts/contact_001

---

## Mock Credentials

```
Operator Token: operator-test-token
Basic Token:    basic-test-token
```

---

## Status

✅ **Ready for Demo**

All features working:
- Login system
- Token validation
- Role-based access control
- Data filtering
- Error handling
- Automated tests
