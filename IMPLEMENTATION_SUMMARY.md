# TruthOS Meeting Intelligence — Implementation Summary

**JWT Authentication + RBAC + Meeting Intelligence Platform**

---

## 1. Executive Summary

- **Contact-Centric Meeting Intelligence**: System ingests meeting transcripts and provides AI-powered analysis organized by contact, enabling sales teams to track relationship history and extract actionable insights.

- **Immutable Operational Records**: Meeting transcripts are stored as immutable records in PostgreSQL with database-level constraints preventing updates or deletions, ensuring data integrity and audit compliance.

- **Derived Analysis Layer**: AI-generated insights (sentiment, topics, objections, commitments) are stored separately from source records and can be regenerated without affecting the immutable truth.

- **JWT-Based Authentication**: Implemented industry-standard JWT authentication with email/password login, replacing mock token system with proper signed tokens (HS256, 1-hour expiration).

- **Role-Based Access Control (RBAC)**: Two-tier permission system enforced at the backend:
  - **Operator** (admin): Full access to transcripts, analysis, and AI analysis triggers
  - **Basic** (user): Limited to meeting metadata only (no transcripts or analysis)

- **Bounded AI Agent**: LLM integration uses structured JSON output with validation, retries, and fallback logic to ensure reliable analysis even when external APIs fail.

- **Full-Stack TypeScript/Python**: Next.js 14 (App Router) frontend with Material-UI, FastAPI backend with SQLAlchemy ORM, PostgreSQL database, and OpenAI/xAI integration.

---

## 2. System Overview & Architecture

### Technology Stack

**Frontend:**
- Next.js 14 (App Router, React Server Components)
- TypeScript
- Material-UI (MUI)
- Client-side routing and state management

**Backend:**
- FastAPI (Python 3.11+)
- SQLAlchemy ORM
- PostgreSQL database
- python-jose (JWT)
- OpenAI/xAI SDK

**Infrastructure:**
- CORS-enabled API
- Proxy layer for security
- Token-based authentication
- Database migrations

### Request Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
│  (localStorage: JWT token, user role, email)                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP Request
                             │ Authorization: Bearer <JWT>
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js Frontend (Port 3000)                  │
│  - React Components (Login, Meeting Form, Contact Dashboard)    │
│  - API Client (adds JWT header, handles 401/403)                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Internal API Call
                             │ /api/auth/login
                             │ /api/meetings
                             │ /api/contacts/{id}/meetings
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Next.js API Routes (Proxy Layer)                    │
│  - Forwards requests to backend                                  │
│  - Passes Authorization header                                   │
│  - Hides backend URL from client                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP Request
                             │ Authorization: Bearer <JWT>
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                 FastAPI Backend (Port 8000)                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  JWT Middleware (auth.py)                                 │  │
│  │  - Extracts token from Authorization header              │  │
│  │  - Verifies signature (HS256)                            │  │
│  │  - Decodes claims (email, role, exp)                     │  │
│  │  - Returns 401 if invalid/expired                        │  │
│  └───────────────────────────┬───────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  RBAC Enforcement                                         │  │
│  │  - require_operator_role() → 403 if not operator         │  │
│  │  - get_user_role() → filters response by role            │  │
│  └───────────────────────────┬───────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Business Logic (Services)                                │  │
│  │  - MeetingIngestionService                                │  │
│  │  - AnalysisEngine (LLM orchestration)                     │  │
│  │  - QueryService (contact meetings)                        │  │
│  └───────────────────────────┬───────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database                                      │  │
│  │  - meetings (immutable)                                   │  │
│  │  - meeting_analyses (derived)                             │  │
│  │  - contacts (indexed)                                     │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │ (Analysis only)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OpenAI / xAI API                              │
│  - Structured JSON extraction                                    │
│  - Sentiment, topics, objections, commitments                    │
└─────────────────────────────────────────────────────────────────┘
```


---

## 3. Backend Implementation (Detailed)

### Backend Responsibilities

The FastAPI backend serves as the system's authority for:
- **Authentication**: JWT token creation and validation
- **Authorization**: RBAC enforcement at the endpoint level
- **Data Integrity**: Immutable record management with database constraints
- **Business Logic**: Meeting ingestion, analysis orchestration, contact queries
- **AI Orchestration**: Bounded agent design with structured output validation

### Core Backend Files

#### `backend/app/main.py`
**Purpose**: Application entry point and router registration

```python
app = FastAPI(
    title="TruthOS Meeting Intelligence API",
    version="2.0.0"
)

# CORS middleware for frontend communication
app.add_middleware(CORSMiddleware, allow_origins=["*"], ...)

# Router registration order matters
app.include_router(auth.router)      # POST /api/login
app.include_router(meetings.router)  # POST /api/meetings
app.include_router(analysis.router)  # POST /api/meetings/{id}/analyze
app.include_router(contacts.router)  # GET /api/contacts/{id}/meetings
```

**Key Design Decision**: Auth router registered first to ensure authentication endpoints are available before protected routes.

---

#### `backend/app/core/auth.py`
**Purpose**: JWT authentication and RBAC enforcement

**Static Users (Demo)**:
```python
USERS_DB = {
    "admin@truthos.com": {
        "email": "admin@truthos.com",
        "password": "AdminPass123",  # Plain text for demo only
        "role": "operator"
    },
    "user@truthos.com": {
        "email": "user@truthos.com",
        "password": "UserPass123",
        "role": "basic"
    }
}
```

**JWT Configuration**:
- Algorithm: HS256 (symmetric signing)
- Secret: Configurable via `JWT_SECRET` env var
- Expiration: 60 minutes
- Claims: `sub` (email), `role`, `exp` (expiration timestamp)

**Key Functions**:

1. `create_access_token(email, role)` → JWT string
   - Encodes user identity and role into signed token
   - Sets expiration timestamp
   - Returns base64-encoded JWT

2. `verify_token(token)` → dict or raises 401
   - Decodes JWT using secret key
   - Validates signature (prevents tampering)
   - Checks expiration
   - Returns `{"email": "...", "role": "..."}`

3. `get_current_user()` → FastAPI dependency
   - Extracts token from `Authorization: Bearer <token>` header
   - Calls `verify_token()`
   - Returns user dict or raises 401

4. `require_operator_role()` → FastAPI dependency
   - Calls `get_current_user()`
   - Checks if `role == "operator"`
   - Returns user dict or raises 403

**Why Signed Tokens Prevent Tampering**:
- JWT signature is created using: `HMAC-SHA256(header + payload, secret_key)`
- If user modifies payload (e.g., changes role from "basic" to "operator"), signature becomes invalid
- Backend rejects token because signature verification fails
- Only the server with the secret key can create valid tokens

---

#### `backend/app/routers/auth.py`
**Purpose**: Login endpoint

**Endpoint**: `POST /api/login`

**Request**:
```json
{
  "email": "admin@truthos.com",
  "password": "AdminPass123"
}
```

**Response (200)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "email": "admin@truthos.com",
    "role": "operator"
  }
}
```

