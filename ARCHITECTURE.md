# Architecture Document

## System Overview

TruthOS Meeting Intelligence is a full-stack application implementing a contact-centric meeting analysis system with strict separation between immutable operational records and derived analytical data.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 14)                     │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │ Meeting Form     │         │ Contact Dashboard│         │
│  │ - Submit         │         │ - View Meetings  │         │
│  │ - Validate       │         │ - Trigger Analysis│        │
│  └──────────────────┘         └──────────────────┘         │
│                                                              │
│  Components: Navbar, Footer, MeetingCard, Forms            │
│  Styling: Tailwind CSS, Poppins Font, Lucide Icons         │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼ HTTPS/REST API
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Python FastAPI)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Ingestion   │  │   Analysis   │  │    Query     │     │
│  │   Service    │  │    Engine    │  │   Service    │     │
│  │              │  │              │  │              │     │
│  │ - Validate   │  │ - LLM Call   │  │ - Join Data  │     │
│  │ - Persist    │  │ - Extract    │  │ - Order      │     │
│  │ - Return     │  │ - Store      │  │ - Return     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  Routers: /meetings, /analyze, /contacts                   │
│  Models: Pydantic schemas, SQLAlchemy ORM                  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI Layer (LLM)                            │
│              Bounded Agent with Schema Validation            │
│                                                              │
│  - Structured prompts with JSON schema                      │
│  - Retry logic (3 attempts, exponential backoff)           │
│  - Pydantic validation                                      │
│  - Support: OpenAI GPT-4, xAI Grok                         │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer (PostgreSQL)                    │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │ Immutable Records│         │  Derived Data    │         │
│  │   (Meetings)     │         │   (Analyses)     │         │
│  │                  │         │                  │         │
│  │ - Triggers       │         │ - Regenerable    │         │
│  │ - No UPDATE      │         │ - Multiple OK    │         │
│  │ - No DELETE      │         │ - Timestamped    │         │
│  └──────────────────┘         └──────────────────┘         │
│                                                              │
│  Provider: Neon (Serverless PostgreSQL)                     │
│  Features: Connection pooling, SSL, Auto-backup             │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Meeting Ingestion Flow

```
User → Form → API Client → POST /api/meetings → Ingestion Service
                                                        ↓
                                                   Validate
                                                        ↓
                                                   Persist
                                                        ↓
                                              meetings table
                                                        ↓
                                                   Return
                                                        ↓
                                              Success Message
```

### 2. Analysis Flow

```
User → Click Analyze → POST /api/meetings/{id}/analyze → Analysis Engine
                                                                ↓
                                                          Get Meeting
                                                                ↓
                                                          LLM Client
                                                                ↓
                                                    Bounded Agent Call
                                                                ↓
                                                    Extract Signals
                                                                ↓
                                                    Validate Schema
                                                                ↓
                                                    Persist Analysis
                                                                ↓
                                              meeting_analyses table
                                                                ↓
                                                          Return
                                                                ↓
                                                    Display Results
```

### 3. Dashboard Flow

```
User → Enter Contact ID → GET /api/contacts/{id}/meetings → Query Service
                                                                    ↓
                                                              Query Meetings
                                                                    ↓
                                                              Join Analyses
                                                                    ↓
                                                              Order by Date
                                                                    ↓
                                                              Return Array
                                                                    ↓
                                                              Render Cards
```

## Key Components

### Frontend Components

**Navbar**
- Logo with Brain icon
- Navigation links
- "New Meeting" CTA button
- Responsive design

**Footer**
- Brand information
- Quick links
- Social/contact links
- Copyright notice

**MeetingSubmissionForm**
- Form validation
- Loading states
- Success/error messages
- Auto-clear on success

**MeetingCard**
- Expandable design
- Immutable data section (gray background)
- Derived data section (blue background)
- Analysis trigger button
- Sentiment/outcome badges

**ContactDashboard**
- Meeting list
- Search functionality
- Loading indicators
- Empty states

### Backend Services

**MeetingIngestionService**
- Input validation
- Database persistence
- Error handling
- Transaction management

**AnalysisEngine**
- Meeting retrieval
- LLM orchestration
- Analysis persistence
- Error recovery

**LLMClient**
- Provider abstraction (OpenAI/xAI)
- Retry logic
- Schema validation
- Cost tracking

**QueryService**
- Data joining
- Sorting/filtering
- Pagination support
- Performance optimization

### Database Schema

**meetings** (Immutable)
```sql
id              VARCHAR(255) PRIMARY KEY
contact_id      VARCHAR(255) NOT NULL
type            VARCHAR(20) CHECK (type IN ('sales', 'coaching'))
occurred_at     TIMESTAMP NOT NULL
transcript      TEXT NOT NULL
created_at      TIMESTAMP DEFAULT NOW()

INDEX idx_contact_occurred (contact_id, occurred_at DESC)

TRIGGER prevent_update BEFORE UPDATE
TRIGGER prevent_delete BEFORE DELETE
```

**meeting_analyses** (Derived)
```sql
id              VARCHAR(255) PRIMARY KEY
meeting_id      VARCHAR(255) FOREIGN KEY → meetings(id)
sentiment       VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'negative'))
topics          JSON
objections      JSON
commitments     JSON
outcome         VARCHAR(20) CHECK (outcome IN ('closed', 'follow_up', 'no_interest', 'unknown'))
summary         TEXT
analyzed_at     TIMESTAMP DEFAULT NOW()

INDEX idx_meeting_analyzed (meeting_id, analyzed_at DESC)
```

