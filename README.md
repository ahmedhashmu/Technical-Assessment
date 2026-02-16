# TruthOS Meeting Intelligence

A full-stack application for ingesting, analyzing, and displaying meeting intelligence with AI-powered insights. Built for the TruthOS technical assessment.

## Overview

TruthOS Meeting Intelligence is a contact-centric meeting analysis system that maintains strict separation between immutable operational records and derived analytical data. The system ingests meeting transcripts, performs LLM-powered analysis to extract structured insights, and presents intelligence through a dashboard interface.

### Key Principles

- **One Source of Truth**: Immutable meeting records that cannot be modified after creation
- **Derived Data Separation**: AI analysis results stored separately from source records
- **Contact-Centric**: All data organized by contact for comprehensive interaction history
- **Bounded AI**: LLM agents constrained by rules and structured outputs, not free-form chat

## Tech Stack

### Frontend
- **Next.js 14+** (App Router)
- **TypeScript**
- **React** for UI components
- **Tailwind CSS** for styling
- Deployed on **Vercel**

### Backend
- **Python 3.11+**
- **FastAPI** for REST API
- **SQLAlchemy** for database ORM
- **Pydantic** for data validation
- Deployed as **Vercel Serverless Functions** or external service

### AI Layer
- **OpenAI GPT-4** or **Anthropic Claude** for LLM analysis
- Bounded agent with structured prompts and schema validation

### Database
- **PostgreSQL** (production) or **SQLite** (local development)
- Contact-centric schema with immutability guarantees

## Project Structure

```
truthos-meeting-intelligence/
├── frontend/                 # Next.js application
│   ├── app/                 # App Router pages and API routes
│   ├── components/          # React components
│   ├── lib/                 # Utilities and API client
│   └── package.json
├── backend/                 # Python FastAPI application
│   ├── app/                 # Application code
│   │   ├── routers/        # API route handlers
│   │   ├── services/       # Business logic
│   │   ├── models/         # Data models
│   │   └── db/             # Database setup
│   ├── tests/              # Backend tests
│   └── requirements.txt
├── .kiro/                   # Kiro spec files
│   └── specs/
│       └── truthos-meeting-intelligence/
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js 18+** and npm/yarn
- **Python 3.11+** and pip
- **PostgreSQL** (or use SQLite for local dev)
- **LLM API Key** (OpenAI or Anthropic)

### Local Development Setup

#### 1. Clone the repository

```bash
git clone https://github.com/ahmedhashmu/Technical-Assessment.git
cd Technical-Assessment
```

#### 2. Set up the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` file in `backend/` directory:

```env
DATABASE_URL=sqlite:///./truthos.db
LLM_API_KEY=your_openai_or_anthropic_api_key
LLM_MODEL=gpt-4
JWT_SECRET=your_jwt_secret_key
```

Run database migrations:

```bash
python -m app.db.init_db
```

Start the backend server:

```bash
uvicorn app.main:app --reload --port 8000
```

#### 3. Set up the frontend

```bash
cd frontend
npm install
```

Create `.env.local` file in `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
JWT_SECRET=your_jwt_secret_key
```

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Running Tests

#### Backend Tests

```bash
cd backend
pytest
```

#### Frontend Tests

```bash
cd frontend
npm test
```

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │ Meeting Form     │         │ Contact Dashboard│         │
│  └──────────────────┘         └──────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend (FastAPI)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Ingestion   │  │   Analysis   │  │    Query     │     │
│  │   Service    │  │    Engine    │  │   Service    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI Layer (LLM)                            │
│              Bounded Agent with Schema Validation            │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer (PostgreSQL)                    │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │ Immutable Records│         │  Derived Data    │         │
│  │   (Meetings)     │         │   (Analyses)     │         │
│  └──────────────────┘         └──────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Meeting Ingestion**: User submits transcript → Validated → Stored as immutable record
2. **Analysis**: Operator triggers analysis → Transcript retrieved → LLM extracts signals → Results stored as derived data
3. **Dashboard**: User views contact → Meetings queried → Analysis joined → Displayed with clear separation

### API Endpoints

#### POST /api/meetings
Ingest a new meeting transcript

**Request:**
```json
{
  "meetingId": "meet_abc123",
  "contactId": "contact_xyz789",
  "type": "sales",
  "occurredAt": "2024-01-15T14:30:00Z",
  "transcript": "Full meeting transcript..."
}
```