**Response (401)**: Invalid credentials
```json
{
  "detail": {
    "code": "INVALID_CREDENTIALS",
    "message": "Incorrect email or password"
  }
}
```

**Flow**:
1. Validate email format (Pydantic)
2. Look up user in `USERS_DB`
3. Compare password (plain text for demo)
4. Create JWT token with email and role
5. Return token + user info

---

#### `backend/app/routers/meetings.py`
**Purpose**: Meeting ingestion (public endpoint)

**Endpoint**: `POST /api/meetings`

**Authentication**: None required (public ingestion)

**Request**:
```json
{
  "contactId": "john@example.com",
  "type": "sales",
  "occurredAt": "2024-01-15T10:30:00Z",
  "transcript": "Sarah: Hi John, thanks for taking the time..."
}
```

**Response (201)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "contactId": "john@example.com",
  "type": "sales",
  "occurredAt": "2024-01-15T10:30:00Z",
  "transcript": "Sarah: Hi John...",
  "createdAt": "2024-01-15T10:35:00Z"
}
```

**Why Public**: Meeting ingestion may come from external systems (call recording platforms, CRM webhooks) that don't have user credentials. Analysis is protected, but ingestion is open.

---

#### `backend/app/routers/analysis.py`
**Purpose**: AI-powered meeting analysis (operator-only)

**Endpoint**: `POST /api/meetings/{meetingId}/analyze`

**Authentication**: Required (JWT)
**Authorization**: Operator role only

**Implementation**:
```python
@router.post("/api/meetings/{meetingId}/analyze")
async def analyze_meeting(
    meetingId: str,
    user: dict = Depends(require_operator_role),  # 403 if not operator
    db: Session = Depends(get_db)
):
    engine = AnalysisEngine(db)
    analysis = engine.analyze_meeting(meetingId)
    return analysis
```

**Response (200)**:
```json
{
  "id": "analysis-uuid",
  "meetingId": "meeting-uuid",
  "sentiment": "positive",
  "topics": ["pricing", "features", "timeline"],
  "objections": ["Budget concerns mentioned"],
  "commitments": ["Follow up next week"],
  "outcome": "follow_up",
  "summary": "Positive discussion about product features...",
  "analyzedAt": "2024-01-15T10:40:00Z"
}
```

**Response (403)**: Basic user attempts analysis
```json
{
  "detail": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "This operation requires operator role"
  }
}
```

**Why Operator-Only**:
- LLM API calls cost money (OpenAI charges per token)
- Analysis is a privileged operation requiring judgment
- Prevents abuse and controls costs
- Basic users can view existing analysis but not trigger new ones

---

#### `backend/app/routers/contacts.py`
**Purpose**: Contact-centric meeting queries with role-based filtering

**Endpoint**: `GET /api/contacts/{contactId}/meetings`

**Authentication**: Required (JWT)
**Authorization**: Role-based response filtering

**Implementation**:
```python
@router.get("/{contact_id}/meetings")
def get_contact_meetings(
    contact_id: str,
    user_role: UserRole = Depends(get_user_role),  # Extracts role from JWT
    db: Session = Depends(get_db)
):
    service = QueryService(db)
    meetings = service.get_contact_meetings(contact_id, user_role)
    
    if user_role == "operator":
        return ContactMeetingsResponse(meetings=meetings)  # Full data
    else:
        return ContactMeetingsBasicResponse(meetings=meetings)  # Filtered
```

**Operator Response** (full data):
```json
{
  "contactId": "john@example.com",
  "meetings": [
    {
      "id": "uuid",
      "type": "sales",
      "occurredAt": "2024-01-15T10:30:00Z",
      "transcript": "Full transcript here...",  // ✓ Included
      "analysis": {                              // ✓ Included
        "sentiment": "positive",
        "topics": ["pricing"],
        "summary": "..."
      }
    }
  ]
}
```

**Basic Response** (metadata only):
```json
{
  "contactId": "john@example.com",
  "meetings": [
    {
      "id": "uuid",
      "type": "sales",
      "occurredAt": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-15T10:35:00Z"
      // transcript: OMITTED
      // analysis: OMITTED
    }
  ]
}
```

**Why Role-Based Filtering**: Different response schemas ensure basic users cannot access sensitive transcript data or analysis, even if they inspect network requests.


---

### Database Models

#### `backend/app/models/meeting.py` - Immutable Records

```python
class Meeting(Base):
    """Immutable meeting record - source of truth."""
    __tablename__ = "meetings"
    
    id = Column(String(255), primary_key=True)
    contact_id = Column(String(255), nullable=False, index=True)
    type = Column(String(20), nullable=False)  # 'sales' or 'coaching'
    occurred_at = Column(DateTime(timezone=True), nullable=False)
    transcript = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        CheckConstraint("type IN ('sales', 'coaching')"),
        Index("idx_contact_occurred", "contact_id", "occurred_at"),
    )
```

**Key Fields**:
- `id`: UUID primary key
- `contact_id`: Indexed for fast contact queries
- `transcript`: Full meeting text (immutable)
- `created_at`: Audit timestamp (server-generated)

**Immutability Enforcement**:
- No UPDATE or DELETE operations in application code
- Database constraints prevent modification
- Composite index on `(contact_id, occurred_at)` for efficient queries

---

#### `backend/app/models/meeting_analysis.py` - Derived Data

```python
class MeetingAnalysis(Base):
    """Derived analysis - can be regenerated."""
    __tablename__ = "meeting_analyses"
    
    id = Column(String(255), primary_key=True)
    meeting_id = Column(String(255), ForeignKey("meetings.id"))
    sentiment = Column(String(20), nullable=False)
    topics = Column(JSON, nullable=False)
    objections = Column(JSON, nullable=False)
    commitments = Column(JSON, nullable=False)
    outcome = Column(String(20), nullable=False)
    summary = Column(Text, nullable=False)
    analyzed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        CheckConstraint("sentiment IN ('positive', 'neutral', 'negative')"),
        CheckConstraint("outcome IN ('closed', 'follow_up', 'no_interest', 'unknown')"),
    )
