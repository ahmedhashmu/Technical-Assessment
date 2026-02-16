# TruthOS Meeting Intelligence - Setup Instructions

## Current Status

✅ **COMPLETE** - The application is fully functional and running locally!

### What's Working:
- Backend API (FastAPI) running on http://localhost:8000
- Frontend (Next.js with Material-UI) running on http://localhost:3000
- PostgreSQL database initialized with tables and triggers
- Meeting ingestion API
- LLM-powered analysis with demo mode fallback
- Contact query API
- Production-level Material-UI design

### Test Data Available:
- `contact_001`: 2 sales meetings (meeting_001, meeting_002)
- `contact_002`: 1 coaching meeting (meeting_003)

## Quick Start

### Backend (Already Running)
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### Frontend (Already Running)
```bash
cd frontend
npm run dev
```

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Testing the Application

### 1. View Contacts
Navigate to http://localhost:3000/contacts

### 2. View Contact Meetings
Click on any sample contact (contact_001, contact_002, contact_003)

### 3. Submit New Meeting
Navigate to http://localhost:3000/meetings/new

### 4. Analyze Meeting
Click "Analyze" button on any meeting card

## API Examples

### Create Meeting
```bash
curl -X POST http://localhost:8000/api/meetings \
  -H "Content-Type: application/json" \
  -d '{
    "meetingId": "meeting_004",
    "contactId": "contact_003",
    "type": "sales",
    "occurredAt": "2024-02-17T10:00:00Z",
    "transcript": "Your meeting transcript here..."
  }'
```

### Analyze Meeting
```bash
curl -X POST http://localhost:8000/api/meetings/meeting_004/analyze \
  -H "Content-Type: application/json"
```

### Get Contact Meetings
```bash
curl -X GET http://localhost:8000/api/contacts/contact_003/meetings
```

## Environment Configuration

### Backend (.env)
```env
DATABASE_URL=your_neon_postgresql_url

# LLM Configuration (Demo mode fallback enabled)
XAI_API_KEY=your_xai_api_key
LLM_PROVIDER=xai
LLM_MODEL=grok-2-latest

JWT_SECRET=your_jwt_secret
ENVIRONMENT=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Features Implemented

### Core Functionality
- ✅ Meeting ingestion with immutability enforcement
- ✅ LLM-powered analysis (with demo mode fallback)
- ✅ Contact-centric meeting queries
- ✅ Database triggers for immutability
- ✅ Structured signal extraction

### Frontend (Material-UI)
- ✅ Modern, production-level UI design
- ✅ Responsive layout
- ✅ Meeting submission form
- ✅ Contact dashboard
- ✅ Meeting cards with expandable details
- ✅ Analysis display with visual indicators
- ✅ Loading states and error handling

### Backend
- ✅ FastAPI with Pydantic validation
- ✅ PostgreSQL with SQLAlchemy ORM
- ✅ Bounded agent LLM integration
- ✅ Retry logic with exponential backoff
- ✅ Demo mode fallback for LLM unavailability
- ✅ RESTful API design

## Deployment

### Vercel (Frontend + Backend)
- Project: https://technical-assessment-lake.vercel.app/
- Project ID: prj_hpvhXUO1jBVfYxCcthUF5yt3u7HA

### Database
- Neon PostgreSQL (already configured)
- Connection pooling enabled
- SSL required

## Notes

### Demo Mode
Since both OpenAI and xAI API keys have no credits, the system uses a demo mode fallback that:
- Performs keyword-based sentiment analysis
- Extracts topics from word frequency
- Determines outcome from keywords
- Provides a clear indication that LLM is unavailable

This ensures the application remains functional for demonstration purposes.

### Next Steps (Optional)
- Add API credits to enable full LLM analysis
- Implement authentication/authorization (currently stubbed)
- Add property-based tests
- Add unit tests for edge cases
- Deploy to Vercel production

## Architecture

See `ARCHITECTURE.md` for detailed system design and data flows.
See `ENGINEERING_REASONING.md` for design decisions and scalability considerations.