#### POST /api/meetings/{meetingId}/analyze
Analyze a meeting transcript (Operator only)

**Response:**
```json
{
  "sentiment": "positive",
  "topics": ["pricing", "timeline"],
  "objections": ["budget concerns"],
  "commitments": ["follow up next week"],
  "outcome": "follow_up",
  "summary": "Positive discussion..."
}
```

#### GET /api/contacts/{contactId}/meetings
Get all meetings for a contact

**Response:**
```json
{
  "meetings": [
    {
      "id": "meet_abc123",
      "type": "sales",
      "occurredAt": "2024-01-15T14:30:00Z",
      "transcript": "...",
      "analysis": { ... }
    }
  ]
}
```

## AI Usage Explanation

### Bounded Agent Design

The system uses a "bounded agent" approach to constrain LLM behavior and prevent hallucinations:

1. **Structured Prompts**: Explicit JSON schema requirements in prompts
2. **Schema Validation**: Pydantic models validate LLM responses
3. **Constrained Outputs**: Enums for sentiment and outcome (no free-form)
4. **Retry Logic**: Up to 3 attempts with clearer instructions on failure
5. **No Free-Form Chat**: Agent has single purpose (extract signals)

This approach ensures predictable, testable outputs while minimizing hallucination risk and controlling costs.

## Deployment

### Vercel Deployment

#### Frontend

```bash
cd frontend
vercel
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_API_URL`
- `JWT_SECRET`

#### Backend (Serverless Functions)

```bash
cd backend
vercel
```

Set environment variables in Vercel dashboard:
- `DATABASE_URL`
- `LLM_API_KEY`
- `LLM_MODEL`
- `JWT_SECRET`

### Database Setup

For production, use a managed PostgreSQL service:
- Vercel Postgres
- Supabase
- AWS RDS

Run migrations:
```bash
python -m app.db.migrations.run
```

## Engineering Decisions

### Immutability Enforcement

Meeting records cannot be modified after creation, enforced by:
- Database triggers preventing UPDATE/DELETE
- Application-layer validation
- Audit trail via timestamps

This ensures data integrity, compliance, and trust.

### LLM Hallucination Prevention

Bounded agent design constrains LLM to structured outputs:
- JSON schema in prompts
- Pydantic validation
- Enum constraints
- No open-ended generation

### Scalability at 10× Usage

Primary bottleneck: LLM API calls

Solutions:
- Async job queue for analysis
- Result caching
- Rate limiting
- Batch processing

Secondary bottlenecks: Database queries, frontend rendering

Solutions:
- Read replicas
- Query optimization
- Pagination
- Virtual scrolling

### Metric Anonymization

For public outcome metrics:
- Aggregate only (no individual records)
- K-anonymity (minimum 10 contacts per metric)
- Differential privacy (calibrated noise)
- PII removal

## Assumptions and Limitations

### Assumptions

- Meeting transcripts are pre-generated (not handling audio/video processing)
- Contact IDs are provided externally (no contact management)
- Authentication is simplified (JWT stub or mocked users)
- Single-tenant deployment (no multi-tenancy)

### Limitations

- No real-time analysis (async processing recommended for scale)
- No audio/video ingestion (transcripts only)
- Simplified RBAC (two roles only)
- No financial event tracking (bonus feature not implemented)
- No public dashboard (bonus feature not implemented)

## Testing

The system uses a dual testing approach:

### Unit Tests
- Specific examples and edge cases
- Error condition handling
- Integration points

### Property-Based Tests
- Universal properties across all inputs
- Immutability guarantees
- Round-trip correctness
- Authorization rules

Run all tests:
```bash
# Backend
cd backend && pytest

# Frontend
cd frontend && npm test
```

## Documentation

- **[ARCHITECTURE.md](.kiro/specs/truthos-meeting-intelligence/design.md)**: Detailed architecture and design decisions
- **[ENGINEERING_REASONING.md](.kiro/specs/truthos-meeting-intelligence/design.md#engineering-reasoning)**: Engineering trade-offs and reasoning
- **[Requirements](.kiro/specs/truthos-meeting-intelligence/requirements.md)**: Complete requirements specification
- **[Tasks](.kiro/specs/truthos-meeting-intelligence/tasks.md)**: Implementation task breakdown

## License

This project is created for the TruthOS technical assessment.

## Contact

For questions about this assessment submission, please contact the candidate.