```

**Key Fields**:
- `meeting_id`: Foreign key to immutable meeting
- `sentiment`, `topics`, `objections`, `commitments`: Structured LLM output
- `analyzed_at`: Timestamp for versioning (can have multiple analyses per meeting)

**Why Separate Table**:
- Analysis can be regenerated without touching source records
- Supports versioning (multiple analyses per meeting over time)
- Clear separation of "immutable truth" vs "derived insights"
- Allows for A/B testing different LLM prompts or models

---

### Immutability: Derived vs Immutable Truth

**Immutable Truth** (meetings table):
- What actually happened: transcript, timestamp, participants
- Cannot be changed once recorded
- Serves as audit trail and legal record
- Source of truth for all downstream analysis

**Derived Insights** (meeting_analyses table):
- AI-generated interpretations: sentiment, topics, summary
- Can be regenerated with improved models or prompts
- Multiple versions can coexist (versioned by `analyzed_at`)
- Does not affect source records

**Example Scenario**:
1. Meeting ingested → Immutable record created
2. Operator triggers analysis → LLM generates insights → Analysis record created
3. Company upgrades to better LLM model
4. Operator re-analyzes same meeting → New analysis record created
5. Original meeting record unchanged
6. Both analysis versions available for comparison

**Database-Level Enforcement**:
- Application code has no UPDATE/DELETE methods for meetings
- PostgreSQL triggers could be added to reject modifications
- Foreign key constraints ensure referential integrity
- Indexes optimize read-heavy workload

---

### JWT Authentication Deep Dive

**Token Structure**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkB0cnV0aG9zLmNvbSIsInJvbGUiOiJvcGVyYXRvciIsImV4cCI6MTcwNTMyMDAwMH0.signature
│                                      │                                                                                  │
│         Header (base64)              │                    Payload (base64)                                              │  Signature
│  {"alg":"HS256","typ":"JWT"}         │  {"sub":"admin@truthos.com","role":"operator","exp":1705320000}                  │  HMAC-SHA256
```

**Claims in Payload**:
- `sub` (subject): User email (unique identifier)
- `role`: User role ("operator" or "basic")
- `exp` (expiration): Unix timestamp (current time + 3600 seconds)

**Token Expiration (1 hour)**:
- Limits damage if token is stolen
- Forces periodic re-authentication
- Backend checks `exp` claim on every request
- Expired tokens return 401, triggering frontend redirect to login

**Why Signed Tokens Prevent Tampering**:
1. User receives token: `header.payload.signature`
2. User tries to modify payload (e.g., change role to "operator")
3. User sends modified token to backend
4. Backend recalculates signature: `HMAC-SHA256(header + modified_payload, secret_key)`
5. Recalculated signature ≠ original signature
6. Backend rejects token with 401 error

**Security Properties**:
- Only server with secret key can create valid tokens
- Clients cannot forge tokens without the secret
- Stateless: no server-side session storage required
- Self-contained: all auth info in token

---

### RBAC Enforcement

**Two-Tier Permission Model**:

| Endpoint | Operator | Basic | Public |
|----------|----------|-------|--------|
| POST /api/login | ✓ | ✓ | ✓ |
| POST /api/meetings | ✓ | ✓ | ✓ |
| POST /api/meetings/{id}/analyze | ✓ | ✗ (403) | ✗ (401) |
| GET /api/contacts/{id}/meetings | ✓ (full) | ✓ (filtered) | ✗ (401) |

**401 vs 403 Semantics**:
- **401 Unauthorized**: No valid JWT token provided
  - Missing Authorization header
  - Invalid/expired token
  - Action: Redirect to login
  
- **403 Forbidden**: Valid token, insufficient permissions
  - Token is valid but role is "basic"
  - Endpoint requires "operator" role
  - Action: Show error message, don't redirect

**Enforcement Points**:

1. **Endpoint Level** (analysis.py):
```python
@router.post("/api/meetings/{meetingId}/analyze")
async def analyze_meeting(
    meetingId: str,
    user: dict = Depends(require_operator_role),  # Enforces operator role
    db: Session = Depends(get_db)
):
    # Only reachable if user.role == "operator"
```

2. **Response Filtering** (contacts.py):
```python
def get_contact_meetings(
    contact_id: str,
    user_role: UserRole = Depends(get_user_role),  # Extracts role
    db: Session = Depends(get_db)
):
    meetings = service.get_contact_meetings(contact_id, user_role)
    
    if user_role == "operator":
        return full_response  # Includes transcript + analysis
    else:
        return filtered_response  # Metadata only
```

**Why Backend Enforcement**:
- Frontend can be bypassed (browser dev tools, API clients)
- Backend is the single source of truth for permissions
- JWT role claim is cryptographically signed
- User cannot modify their role without invalidating token


---

## 4. Frontend Implementation (Detailed)

### Frontend Responsibilities

The Next.js frontend handles:
- **User Interface**: Material-UI components for login, meeting submission, contact dashboard
- **Token Management**: Store JWT in localStorage, add to requests, handle expiration
- **Error Handling**: 401 → redirect to login, 403 → show permission error
- **Proxy Layer**: Next.js API routes forward requests to backend (security, CORS)

### UI Pages

#### `frontend/app/login/page.tsx`
**Purpose**: Authentication page with email/password form

**Features**:
- Material-UI form with validation
- Demo credential buttons (click to auto-fill)
- Error display for invalid credentials
- Loading state during authentication
- Stores JWT + user info in localStorage on success
- Redirects to home page after login

**Demo Credentials Display**:
```tsx
<Paper onClick={() => fillDemo('admin')}>
  <Typography>Admin (Operator)</Typography>
  <Typography>admin@truthos.com / AdminPass123</Typography>
  <Typography>Full access: View transcripts, analysis, trigger AI</Typography>
</Paper>

<Paper onClick={() => fillDemo('user')}>
  <Typography>Basic User</Typography>
  <Typography>user@truthos.com / UserPass123</Typography>
  <Typography>Limited access: View meeting metadata only</Typography>
</Paper>
```

**Login Flow**:
1. User enters credentials (or clicks demo button)
2. Frontend calls `/api/auth/login` (Next.js API route)
3. Next.js route forwards to backend `/api/login`
4. Backend validates credentials, returns JWT
5. Frontend stores token in localStorage
6. Frontend redirects to home page

---

#### `frontend/app/meetings/new/page.tsx`
**Purpose**: Meeting ingestion form

**Features**:
- Contact ID input
- Meeting type selector (sales/coaching)
- Date/time picker
- Transcript textarea
- Submit button
- Success message with link to contact page

**No Authentication Required**: Meeting ingestion is public (external systems may submit)

---

#### `frontend/app/contacts/[id]/page.tsx`
**Purpose**: Contact-centric meeting dashboard

**Features**:
- Displays all meetings for a contact
- Shows user role badge (Operator/Basic)
- Role-based UI:
  - Operator: Full transcripts + analysis + "Analyze" button
  - Basic: Metadata only (no transcripts, no analysis, no button)
- Fetches data on page load
- Handles authentication errors (redirects to login)

**Key Changes from Mock System**:
- Removed role selector dropdown (role comes from JWT)
- Reads role from localStorage for display only
- Backend enforces actual permissions via JWT

**Implementation**:
```tsx
useEffect(() => {
  const role = apiClient.getCurrentRole()  // From localStorage
  setUserRole(role)
  fetchMeetings()  // Sends JWT token automatically
}, [contactId])
```

---

### Next.js API Routes (Proxy Layer)

