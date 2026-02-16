# Implementation Plan: TruthOS Meeting Intelligence

## Overview

This implementation plan breaks down the TruthOS Meeting Intelligence system into incremental coding tasks. The system will be built with a Python FastAPI backend and Next.js TypeScript frontend, following a contact-centric data model with strict immutability guarantees. Each task builds on previous work, with testing integrated throughout to validate correctness early.

## Tasks

- [x] 1. Set up project structure and database schema
  - Create Next.js project with TypeScript and App Router
  - Create Python FastAPI project structure
  - Set up PostgreSQL database connection (or SQLite for local dev)
  - Create database schema with meetings and meeting_analyses tables
  - Implement database triggers to prevent updates/deletes on meetings table
  - Create .env.example files documenting required environment variables
  - _Requirements: 5.1, 5.2, 5.3, 7.1, 7.2, 12.2, 12.6_

- [ ]* 1.1 Write property test for meeting immutability
  - **Property 3: Meeting Immutability**
  - **Validates: Requirements 5.2, 7.1, 7.2**

- [-] 2. Implement meeting ingestion API
  - [ ] 2.1 Create Pydantic models for Meeting and MeetingCreate
    - Define validation rules for required fields
    - Implement type validation for meeting type enum
    - _Requirements: 1.2, 1.3, 5.1_
  
  - [ ] 2.2 Implement POST /api/meetings endpoint
    - Validate incoming request data
    - Generate unique meeting ID if not provided
    - Persist meeting to database with createdAt timestamp
    - Return created meeting record
    - Handle validation errors with descriptive messages
    - _Requirements: 1.1, 1.4, 1.5, 1.6, 7.3_
  
  - [ ]* 2.3 Write property test for meeting creation round trip
    - **Property 1: Meeting Creation Round Trip**
    - **Validates: Requirements 1.2, 1.4, 1.6, 5.1, 7.3**
  
  - [ ]* 2.4 Write property test for invalid meeting rejection
    - **Property 2: Invalid Meeting Rejection**
    - **Validates: Requirements 1.2, 1.3, 1.5**
  
  - [ ]* 2.5 Write unit tests for edge cases
    - Test empty transcript handling
    - Test special characters in transcript
    - Test boundary dates (past, future, timezone handling)
    - _Requirements: 1.2, 1.3_

- [ ] 3. Implement LLM-powered analysis engine
  - [ ] 3.1 Create Pydantic models for MeetingAnalysis and AnalysisSignals
    - Define schema for structured LLM output
    - Implement validation for sentiment and outcome enums
    - _Requirements: 3.3, 3.4, 5.3_
  
  - [ ] 3.2 Implement BoundedAgent class
    - Create structured prompt template with JSON schema
    - Implement LLM API call with schema validation
    - Add retry logic with exponential backoff (3 attempts)
    - Validate response against Pydantic schema
    - Handle LLM API errors gracefully
    - _Requirements: 3.3, 3.4_
  
  - [ ] 3.3 Implement POST /api/meetings/{meetingId}/analyze endpoint
    - Retrieve meeting transcript from database
    - Call BoundedAgent to extract signals
    - Persist analysis results with analyzedAt timestamp
    - Return analysis record
    - Handle errors without modifying meeting records
    - _Requirements: 3.1, 3.2, 3.5, 3.6, 3.7_
  
  - [ ]* 3.4 Write property test for analysis creation round trip
    - **Property 4: Analysis Creation Round Trip**
    - **Validates: Requirements 3.3, 3.4, 3.5, 5.3, 7.4**
  
  - [ ]* 3.5 Write property test for analysis retrieval correctness
    - **Property 5: Analysis Retrieval Correctness**
    - **Validates: Requirements 3.2**
  
  - [ ]* 3.6 Write property test for derived data separation
    - **Property 6: Derived Data Separation**
    - **Validates: Requirements 3.6, 5.4**
  
  - [ ]* 3.7 Write property test for analysis error handling
    - **Property 7: Analysis Error Handling**
    - **Validates: Requirements 3.7**
  
  - [ ]* 3.8 Write unit tests for LLM integration
    - Test LLM API timeout handling
    - Test invalid JSON response handling
    - Test schema validation failures
    - _Requirements: 3.4, 3.7_

