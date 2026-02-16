# Requirements Document

## Introduction

TruthOS Meeting Intelligence is a contact-centric meeting analysis system that ingests meeting transcripts, performs LLM-powered analysis to extract structured insights, and presents intelligence through a dashboard interface. The system maintains a strict separation between immutable operational records (source of truth) and derived analytical data, ensuring auditability and preventing retroactive manipulation.

## Glossary

- **Meeting_Ingestion_API**: Backend service that receives and persists meeting transcript data
- **Analysis_Engine**: LLM-powered service that extracts structured signals from meeting transcripts
- **Contact_Dashboard**: Frontend interface displaying meeting history and analysis for a specific contact
- **Immutable_Record**: Data that cannot be modified after creation (meetings, transcripts)
- **Derived_Data**: Analytical results computed from immutable records (sentiment, topics, outcomes)
- **Operator**: User role with full access including analysis capabilities
- **Basic_User**: User role with read-only access to meetings and analysis
- **Meeting_Type**: Classification of meeting purpose (sales or coaching)
- **Bounded_Agent**: LLM agent constrained by rules and structured outputs, not free-form chat

## Requirements

### Requirement 1: Meeting Transcript Ingestion

**User Story:** As an operator, I want to submit meeting transcripts through an API, so that meeting data is captured as immutable records in the system.

#### Acceptance Criteria

1. THE Meeting_Ingestion_API SHALL accept POST requests at /api/meetings endpoint
2. WHEN a meeting submission is received, THE Meeting_Ingestion_API SHALL validate that meetingId, contactId, type, occurredAt, and transcript fields are present
3. WHEN a meeting submission has type field, THE Meeting_Ingestion_API SHALL validate it is either "sales" or "coaching"
4. WHEN a valid meeting submission is received, THE Meeting_Ingestion_API SHALL persist it as an immutable record with createdAt timestamp
5. WHEN an invalid meeting submission is received, THE Meeting_Ingestion_API SHALL return a descriptive error response
6. WHEN a meeting is persisted, THE Meeting_Ingestion_API SHALL return the created meeting record with assigned identifier

### Requirement 2: Web-Based Meeting Submission

**User Story:** As an operator, I want to submit meeting transcripts through a web form, so that I can easily capture meeting data without using API tools directly.

#### Acceptance Criteria

1. THE Contact_Dashboard SHALL provide a form interface for meeting transcript submission
2. WHEN the submission form is displayed, THE Contact_Dashboard SHALL include input fields for contactId, meeting type selector, occurredAt date/time, and transcript text area
3. WHEN a user submits the form with valid data, THE Contact_Dashboard SHALL send a POST request to the Meeting_Ingestion_API
4. WHEN the API returns success, THE Contact_Dashboard SHALL display a confirmation message and clear the form
5. WHEN the API returns an error, THE Contact_Dashboard SHALL display the error message to the user
6. THE Contact_Dashboard SHALL provide visual feedback during form submission

### Requirement 3: LLM-Powered Meeting Analysis

**User Story:** As an operator, I want to analyze meeting transcripts using AI, so that I can extract structured insights without manual review.

#### Acceptance Criteria

1. THE Analysis_Engine SHALL accept POST requests at /api/meetings/{meetingId}/analyze endpoint
2. WHEN an analysis request is received, THE Analysis_Engine SHALL retrieve the meeting transcript from immutable records
3. WHEN processing a transcript, THE Analysis_Engine SHALL extract topics, objections, commitments, sentiment, and outcome classification using a Bounded_Agent
4. THE Bounded_Agent SHALL produce structured output conforming to a predefined schema
5. WHEN analysis is complete, THE Analysis_Engine SHALL persist results as derived data with analyzedAt timestamp
6. THE Analysis_Engine SHALL store derived data separately from immutable meeting records
7. WHEN analysis fails, THE Analysis_Engine SHALL return a descriptive error without modifying any records

### Requirement 4: Contact Meeting History Display

**User Story:** As a user, I want to view all meetings for a specific contact, so that I can understand the interaction history.

#### Acceptance Criteria

1. THE Contact_Dashboard SHALL accept GET requests at /api/contacts/{contactId}/meetings endpoint
2. WHEN a contact meetings request is received, THE Contact_Dashboard SHALL return all meetings for that contact ordered by occurredAt descending
3. WHEN displaying meetings, THE Contact_Dashboard SHALL show meetingId, type, occurredAt, and transcript preview for each meeting
4. THE Contact_Dashboard SHALL provide an expandable view for each meeting showing full transcript
5. WHEN a meeting has associated analysis, THE Contact_Dashboard SHALL display the analysis results in the expandable view
6. THE Contact_Dashboard SHALL visually distinguish between immutable records and derived insights
7. THE Contact_Dashboard SHALL be responsive on mobile devices
8. WHEN loading meeting data, THE Contact_Dashboard SHALL display loading indicators
9. WHEN an error occurs loading meetings, THE Contact_Dashboard SHALL display an error message