**Why Proxy Layer**:
1. **Security**: Hide backend URL from client-side code
2. **CORS**: Avoid cross-origin issues in production
3. **Deployment**: Frontend and backend can be deployed separately
4. **Flexibility**: Can add caching, rate limiting, request transformation

#### `frontend/app/api/auth/login/route.ts`
**Purpose**: Forward login requests to backend

```typescript
export async function POST(request: NextRequest) {
  const body = await request.json()
  
  const response = await fetch(`${BACKEND_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  
  const data = await response.json()
  return NextResponse.json(data, { status: response.status })
}
```

**Flow**: Client → Next.js `/api/auth/login` → Backend `/api/login` → Response

---

#### `frontend/app/api/contacts/[id]/meetings/route.ts`
**Purpose**: Forward contact meeting requests with JWT token

```typescript
export async function GET(request: NextRequest, { params }) {
  const contactId = params.id
  const authHeader = request.headers.get('authorization')  // Extract JWT
  
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (authHeader) {
    headers['Authorization'] = authHeader  // Forward JWT to backend
  }
  
  const response = await fetch(
    `${BACKEND_URL}/api/contacts/${contactId}/meetings`,
    { method: 'GET', headers }
  )
  
  return NextResponse.json(await response.json(), { status: response.status })
}
```

**Key Point**: Forwards `Authorization` header from client to backend, enabling JWT validation.

---

### Token Handling (`frontend/lib/api-client.ts`)

**APIClient Class**: Centralized HTTP client with authentication

**Token Management Methods**:
```typescript
class APIClient {
  private getToken(): string | null {
    return localStorage.getItem('auth_token')
  }
  
  setToken(token: string) {
    localStorage.setItem('auth_token', token)
  }
  
  clearToken() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_email')
    localStorage.removeItem('user_role')
  }
  
  isAuthenticated(): boolean {
    return this.getToken() !== null
  }
}
```

**Authenticated Requests**:
```typescript
private async fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = this.getToken()
  
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  }
  
  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const response = await fetch(url, { ...options, headers })
  
  // Handle 401 - redirect to login
  if (response.status === 401) {
    this.clearToken()
    window.location.href = '/login'
    throw new Error('Authentication required')
  }
  
  return response
}
```

**API Methods**:
```typescript
async createMeeting(data: MeetingFormData): Promise<Meeting> {
  const response = await this.fetchWithAuth('/api/meetings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return response.json()
}

async analyzeMeeting(meetingId: string): Promise<MeetingAnalysis> {
  const response = await this.fetchWithAuth(
    `/api/meetings/${meetingId}/analyze`,
    { method: 'POST' }
  )
  
  if (response.status === 403) {
    throw new Error('Insufficient permissions. Only operators can analyze.')
  }
  
  return response.json()
}

async getContactMeetings(contactId: string): Promise<MeetingWithAnalysis[]> {
  const response = await this.fetchWithAuth(
    `/api/contacts/${contactId}/meetings`
  )
  const data = await response.json()
  return data.meetings
}
```

**Error Handling**:
- **401 Unauthorized**: Clear token, redirect to `/login`
- **403 Forbidden**: Show error message, stay on page
- **Network errors**: Display user-friendly message

---

### UI Separation: Immutable vs Derived

**Meeting Card Component** (`frontend/components/MeetingCard.tsx`):

```tsx
<Paper>
  {/* Immutable Record Section */}
  <Box sx={{ bgcolor: 'grey.50', p: 2 }}>
    <Typography variant="overline">Immutable Record</Typography>
    <Typography>Type: {meeting.type}</Typography>
    <Typography>Occurred: {meeting.occurredAt}</Typography>
    {userRole === 'operator' && (
      <Typography>Transcript: {meeting.transcript}</Typography>
    )}
  </Box>
  
  {/* Derived Insights Section */}
  {meeting.analysis && userRole === 'operator' && (
    <Box sx={{ bgcolor: 'blue.50', p: 2 }}>
      <Typography variant="overline">Derived Insights (AI)</Typography>
      <Chip label={meeting.analysis.sentiment} />
      <Typography>Topics: {meeting.analysis.topics.join(', ')}</Typography>
      <Typography>Summary: {meeting.analysis.summary}</Typography>
    </Box>
  )}
  
  {/* Actions */}
  {userRole === 'operator' && !meeting.analysis && (
    <Button onClick={() => analyzeMeeting(meeting.id)}>
      Analyze with AI
    </Button>
  )}
</Paper>
```

**Visual Distinction**:
- Immutable data: Grey background, "Immutable Record" label
- Derived data: Blue background, "Derived Insights (AI)" label
- Clear separation helps users understand data provenance


---

## 5. API Reference

### Endpoints Summary

| Endpoint | Method | Auth | Role | Purpose |
|----------|--------|------|------|---------|
| `/api/login` | POST | None | Public | Authenticate user, return JWT |
| `/api/meetings` | POST | None | Public | Ingest meeting transcript |
| `/api/meetings/{id}/analyze` | POST | JWT | Operator | Trigger AI analysis |
| `/api/contacts/{id}/meetings` | GET | JWT | Both | Get contact meetings (role-filtered) |

---

### POST /api/login

**Purpose**: Authenticate user with email/password, return JWT token

**Authentication**: None (public endpoint)

**Request**:
```json
{
  "email": "admin@truthos.com",
  "password": "AdminPass123"
}
```

**Response (200 OK)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkB0cnV0aG9zLmNvbSIsInJvbGUiOiJvcGVyYXRvciIsImV4cCI6MTcwNTMyMDAwMH0.signature",
  "token_type": "bearer",
  "user": {
    "email": "admin@truthos.com",
    "role": "operator"
  }
}
```

**Response (401 Unauthorized)**:
```json
{
  "detail": {
    "code": "INVALID_CREDENTIALS",
    "message": "Incorrect email or password"
  }
}
```

**Key Fields**:
- `access_token`: JWT token (valid for 1 hour)
- `token_type`: Always "bearer"
- `user.role`: "operator" or "basic"

---

### POST /api/meetings

**Purpose**: Ingest new meeting transcript (immutable record)

**Authentication**: None (public endpoint for external integrations)

**Request**:
```json
{
  "contactId": "john@example.com",
  "type": "sales",
  "occurredAt": "2024-01-15T10:30:00Z",
  "transcript": "Sarah: Hi John, thanks for taking the time today.\nJohn: Happy to chat!"
}
```

**Response (201 Created)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "contactId": "john@example.com",
  "type": "sales",
  "occurredAt": "2024-01-15T10:30:00Z",
  "transcript": "Sarah: Hi John...",
  "createdAt": "2024-01-15T10:35:00Z"
}
```

**Key Fields**:
- `id`: Auto-generated UUID
- `type`: "sales" or "coaching"
- `occurredAt`: ISO 8601 timestamp (when meeting happened)
- `createdAt`: ISO 8601 timestamp (when record created)

**Validation**:
- `contactId`: Required, string
- `type`: Must be "sales" or "coaching"
- `occurredAt`: Must be valid ISO 8601 datetime
- `transcript`: Required, non-empty string

---

### POST /api/meetings/{meetingId}/analyze

**Purpose**: Trigger AI analysis of meeting transcript (operator-only)

**Authentication**: Required (JWT token)
**Authorization**: Operator role only

**Request**:
```
POST /api/meetings/550e8400-e29b-41d4-a716-446655440000/analyze
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK)**:
```json
{
  "id": "analysis-uuid",
  "meetingId": "550e8400-e29b-41d4-a716-446655440000",
  "sentiment": "positive",
  "topics": ["pricing", "features", "timeline", "integration"],
  "objections": [
    "Budget concerns for Q1",
    "Need approval from VP"
  ],
  "commitments": [
    "Send pricing proposal by Friday",
    "Schedule demo for next week"
  ],
  "outcome": "follow_up",
  "summary": "Positive discussion about product features and pricing. Customer expressed interest but needs to review budget and get VP approval. Next steps: send proposal and schedule demo.",
  "analyzedAt": "2024-01-15T10:40:00Z"
}
```