- [ ] 4. Checkpoint - Ensure backend tests pass
  - Run all backend tests (unit and property tests)
  - Verify database schema is correct
  - Test API endpoints manually with curl or Postman
  - Ask the user if questions arise

- [ ] 5. Implement contact query API
  - [ ] 5.1 Implement GET /api/contacts/{contactId}/meetings endpoint
    - Query meetings by contactId ordered by occurredAt DESC
    - Left join with meeting_analyses table
    - Return meetings with optional analysis data
    - Handle pagination if needed
    - _Requirements: 4.1, 4.2, 5.6_
  
  - [ ]* 5.2 Write property test for contact meeting query correctness
    - **Property 8: Contact Meeting Query Correctness**
    - **Validates: Requirements 4.2, 5.6**
  
  - [ ]* 5.3 Write property test for referential integrity
    - **Property 14: Referential Integrity**
    - **Validates: Requirements 5.5**
  
  - [ ]* 5.4 Write property test for multiple analyses support
    - **Property 15: Multiple Analyses Support**
    - **Validates: Requirements 7.5**

- [ ] 6. Implement role-based access control
  - [ ] 6.1 Create authentication middleware
    - Implement JWT token validation or mocked user context
    - Extract user role from token/context
    - Add auth middleware to protected endpoints
    - _Requirements: 6.1, 6.5_
  
  - [ ] 6.2 Add authorization checks to analysis endpoint
    - Verify user has Operator role for POST /api/meetings/{id}/analyze
    - Return 403 error for unauthorized users
    - _Requirements: 6.2, 6.3_
  
  - [ ] 6.3 Add authorization checks to query endpoints
    - Allow all authenticated users to view meetings
    - _Requirements: 6.4_
  
  - [ ]* 6.4 Write property test for operator analysis authorization
    - **Property 16: Operator Analysis Authorization**
    - **Validates: Requirements 6.2**
  
  - [ ]* 6.5 Write property test for basic user analysis restriction
    - **Property 17: Basic User Analysis Restriction**
    - **Validates: Requirements 6.3**
  
  - [ ]* 6.6 Write property test for authenticated user read access
    - **Property 18: Authenticated User Read Access**
    - **Validates: Requirements 6.4**

- [ ] 7. Implement Next.js API routes (backend proxies)
  - [ ] 7.1 Create app/api/meetings/route.ts
    - Implement POST handler that forwards to Python backend
    - Add error handling and response formatting
    - _Requirements: 1.1_
  
  - [ ] 7.2 Create app/api/meetings/[id]/analyze/route.ts
    - Implement POST handler that forwards to Python backend
    - Add authentication header forwarding
    - _Requirements: 3.1_
  
  - [ ] 7.3 Create app/api/contacts/[id]/meetings/route.ts
    - Implement GET handler that forwards to Python backend
    - Add authentication header forwarding
    - _Requirements: 4.1_
  
  - [ ] 7.4 Create lib/api-client.ts
    - Implement typed API client functions
    - Add error handling and type safety
    - _Requirements: 1.1, 3.1, 4.1_

- [ ] 8. Implement meeting submission form component
  - [ ] 8.1 Create MeetingSubmissionForm component
    - Create form with fields: contactId, type selector, occurredAt, transcript
    - Implement form validation
    - Add loading state during submission
    - Display success message and clear form on success
    - Display error message on failure
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  
  - [ ] 8.2 Create app/meetings/new/page.tsx
    - Render MeetingSubmissionForm component
    - Add page layout and styling
    - _Requirements: 2.1_
  
  - [ ]* 8.3 Write component test for form rendering
    - Test that all form fields are present
    - Test meeting type selector options
    - _Requirements: 2.2, 9.1_
  
  - [ ]* 8.4 Write property test for form submission success handling
    - **Property 12: Form Submission Success Handling**
    - **Validates: Requirements 2.3, 2.4**
  
  - [ ]* 8.5 Write property test for form submission error handling
    - **Property 13: Form Submission Error Handling**
    - **Validates: Requirements 2.5**
  
  - [ ]* 8.6 Write property test for UI loading states
    - **Property 11: UI Loading and Error States** (form submission part)
    - **Validates: Requirements 2.6**