**contacts** (Simplified)
```sql
id              VARCHAR(255) PRIMARY KEY
name            VARCHAR(255)
created_at      TIMESTAMP DEFAULT NOW()
```

## API Endpoints

### POST /api/meetings
**Purpose:** Ingest meeting transcript

**Request:**
```json
{
  "meetingId": "meet_abc123",
  "contactId": "contact_xyz789",
  "type": "sales",
  "occurredAt": "2026-02-16T14:30:00Z",
  "transcript": "Full transcript..."
}
```

**Response (201):**
```json
{
  "id": "meet_abc123",
  "contactId": "contact_xyz789",
  "type": "sales",
  "occurredAt": "2026-02-16T14:30:00Z",
  "transcript": "Full transcript...",
  "createdAt": "2026-02-16T14:35:00Z"
}
```

### POST /api/meetings/{meetingId}/analyze
**Purpose:** Analyze meeting with LLM

**Response (200):**
```json
{
  "id": "analysis_def456",
  "meetingId": "meet_abc123",
  "sentiment": "positive",
  "topics": ["pricing", "timeline", "integration"],
  "objections": ["budget concerns"],
  "commitments": ["follow up next week"],
  "outcome": "follow_up",
  "summary": "Positive discussion...",
  "analyzedAt": "2026-02-16T14:40:00Z"
}
```

### GET /api/contacts/{contactId}/meetings
**Purpose:** Get all meetings for contact

**Response (200):**
```json
{
  "contactId": "contact_xyz789",
  "meetings": [
    {
      "id": "meet_abc123",
      "type": "sales",
      "occurredAt": "2026-02-16T14:30:00Z",
      "transcript": "...",
      "createdAt": "2026-02-16T14:35:00Z",
      "analysis": { ... }
    }
  ]
}
```

## Design Principles

### 1. Immutability
- Meeting records cannot be modified after creation
- Database triggers enforce immutability
- Audit trail via timestamps
- Corrections require new records

### 2. Separation of Concerns
- Immutable truth (meetings) separate from derived data (analyses)
- Clear visual distinction in UI
- Different database tables
- Independent lifecycle

### 3. Bounded AI
- Structured prompts with JSON schema
- Schema validation on responses
- Constrained output format
- No free-form generation

### 4. Contact-Centric
- All data organized by contactId
- Simplifies queries
- Enables contact-level analytics
- Natural data model

### 5. Scalability
- Stateless backend services
- Connection pooling
- Async processing ready
- Horizontal scaling capable

## Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Lucide React (icons)
- Poppins font

**Backend:**
- Python 3.11+
- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn

**Database:**
- PostgreSQL (Neon)
- Connection pooling
- SSL encryption
- Automated backups

**AI:**
- OpenAI GPT-4
- xAI Grok (alternative)
- Structured outputs
- Retry logic

**Deployment:**
- Vercel (frontend + backend)
- Serverless functions
- Edge network
- Auto-scaling

## Security

**Authentication:**
- JWT tokens (simplified for assessment)
- Role-based access control
- Operator vs Basic User roles

**Data Protection:**
- HTTPS enforced
- Database SSL
- Environment variables
- No secrets in code

**Input Validation:**
- Pydantic schemas
- Type checking
- Constraint validation
- Error messages

**Immutability:**
- Database triggers
- Application-layer checks
- Audit trails
- No retroactive changes

## Performance

**Frontend:**
- Static generation where possible
- Code splitting
- Lazy loading
- CDN caching

**Backend:**
- Connection pooling (5-10 connections)
- Query optimization
- Indexed fields
- Async operations

**Database:**
- Indexes on contact_id, occurred_at
- Connection pooling via PgBouncer
- Query optimization
- Read replicas (future)

**LLM:**
- Response caching
- Rate limiting
- Batch processing (future)
- Cost monitoring

## Monitoring

**Application:**
- Vercel function logs
- Error tracking
- Performance metrics
- Deployment history

**Database:**
- Neon console
- Connection pool status
- Query performance
- Storage usage

**LLM:**
- OpenAI dashboard
- API costs
- Rate limits
- Usage patterns

## Future Enhancements

**Phase 1:**
- User authentication
- Role management
- Audit logs
- Email notifications

**Phase 2:**
- Real-time analysis
- Webhook support
- Batch processing
- Advanced analytics

**Phase 3:**
- Multi-tenancy
- Custom models
- API rate limiting
- Advanced caching

## Architecture Decisions

### ADR 1: Next.js App Router
**Decision:** Use Next.js 14 with App Router

**Rationale:**
- Modern React patterns
- Server components
- Built-in routing
- Vercel optimization

### ADR 2: FastAPI Backend
**Decision:** Use FastAPI for backend

**Rationale:**
- Fast performance
- Automatic API docs
- Type safety with Pydantic
- Async support

### ADR 3: Neon PostgreSQL
**Decision:** Use Neon for database

**Rationale:**
- Serverless scaling
- Automatic backups
- Connection pooling
- Cost-effective

### ADR 4: Bounded Agent
**Decision:** Use structured LLM prompts

**Rationale:**
- Predictable outputs
- Reduced hallucinations
- Easy validation
- Cost-effective

## Conclusion

The architecture prioritizes:
- Data integrity (immutability)
- Clear separation (truth vs derived)
- Scalability (stateless services)
- Maintainability (clean code)
- User experience (modern UI)

This design supports the core principle: **One source of truth, grounded AI, verified outcomes.**