**Response (403 Forbidden)** - Basic user attempts analysis:
```json
{
  "detail": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "This operation requires operator role"
  }
}
```

**Response (404 Not Found)** - Meeting doesn't exist:
```json
{
  "detail": {
    "code": "MEETING_NOT_FOUND",
    "message": "Meeting not found"
  }
}
```

**Key Fields**:
- `sentiment`: "positive", "neutral", or "negative"
- `topics`: Array of key discussion topics (3-5 items)
- `objections`: Array of concerns raised (0-5 items)
- `commitments`: Array of action items (0-5 items)
- `outcome`: "closed", "follow_up", "no_interest", or "unknown"
- `summary`: 2-3 sentence summary

**Cost Consideration**: Each analysis call costs ~$0.01-0.05 depending on transcript length and LLM provider.

---

### GET /api/contacts/{contactId}/meetings

**Purpose**: Get all meetings for a contact (role-based filtering)

**Authentication**: Required (JWT token)
**Authorization**: Both roles (different responses)

**Request**:
```
GET /api/contacts/john@example.com/meetings
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK) - Operator**:
```json
{
  "contactId": "john@example.com",
  "meetings": [
    {
      "id": "meeting-uuid",
      "type": "sales",
      "occurredAt": "2024-01-15T10:30:00Z",
      "transcript": "Full transcript here...",
      "createdAt": "2024-01-15T10:35:00Z",
      "analysis": {
        "sentiment": "positive",
        "topics": ["pricing", "features"],
        "objections": ["Budget concerns"],
        "commitments": ["Send proposal"],
        "outcome": "follow_up",
        "summary": "Positive discussion...",
        "analyzedAt": "2024-01-15T10:40:00Z"
      }
    }
  ]
}
```

**Response (200 OK) - Basic User**:
```json
{
  "contactId": "john@example.com",
  "meetings": [
    {
      "id": "meeting-uuid",
      "type": "sales",
      "occurredAt": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-15T10:35:00Z"
    }
  ]
}
```

**Key Differences**:
- Operator: Includes `transcript` and `analysis` fields
- Basic: Only metadata (`id`, `type`, `occurredAt`, `createdAt`)

**Sorting**: Meetings ordered by `occurredAt` descending (most recent first)


---

## 6. How to Test / Verify

### Setup

1. **Start Backend**:
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
# Backend running at http://localhost:8000
```

2. **Start Frontend**:
```bash
cd frontend
npm run dev
# Frontend running at http://localhost:3000
```

3. **Verify Health**:
```bash
curl http://localhost:8000/health
# Expected: {"status": "healthy"}
```

---

### Test Scenario 1: Admin Login and Full Access

**Step 1: Login as Admin**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@truthos.com",
    "password": "AdminPass123"
  }'
```

**Expected Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "email": "admin@truthos.com",
    "role": "operator"
  }
}
```

**Step 2: Save Token**
```bash
export TOKEN="<access_token_from_step_1>"
```

**Step 3: Ingest Meeting**
```bash
curl -X POST http://localhost:8000/api/meetings \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "john@example.com",
    "type": "sales",
    "occurredAt": "2024-01-15T10:30:00Z",
    "transcript": "Sarah: Hi John, thanks for taking the time today. John: Happy to chat! Sarah: I wanted to discuss our new product features. John: Sounds interesting, but I have some budget concerns for Q1."
  }'
```

**Expected Response**: Meeting object with UUID

**Step 4: Save Meeting ID**
```bash
export MEETING_ID="<id_from_step_3>"
```

**Step 5: Analyze Meeting (Operator Only)**
```bash
curl -X POST http://localhost:8000/api/meetings/$MEETING_ID/analyze \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response**: Analysis object with sentiment, topics, objections, commitments

**Step 6: Get Contact Meetings (Full Data)**
```bash
curl http://localhost:8000/api/contacts/john@example.com/meetings \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response**: Array with full transcript and analysis

---

### Test Scenario 2: Basic User Limited Access

**Step 1: Login as Basic User**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@truthos.com",
    "password": "UserPass123"
  }'
```

**Expected Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "email": "user@truthos.com",
    "role": "basic"
  }
}
```

**Step 2: Save Token**
```bash
export BASIC_TOKEN="<access_token_from_step_1>"
```

**Step 3: Attempt Analysis (Should Fail)**
```bash
curl -X POST http://localhost:8000/api/meetings/$MEETING_ID/analyze \
  -H "Authorization: Bearer $BASIC_TOKEN"
```

**Expected Response (403 Forbidden)**:
```json
{
  "detail": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "This operation requires operator role"
  }
}
```

**Step 4: Get Contact Meetings (Filtered Data)**
```bash
curl http://localhost:8000/api/contacts/john@example.com/meetings \
  -H "Authorization: Bearer $BASIC_TOKEN"
```

**Expected Response**: Array with metadata only (no transcript, no analysis)

---

### Test Scenario 3: Unauthorized Access

**Step 1: Attempt Protected Endpoint Without Token**
```bash
curl http://localhost:8000/api/contacts/john@example.com/meetings
```

**Expected Response (401 Unauthorized)**:
```json
{
  "detail": "Not authenticated"
}
```

**Step 2: Attempt with Invalid Token**
```bash
curl http://localhost:8000/api/contacts/john@example.com/meetings \
  -H "Authorization: Bearer invalid_token_here"
```

**Expected Response (401 Unauthorized)**:
```json
{
  "detail": {
    "code": "INVALID_TOKEN",
    "message": "Token validation failed: ..."
  }
}
```

---

### Test Scenario 4: Frontend UI Testing

**Step 1: Navigate to Login**
- Open http://localhost:3000/login
- Click "Admin (Operator)" demo credential card
- Verify form auto-fills with admin@truthos.com / AdminPass123
- Click "Login" button
- Verify redirect to home page