### Requirement 5: Contact-Centric Data Modeling

**User Story:** As a system architect, I want contact-centric data modeling with immutable activity records, so that the system maintains a single source of truth.

#### Acceptance Criteria

1. THE system SHALL model Meeting records with fields: id, contactId, type, occurredAt, transcript, createdAt
2. THE system SHALL prevent modification of Meeting records after creation
3. THE system SHALL model MeetingAnalysis records with fields: id, meetingId, sentiment, topics, objections, commitments, outcome, summary, analyzedAt
4. THE system SHALL allow MeetingAnalysis records to be regenerated without modifying Meeting records
5. THE system SHALL maintain referential integrity between MeetingAnalysis and Meeting records
6. THE system SHALL organize all operational data by contactId as the primary dimension

### Requirement 6: Role-Based Access Control

**User Story:** As a system administrator, I want role-based access control, so that analysis capabilities are restricted to authorized operators.

#### Acceptance Criteria

1. THE system SHALL support Operator and Basic_User roles
2. WHEN an Operator requests meeting analysis, THE system SHALL allow the operation
3. WHEN a Basic_User requests meeting analysis, THE system SHALL deny the operation
4. WHEN any authenticated user requests to view meetings, THE system SHALL allow the operation
5. WHERE authentication is implemented, THE system SHALL use JWT tokens or mocked user context

### Requirement 7: Data Immutability and Auditability

**User Story:** As a compliance officer, I want immutable operational records with audit trails, so that data cannot be retroactively manipulated.

#### Acceptance Criteria

1. THE system SHALL prevent updates to Meeting records after creation
2. THE system SHALL prevent deletion of Meeting records
3. WHEN a Meeting record is created, THE system SHALL record createdAt timestamp
4. WHEN a MeetingAnalysis is generated, THE system SHALL record analyzedAt timestamp
5. THE system SHALL allow multiple MeetingAnalysis records for the same Meeting to support re-analysis

### Requirement 8: Backend Testing Coverage

**User Story:** As a developer, I want automated backend tests, so that core functionality is validated.

#### Acceptance Criteria

1. THE system SHALL include at least one unit test for the Meeting_Ingestion_API
2. THE system SHALL include at least one unit test for the Analysis_Engine
3. WHEN tests are executed, THE system SHALL validate input validation logic
4. WHEN tests are executed, THE system SHALL validate data persistence logic

### Requirement 9: Frontend Testing Coverage

**User Story:** As a developer, I want automated frontend tests, so that UI components are validated.

#### Acceptance Criteria

1. THE system SHALL include at least one component test for the meeting submission form
2. THE system SHALL include at least one component test for the meeting list display
3. WHEN tests are executed, THE system SHALL validate component rendering
4. WHEN tests are executed, THE system SHALL validate user interaction handling

### Requirement 10: Architecture Documentation

**User Story:** As a technical reviewer, I want comprehensive architecture documentation, so that I can understand system design decisions.

#### Acceptance Criteria

1. THE system SHALL include a high-level architecture diagram showing key services
2. THE system SHALL document data flow from meeting ingestion through analysis to dashboard display
3. THE system SHALL document API endpoints with example requests and responses
4. THE system SHALL document the contact-centric data model
5. THE system SHALL document the separation between immutable records and derived data
6. THE system SHALL document authentication and authorization approach
7. THE system SHALL document cost awareness considerations for LLM usage

### Requirement 11: Engineering Reasoning Documentation

**User Story:** As a technical reviewer, I want documented engineering reasoning, so that I can evaluate design trade-offs.

#### Acceptance Criteria

1. THE system SHALL document how immutability prevents retroactive data manipulation
2. THE system SHALL document how Bounded_Agent design constrains LLM to prevent hallucinations
3. THE system SHALL document scalability considerations at 10× usage volume
4. THE system SHALL document approach for anonymizing and publishing outcome metrics
5. THE system SHALL document trade-offs between single-purpose and multi-step agent architectures

### Requirement 12: Deployment and Setup

**User Story:** As a developer, I want clear setup instructions, so that I can run the system locally and deploy it.

#### Acceptance Criteria

1. THE system SHALL include a README with local development setup instructions
2. THE system SHALL document environment variables required for configuration
3. THE system SHALL document how to configure LLM API credentials
4. THE system SHALL support deployment of Next.js frontend to Vercel
5. THE system SHALL support deployment of Python backend as Vercel Serverless Function or external service
6. THE system SHALL document database setup and migration procedures