- [ ] 9. Implement contact dashboard component
  - [ ] 9.1 Create MeetingList component
    - Display meetings in a list with meetingId, type, occurredAt, transcript preview
    - Implement expandable view for full transcript
    - Display analysis results when available
    - Visually distinguish immutable records from derived data
    - Add mobile-responsive styling
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.7_
  
  - [ ] 9.2 Create MeetingAnalysis component
    - Display sentiment, topics, objections, commitments, outcome, summary
    - Add visual styling to distinguish from meeting data
    - _Requirements: 4.5_
  
  - [ ] 9.3 Create app/contacts/[id]/page.tsx
    - Fetch meetings for contact on page load
    - Render MeetingList component
    - Add loading indicators during data fetch
    - Display error message on fetch failure
    - Add "Analyze" button for each meeting (operator only)
    - _Requirements: 4.1, 4.2, 4.8, 4.9_
  
  - [ ]* 9.4 Write component test for meeting list rendering
    - Test that meetings are displayed with correct fields
    - Test expandable view functionality
    - _Requirements: 4.3, 4.4, 9.2_
  
  - [ ]* 9.5 Write property test for meeting display completeness
    - **Property 9: Meeting Display Completeness**
    - **Validates: Requirements 4.3, 4.4**
  
  - [ ]* 9.6 Write property test for analysis display conditional
    - **Property 10: Analysis Display Conditional**
    - **Validates: Requirements 4.5**
  
  - [ ]* 9.7 Write property test for UI loading and error states
    - **Property 11: UI Loading and Error States** (data loading part)
    - **Validates: Requirements 4.8, 4.9**

- [ ] 10. Checkpoint - Ensure all tests pass
  - Run all backend tests (Python)
  - Run all frontend tests (TypeScript)
  - Test end-to-end flow manually
  - Ask the user if questions arise

- [ ] 11. Create environment configuration and documentation
  - [ ] 11.1 Create backend .env.example
    - Document DATABASE_URL, LLM_API_KEY, LLM_MODEL, JWT_SECRET
    - _Requirements: 12.2, 12.3_
  
  - [ ] 11.2 Create frontend .env.example
    - Document NEXT_PUBLIC_API_URL, JWT_SECRET
    - _Requirements: 12.2_
  
  - [ ] 11.3 Create README.md
    - Add project overview and architecture summary
    - Add local development setup instructions
    - Add environment variable configuration guide
    - Add deployment instructions for Vercel
    - Add API endpoint documentation
    - Explain LLM usage and bounded agent design
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [ ] 11.4 Create ARCHITECTURE.md
    - Include high-level architecture diagram
    - Document key services and responsibilities
    - Document data flow from ingestion to dashboard
    - Document API examples
    - Address data ingestion, contact-centric modeling, metric calculation
    - Address AI analysis, RBAC, auditability, cost awareness
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_
  
  - [ ] 11.5 Create ENGINEERING_REASONING.md
    - Document how immutability prevents retroactive manipulation
    - Document how bounded agent constrains LLM to prevent hallucinations
    - Document scalability considerations at 10× usage
    - Document approach for anonymizing and publishing outcome metrics
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 12. Final integration and deployment preparation
  - [ ] 12.1 Test complete user flow
    - Submit meeting via form
    - Trigger analysis
    - View results in dashboard
    - Test with different user roles
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 6.2, 6.3, 6.4_
  
  - [ ] 12.2 Prepare for Vercel deployment
    - Configure vercel.json for serverless functions
    - Set up environment variables in Vercel dashboard
    - Test deployment to preview environment
    - _Requirements: 12.4, 12.5_
  
  - [ ] 12.3 Create database migration scripts
    - Create SQL migration files for schema setup
    - Document migration execution process
    - _Requirements: 12.6_

- [ ] 13. Final checkpoint - Complete system validation
  - Ensure all tests pass (backend and frontend)
  - Verify all requirements are implemented
  - Test deployed application
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional property-based and unit tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout development
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and error conditions
- The implementation follows a backend-first approach, then frontend, then integration
- Authentication is simplified (JWT stub or mocked user) for assessment purposes
- Database can be PostgreSQL (production) or SQLite (local development)