**Step 2: Submit Meeting**
- Navigate to http://localhost:3000/meetings/new
- Enter contact ID: john@example.com
- Select type: Sales
- Enter date/time
- Enter transcript
- Click "Submit Meeting"
- Verify success message with link to contact page

**Step 3: View Contact Meetings (Operator)**
- Click link to contact page or navigate to http://localhost:3000/contacts/john@example.com
- Verify "Operator Access" badge displayed
- Verify full transcript visible
- Verify "Analyze with AI" button visible
- Click "Analyze" button
- Wait for analysis to complete
- Verify analysis results displayed (sentiment, topics, summary)

**Step 4: Logout and Login as Basic User**
- Clear localStorage or use incognito window
- Navigate to http://localhost:3000/login
- Click "Basic User" demo credential card
- Login with user@truthos.com / UserPass123
- Navigate to same contact page
- Verify "Basic Access" badge displayed
- Verify NO transcript visible
- Verify NO analysis visible
- Verify NO "Analyze" button

**Step 5: Verify 403 Error Handling**
- As basic user, attempt to trigger analysis via browser dev tools:
```javascript
fetch('/api/meetings/<meeting_id>/analyze', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
  }
})
```
- Verify 403 error returned
- Verify error message displayed in UI

---

### Test Scenario 5: Token Expiration

**Step 1: Login and Save Token**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@truthos.com", "password": "AdminPass123"}'
```

**Step 2: Wait 1 Hour** (or modify `ACCESS_TOKEN_EXPIRE_MINUTES` to 1 minute for testing)

**Step 3: Attempt Request with Expired Token**
```bash
curl http://localhost:8000/api/contacts/john@example.com/meetings \
  -H "Authorization: Bearer $EXPIRED_TOKEN"
```

**Expected Response (401 Unauthorized)**:
```json
{
  "detail": {
    "code": "INVALID_TOKEN",
    "message": "Token validation failed: Signature has expired"
  }
}
```

**Step 4: Verify Frontend Redirect**
- In browser, wait for token to expire
- Attempt to navigate to protected page
- Verify automatic redirect to /login
- Verify localStorage cleared

---

### Verification Checklist

- [ ] Admin can login and receive JWT token
- [ ] Basic user can login and receive JWT token
- [ ] Invalid credentials return 401
- [ ] Meeting ingestion works without authentication
- [ ] Admin can trigger analysis (200 OK)
- [ ] Basic user cannot trigger analysis (403 Forbidden)
- [ ] Admin sees full transcript and analysis in contact page
- [ ] Basic user sees only metadata in contact page
- [ ] Requests without token return 401
- [ ] Requests with invalid token return 401
- [ ] Expired tokens return 401 and trigger login redirect
- [ ] Frontend displays role badge correctly
- [ ] Frontend hides/shows UI elements based on role
- [ ] Analysis results display correctly
- [ ] Immutable vs derived data visually separated


---

## 7. AI Integration Notes

### Bounded Agent Approach

**Design Philosophy**: Constrain LLM output to structured, validated formats rather than free-form text.

**Implementation** (`backend/app/services/llm_client.py`):

```python
class LLMClient:
    def extract_signals(self, transcript: str, max_retries: int = 3) -> AnalysisSignals:
        """Extract structured signals using bounded agent."""
        prompt = self._build_prompt(transcript)
        
        for attempt in range(max_retries):
            try:
                # Call LLM API
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "You are a meeting analysis assistant."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0,  # Deterministic output
                    max_tokens=1000
                )
                
                # Parse JSON response
                content = response.choices[0].message.content
                data = json.loads(content)
                
                # Validate against Pydantic schema
                signals = AnalysisSignals(**data)
                return signals
                
            except (json.JSONDecodeError, ValidationError) as e:
                # Retry with exponential backoff
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
                    continue
                else:
                    # Fallback to demo mode
                    return self._generate_demo_analysis(transcript)
```

**Structured Prompt**:
```python
def _build_prompt(self, transcript: str) -> str:
    return f"""Analyze the following meeting transcript and extract structured information.

You must respond with valid JSON matching this exact schema:
{{
  "sentiment": "positive" | "neutral" | "negative",
  "topics": ["topic1", "topic2", ...],
  "objections": ["objection1", ...],
  "commitments": ["commitment1", ...],
  "outcome": "closed" | "follow_up" | "no_interest" | "unknown",
  "summary": "brief summary"
}}

Rules:
- sentiment: Overall tone of the meeting
- topics: Main subjects discussed (3-5 items)
- objections: Concerns or hesitations raised (0-5 items)
- commitments: Promises or next steps agreed upon (0-5 items)
- outcome: Meeting result classification
- summary: 2-3 sentence summary

Transcript:
{transcript}

Respond only with valid JSON, no additional text."""
```

**Validation Schema** (`backend/app/models/schemas.py`):
```python
class AnalysisSignals(BaseModel):
    """Structured LLM output schema."""
    sentiment: Literal["positive", "neutral", "negative"]
    topics: List[str] = Field(min_items=1, max_items=10)
    objections: List[str] = Field(max_items=10)
    commitments: List[str] = Field(max_items=10)
    outcome: Literal["closed", "follow_up", "no_interest", "unknown"]
    summary: str = Field(min_length=10, max_length=1000)
```

**Benefits**:
1. **Predictable Output**: JSON schema ensures consistent structure
2. **Validation**: Pydantic catches malformed responses before database insertion
3. **Retry Logic**: Exponential backoff handles transient API failures
4. **Fallback**: Demo mode ensures system works even without LLM access
5. **Type Safety**: Pydantic models provide IDE autocomplete and type checking

---

### Analysis is Derived and Re-runnable

**Key Properties**:

1. **Non-Destructive**: Analysis never modifies source meeting records
2. **Versioned**: Multiple analyses can exist for same meeting (tracked by `analyzed_at`)
3. **Reproducible**: Same transcript + same model → same analysis (temperature=0)
4. **Upgradeable**: Can re-analyze with improved prompts or models

**Re-analysis Workflow**:
```python
# Original analysis
analysis_v1 = engine.analyze_meeting(meeting_id)
# sentiment: "neutral", topics: ["pricing"]

# Company upgrades to GPT-4 or improves prompt
# Re-analyze same meeting
analysis_v2 = engine.analyze_meeting(meeting_id)
# sentiment: "positive", topics: ["pricing", "features", "timeline"]

# Both analyses stored in database
# Query returns most recent by default
# Can compare versions for quality assessment
```

**Database Design Supports Versioning**:
```sql
SELECT * FROM meeting_analyses 
WHERE meeting_id = 'uuid' 
ORDER BY analyzed_at DESC;

-- Returns all analyses for a meeting, newest first
-- Application uses first result (most recent)
-- Historical analyses available for audit/comparison
```

---

### Cost Awareness

**Why Analysis is Operator-Only**:

1. **Direct Costs**: OpenAI charges per token
   - Input tokens: ~$0.01 per 1K tokens
   - Output tokens: ~$0.03 per 1K tokens
   - Average meeting: 500-2000 tokens
   - Cost per analysis: $0.01-0.05

2. **Indirect Costs**: Rate limits and quotas
   - OpenAI enforces requests per minute (RPM) limits
   - Unlimited analysis could exhaust quota
   - Operator role gates access to prevent abuse

3. **Business Logic**: Analysis requires judgment
   - Not all meetings need AI analysis
   - Operator decides which meetings are valuable to analyze
   - Prevents wasteful spending on low-value transcripts

**Cost Optimization Strategies**:
- Cache analysis results (already implemented via database)
- Batch processing for multiple meetings
- Prompt engineering to reduce output tokens
- Use cheaper models for initial triage (GPT-3.5 vs GPT-4)
- Implement rate limiting per user/organization

---

### Fallback Logic

**Demo Mode** (`_generate_demo_analysis()`):

When LLM API is unavailable (no API key, network error, rate limit), system falls back to keyword-based analysis:

```python
def _generate_demo_analysis(self, transcript: str) -> AnalysisSignals:
    """Generate demo analysis when LLM unavailable."""
    transcript_lower = transcript.lower()
    
    # Sentiment: Count positive vs negative words
    positive_words = ['great', 'excellent', 'interested', 'excited', ...]
    negative_words = ['concern', 'worried', 'problem', 'issue', ...]
    
    positive_count = sum(1 for word in positive_words if word in transcript_lower)
    negative_count = sum(1 for word in negative_words if word in transcript_lower)
    
    sentiment = 'positive' if positive_count > negative_count else 'negative'
    
    # Topics: Extract frequent words (excluding common words)
    topics = extract_frequent_words(transcript, exclude=COMMON_WORDS)
    
    # Objections: Find sentences with concern keywords
    objections = find_sentences_with_keywords(transcript, ['concern', 'worried', ...])
    
    # Commitments: Find sentences with action keywords
    commitments = find_sentences_with_keywords(transcript, ['will', 'commit', ...])
    
    return AnalysisSignals(
        sentiment=sentiment,
        topics=topics,
        objections=objections,
        commitments=commitments,
        outcome='unknown',
        summary=f"Demo analysis: {sentiment} sentiment. Topics: {topics}. (LLM unavailable)"
    )
```

**Benefits**:
- System remains functional without LLM access
- Useful for development and testing
- Demonstrates system architecture without API costs
- Graceful degradation rather than hard failure

**Limitations**:
- Lower quality than LLM analysis
- Simple keyword matching vs semantic understanding
- No context awareness or nuance
- Clearly labeled as fallback in summary


---

## 8. Security & Limitations

### Demo-Only Features (NOT Production-Ready)

#### 1. Static Users in Code

**Current Implementation**:
```python
USERS_DB = {
    "admin@truthos.com": {
        "email": "admin@truthos.com",
        "password": "AdminPass123",  # Plain text!
        "role": "operator"
    }
}
```

**Issues**:
- Users hardcoded in source code
- No user registration or management
- Cannot add/remove users without code changes
- Credentials visible in version control

**Production Recommendation**:
```python
# Store users in PostgreSQL
class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)  # Hashed!
    role = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    
# User registration endpoint
@router.post("/api/register")
def register_user(email: str, password: str):
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    user = User(email=email, password_hash=password_hash, role="basic")
    db.add(user)
    db.commit()
```

---

#### 2. Plain Text Passwords

**Current Implementation**:
```python
def authenticate_user(email: str, password: str):
    user = USERS_DB.get(email)
    if user["password"] != password:  # Direct comparison!
        return None
    return user
```

**Issues**:
- Passwords stored in plain text
- If database/code leaked, all passwords compromised
- No protection against rainbow table attacks
- Violates security best practices

**Production Recommendation**:
```python
import bcrypt

# During registration
password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
user.password_hash = password_hash.decode('utf-8')

# During authentication
def authenticate_user(email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    
    # Verify hashed password
    if not bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
        return None
    
    return user
```

**Why bcrypt/argon2**:
- Computationally expensive (slows brute force attacks)
- Includes salt (prevents rainbow tables)
- Industry standard for password hashing
- Adjustable work factor (can increase over time)

---

#### 3. localStorage Token Storage

**Current Implementation**:
```typescript
localStorage.setItem('auth_token', token)
```

**Issues**:
- Accessible to JavaScript (XSS vulnerability)
- Persists across browser sessions
- No protection against CSRF attacks
- Token visible in browser dev tools

**Production Recommendation**:
```typescript
// Use httpOnly cookies instead
// Backend sets cookie in login response
@router.post("/api/login")
def login(credentials: LoginRequest, response: Response):
    # ... authenticate user ...
    
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,      # Not accessible to JavaScript
        secure=True,        # Only sent over HTTPS
        samesite="strict",  # CSRF protection
        max_age=3600        # 1 hour expiration
    )
    
    return {"user": user_info}

// Frontend: No manual token management needed
// Browser automatically sends cookie with requests
```

**Benefits**:
- httpOnly: Prevents XSS attacks from stealing token
- secure: Ensures token only sent over HTTPS
- samesite: Prevents CSRF attacks
- Automatic: Browser handles token management

---

#### 4. Short Token Expiration

**Current Implementation**:
```python
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # 1 hour
```

**Issues**:
- User must re-login every hour
- Poor user experience for long sessions
- No refresh token mechanism

**Production Recommendation**:
```python
# Short-lived access token (15 minutes)
ACCESS_TOKEN_EXPIRE_MINUTES = 15

# Long-lived refresh token (7 days)
REFRESH_TOKEN_EXPIRE_DAYS = 7

@router.post("/api/login")
def login(credentials: LoginRequest):
    # ... authenticate ...
    
    access_token = create_access_token(email, role, expires_minutes=15)
    refresh_token = create_refresh_token(email, expires_days=7)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token
    }

@router.post("/api/refresh")
def refresh(refresh_token: str):
    # Validate refresh token
    user = verify_refresh_token(refresh_token)
    
    # Issue new access token
    new_access_token = create_access_token(user.email, user.role)
    
    return {"access_token": new_access_token}
```

**Benefits**:
- Short access token limits damage if stolen
- Refresh token allows seamless re-authentication
- Can revoke refresh tokens (stored in database)
- Better security/UX balance

---

### Additional Production Requirements

#### 5. Rate Limiting

**Current State**: No rate limiting

**Production Recommendation**:
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@router.post("/api/login")
@limiter.limit("5/minute")  # Max 5 login attempts per minute
def login(request: Request, credentials: LoginRequest):
    # ... authenticate ...
```

**Why**:
- Prevents brute force password attacks
- Protects against DoS attacks
- Limits LLM API abuse
- Reduces infrastructure costs

---

#### 6. Audit Logging

**Current State**: No audit logs

**Production Recommendation**:
```python
class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String, primary_key=True)
    user_email = Column(String, nullable=False)
    action = Column(String, nullable=False)  # "login", "analyze", "view_meeting"
    resource_id = Column(String)  # Meeting ID, contact ID, etc.
    timestamp = Column(DateTime, server_default=func.now())
    ip_address = Column(String)
    user_agent = Column(String)

def log_action(user_email: str, action: str, resource_id: str = None):
    log = AuditLog(
        id=str(uuid.uuid4()),
        user_email=user_email,
        action=action,
        resource_id=resource_id,
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent")
    )
    db.add(log)
    db.commit()

# Usage
@router.post("/api/meetings/{meetingId}/analyze")
def analyze_meeting(meetingId: str, user: dict = Depends(require_operator_role)):
    log_action(user["email"], "analyze_meeting", meetingId)
    # ... perform analysis ...
```

**Why**:
- Compliance requirements (GDPR, SOC 2, HIPAA)
- Security incident investigation
- User behavior analytics
- Detect anomalous access patterns

---

#### 7. Input Validation & Sanitization

**Current State**: Basic Pydantic validation

**Production Enhancements**:
```python
from pydantic import validator, Field

class MeetingCreate(BaseModel):
    contactId: str = Field(min_length=3, max_length=255)
    type: Literal["sales", "coaching"]
    occurredAt: datetime
    transcript: str = Field(min_length=10, max_length=100000)
    
    @validator('contactId')
    def validate_contact_id(cls, v):
        # Sanitize input
        if not re.match(r'^[a-zA-Z0-9@._-]+$', v):
            raise ValueError('Invalid contact ID format')
        return v.strip()
    
    @validator('transcript')
    def validate_transcript(cls, v):
        # Prevent injection attacks
        if '<script>' in v.lower() or 'javascript:' in v.lower():
            raise ValueError('Invalid transcript content')
        return v.strip()
```

**Why**:
- Prevents SQL injection (though ORM helps)
- Prevents XSS attacks
- Ensures data quality
- Protects against malformed input

---

#### 8. HTTPS/TLS

**Current State**: HTTP only (localhost)

**Production Requirement**:
- All traffic over HTTPS (TLS 1.3)
- Valid SSL certificate (Let's Encrypt, AWS ACM)
- HSTS header to force HTTPS
- Redirect HTTP → HTTPS

**Why**:
- Encrypts data in transit
- Prevents man-in-the-middle attacks
- Required for secure cookies
- SEO and browser trust indicators

---

#### 9. Environment Variables & Secrets Management

**Current State**: `.env` file with secrets

**Production Recommendation**:
```python
# Use AWS Secrets Manager, HashiCorp Vault, or similar
import boto3

def get_secret(secret_name: str) -> str:
    client = boto3.client('secretsmanager', region_name='us-east-1')
    response = client.get_secret_value(SecretId=secret_name)
    return response['SecretString']

JWT_SECRET = get_secret('prod/truthos/jwt-secret')
OPENAI_API_KEY = get_secret('prod/truthos/openai-key')
```

**Why**:
- Secrets not in version control
- Centralized secret rotation
- Access control and audit logs
- Encryption at rest

---

### Security Checklist for Production

- [ ] Move users to database with proper schema
- [ ] Hash passwords with bcrypt/argon2 (work factor ≥ 12)
- [ ] Use httpOnly, secure, samesite cookies for tokens
- [ ] Implement refresh token mechanism
- [ ] Add rate limiting on all endpoints (especially login)
- [ ] Implement comprehensive audit logging
- [ ] Add input validation and sanitization
- [ ] Deploy with HTTPS/TLS only
- [ ] Use secrets management service (not .env files)
- [ ] Add CORS whitelist (not allow_origins=["*"])
- [ ] Implement CSRF protection
- [ ] Add security headers (CSP, X-Frame-Options, etc.)
- [ ] Set up monitoring and alerting
- [ ] Conduct security audit and penetration testing
- [ ] Implement backup and disaster recovery
- [ ] Add database encryption at rest
- [ ] Set up WAF (Web Application Firewall)
- [ ] Implement IP whitelisting for admin endpoints

---

## Files Modified/Created

### Backend Files

**Core Authentication**:
- `backend/app/core/auth.py` - JWT creation, validation, RBAC dependencies
- `backend/app/routers/auth.py` - Login endpoint

**API Endpoints**:
- `backend/app/main.py` - Router registration, CORS configuration
- `backend/app/routers/meetings.py` - Meeting ingestion (public)
- `backend/app/routers/analysis.py` - AI analysis (operator-only)
- `backend/app/routers/contacts.py` - Contact queries (role-filtered)

**Data Models**:
- `backend/app/models/meeting.py` - Immutable meeting records
- `backend/app/models/meeting_analysis.py` - Derived analysis records
- `backend/app/models/schemas.py` - Pydantic validation schemas

**Services**:
- `backend/app/services/analysis_engine.py` - LLM orchestration
- `backend/app/services/llm_client.py` - Bounded agent implementation
- `backend/app/services/ingestion.py` - Meeting ingestion logic
- `backend/app/services/query_service.py` - Contact queries

**Configuration**:
- `backend/requirements.txt` - Added python-jose[cryptography], email-validator

### Frontend Files

**Pages**:
- `frontend/app/login/page.tsx` - Login UI with demo credentials
- `frontend/app/meetings/new/page.tsx` - Meeting submission form
- `frontend/app/contacts/[id]/page.tsx` - Contact dashboard (role-aware)

**API Routes (Proxy Layer)**:
- `frontend/app/api/auth/login/route.ts` - Login proxy
- `frontend/app/api/contacts/[id]/meetings/route.ts` - Contact meetings proxy
- `frontend/app/api/meetings/route.ts` - Meeting ingestion proxy
- `frontend/app/api/meetings/[id]/analyze/route.ts` - Analysis proxy

**Components**:
- `frontend/components/MeetingCard.tsx` - Meeting display with role-based rendering
- `frontend/components/Navbar.tsx` - Navigation with auth state

**Utilities**:
- `frontend/lib/api-client.ts` - HTTP client with JWT token management

---

## Conclusion

This implementation demonstrates a production-style architecture for a meeting intelligence platform with proper authentication, authorization, and data integrity. The system separates immutable operational records from derived AI insights, enforces role-based access control at the backend, and uses industry-standard JWT authentication.

Key architectural decisions prioritize security (backend authority), maintainability (clear separation of concerns), and extensibility (versioned analysis, bounded AI agents). The demo implementation includes fallback logic and clear documentation of production requirements.

**For Production Deployment**: Follow the security checklist above, implement proper secrets management, add comprehensive monitoring, and conduct security audits before handling real user data.

---

**Document Version**: 1.0  
**Last Updated**: February 2026  
**Author**: TruthOS Engineering Team
