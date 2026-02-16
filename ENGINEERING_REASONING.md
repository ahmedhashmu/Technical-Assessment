# Engineering Reasoning

This document explains the key engineering decisions and trade-offs in the TruthOS Meeting Intelligence system.

## 1. Truth & Integrity: Preventing Retroactive Data Manipulation

### Problem
How do we ensure that meeting records cannot be manipulated after creation, maintaining a trustworthy audit trail?

### Solution: Multi-Layer Immutability

**Database Layer:**
```sql
-- Trigger to prevent updates
CREATE TRIGGER prevent_meeting_update
    BEFORE UPDATE ON meetings
    FOR EACH ROW
    EXECUTE FUNCTION prevent_meeting_update();

-- Trigger to prevent deletes
CREATE TRIGGER prevent_meeting_delete
    BEFORE DELETE ON meetings
    FOR EACH ROW
    EXECUTE FUNCTION prevent_meeting_delete();
```

**Application Layer:**
- No UPDATE or DELETE methods in MeetingIngestionService
- Read-only access after creation
- Separate derived data table for analysis

**Audit Trail:**
- `created_at` timestamp on all records
- `analyzed_at` timestamp on analyses
- Multiple analyses allowed (re-analysis support)

### Benefits

1. **Compliance:** Complete history of operational activity
2. **Trust:** Users cannot manipulate past records
3. **Debugging:** Original data always available
4. **Reproducibility:** Analyses can be re-run on original transcripts

### Trade-offs

**Storage Growth:**
- Records accumulate indefinitely
- No deletion means continuous growth
- Mitigation: Archive old records, compress transcripts

**Corrections:**
- Cannot fix typos in transcripts
- Must create new records with annotations
- Mitigation: Clear documentation, correction workflow

**User Communication:**
- Users must understand immutability
- May conflict with "edit" expectations
- Mitigation: Clear UI messaging, confirmation dialogs

### Implementation Details

```python
class MeetingIngestionService:
    def create_meeting(self, data: MeetingCreate) -> Meeting:
        # Create only - no update method exists
        meeting = Meeting(
            id=data.meetingId,
            contact_id=data.contactId,
            type=data.type,
            occurred_at=data.occurredAt,
            transcript=data.transcript
        )
        self.db.add(meeting)
        self.db.commit()
        return meeting
    
    # No update_meeting() method
    # No delete_meeting() method
```

## 2. AI Boundaries: Constraining LLM to Prevent Hallucinations

### Problem
How do we use LLMs for analysis while preventing hallucinated or misleading insights?

### Solution: Bounded Agent Design

**Structured Prompts:**
```python
ANALYSIS_PROMPT = """
Analyze the following meeting transcript and extract structured information.

You must respond with valid JSON matching this exact schema:
{
  "sentiment": "positive" | "neutral" | "negative",
  "topics": ["topic1", "topic2", ...],
  "objections": ["objection1", ...],
  "commitments": ["commitment1", ...],
  "outcome": "closed" | "follow_up" | "no_interest" | "unknown",
  "summary": "brief summary"
}

Transcript:
{transcript}

Respond only with valid JSON, no additional text.
"""
```

**Schema Validation:**
```python
class AnalysisSignals(BaseModel):
    sentiment: Literal['positive', 'neutral', 'negative']
    topics: List[str]
    objections: List[str]
    commitments: List[str]
    outcome: Literal['closed', 'follow_up', 'no_interest', 'unknown']
    summary: str
```

**Retry Logic:**
```python
def extract_signals(self, transcript: str, max_retries: int = 3):
    for attempt in range(max_retries):
        try:
            response = self.client.chat.completions.create(...)
            data = json.loads(response.choices[0].message.content)
            signals = AnalysisSignals(**data)  # Pydantic validation
            return signals
        except (json.JSONDecodeError, ValidationError):
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)  # Exponential backoff
                continue
            else:
                raise
```

### Benefits

1. **Predictability:** Structured outputs enable reliable processing
2. **Validation:** Easy to test and verify
3. **Reduced Hallucination:** Constrained output space
4. **Cost-Effective:** Shorter, focused prompts

### Trade-offs

**Flexibility:**
- Less flexible than free-form analysis
- May miss nuanced insights
- Mitigation: Carefully designed schema, iterative refinement

**Prompt Engineering:**
- Requires careful prompt design
- Schema must cover all cases
- Mitigation: Testing with diverse transcripts, user feedback

**Error Handling:**
- LLM may not follow schema
- Retry logic adds latency
- Mitigation: Exponential backoff, clear error messages

### Comparison: Bounded vs Free-Form

| Aspect | Bounded Agent | Free-Form Chat |
|--------|---------------|----------------|
| Output Format | Structured JSON | Natural language |
| Validation | Easy (Pydantic) | Hard (NLP parsing) |
| Hallucination Risk | Low | High |
| Flexibility | Limited | High |
| Cost | Lower | Higher |
| Testing | Easy | Hard |

### Implementation Details

```python
class LLMClient:
    def extract_signals(self, transcript: str) -> AnalysisSignals:
        prompt = self._build_prompt(transcript)
        
        for attempt in range(3):
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "You are a meeting analysis assistant."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0,  # Deterministic
                    max_tokens=1000
                )
                
                content = response.choices[0].message.content
                data = json.loads(content)
                signals = AnalysisSignals(**data)  # Validate
                
                return signals
            except Exception as e:
                if attempt < 2:
                    time.sleep(2 ** attempt)
                    continue
                raise
```

## 3. Scalability: What Breaks at 10× Usage?

### Current Architecture Bottlenecks

#### 1. LLM API Calls (Primary Bottleneck)

**Current State:**
- Synchronous analysis per meeting
- ~2-5 seconds per analysis
- No caching

**At 10× Usage:**
- Rate limits hit
- Increased latency
- High costs ($300-500/month)

**Solution:**
```python
# Async job queue with Celery + Redis
@celery.task
def analyze_meeting_async(meeting_id: str):
    engine = AnalysisEngine(db)
    return engine.analyze_meeting(meeting_id)

# Cache results
@cache.memoize(timeout=86400)  # 24 hours
def get_analysis(meeting_id: str):
    return db.query(MeetingAnalysis).filter_by(meeting_id=meeting_id).first()
```

#### 2. Database Queries

**Current State:**
- Simple queries with indexes
- Connection pool: 5-10 connections
- No pagination

**At 10× Usage:**
- Slow queries on large tables
- Connection pool exhaustion
- Memory issues loading all meetings

**Solution:**
```python
# Pagination
def get_contact_meetings(
    contact_id: str, 
    page: int = 1, 
    per_page: int = 20
):
    offset = (page - 1) * per_page
    return (
        db.query(Meeting)
        .filter(Meeting.contact_id == contact_id)
        .order_by(desc(Meeting.occurred_at))
        .limit(per_page)
        .offset(offset)
        .all()
    )

# Read replicas
read_engine = create_engine(READ_REPLICA_URL)
write_engine = create_engine(PRIMARY_URL)
```

#### 3. Frontend Rendering

**Current State:**
- Client-side rendering of all meetings
- No virtualization
- Full transcript in DOM

**At 10× Usage:**
- Slow rendering with 100+ meetings
- High memory usage
- Poor mobile performance

**Solution:**
```typescript
// Virtual scrolling
import { useVirtualizer } from '@tanstack/react-virtual'

// Lazy loading
const MeetingCard = lazy(() => import('./MeetingCard'))

// Pagination
const [page, setPage] = useState(1)
const { data } = useMeetings(contactId, page)
```

### Scaling Strategy

**Phase 1: Current → 3× (0-3000 meetings/month)**
- Add database indexes
- Implement connection pooling
- Add pagination to meeting lists
- Cache analysis results in Redis

**Phase 2: 3× → 10× (3000-10,000 meetings/month)**
- Move LLM analysis to async job queue
- Add database read replicas
- Implement rate limiting on API endpoints
- Add monitoring and alerting

**Phase 3: 10× → 100× (10,000-100,000 meetings/month)**
- Shard database by contactId
- Implement CDN for frontend assets
- Add horizontal scaling for backend services
- Consider dedicated LLM inference infrastructure

### Cost Projections

| Usage Level | Meetings/Month | LLM Cost | Infrastructure | Total |
|-------------|----------------|----------|----------------|-------|
| Current | 100 | $3 | $40 | $43 |
| 10× | 1,000 | $30 | $70 | $100 |
| 100× | 10,000 | $300 | $200 | $500 |

### Performance Targets

| Metric | Current | 10× Target |
|--------|---------|------------|
| Meeting Ingestion | < 500ms | < 500ms |
| Analysis (sync) | 2-5s | N/A (async) |
| Analysis (async) | N/A | < 30s |
| Dashboard Load | < 1s | < 2s |
| API Availability | 99% | 99.9% |

## 4. Public Results Layer: Anonymizing Outcome Metrics

### Problem
How do we publish outcome metrics while preventing re-identification of individuals?

### Solution: Multi-Layer Anonymization

**1. Aggregate Metrics Only**
```python
def publish_outcome_metrics(start_date, end_date):
    # Only aggregates, never individual records
    outcomes = db.query(
        MeetingAnalysis.outcome,
        func.count().label('count'),
        func.avg(sentiment_score).label('avg_sentiment')
    ).filter(
        MeetingAnalysis.analyzed_at.between(start_date, end_date)
    ).group_by(
        MeetingAnalysis.outcome
    ).having(
        func.count() >= 10  # K-anonymity threshold
    ).all()
    
    return outcomes
```

**2. K-Anonymity (K=10)**
- Each published metric represents ≥10 contacts
- Suppress metrics for small cohorts
- Prevents singling out individuals

**3. Differential Privacy**
```python
import numpy as np

def add_noise(value, sensitivity=1, epsilon=0.1):
    # Laplace noise for differential privacy
    scale = sensitivity / epsilon
    noise = np.random.laplace(0, scale)
    return value + noise

# Apply to aggregates
for outcome in outcomes:
    outcome['count'] = add_noise(outcome['count'], sensitivity=2)
    outcome['avg_sentiment'] = add_noise(outcome['avg_sentiment'], sensitivity=0.1)
```

**4. Field Removal**
- Remove all PII before analysis
- Use pseudonymous IDs (contactId)
- No names, emails, phone numbers in transcripts

### Example Public Metrics

```json
{
  "period": "2026-02",
  "metrics": {
    "closed": {
      "count": 32.4,
      "avg_sentiment": 0.72,
      "percentage": 0.31
    },
    "follow_up": {
      "count": 51.8,
      "avg_sentiment": 0.58,
      "percentage": 0.49
    },
    "no_interest": {
      "count": 21.1,
      "avg_sentiment": 0.21,
      "percentage": 0.20
    }
  },
  "total_meetings": 105,
  "note": "Counts include calibrated noise for privacy"
}
```

### Benefits

1. **Privacy:** Cannot reverse-engineer individual records
2. **Trust:** Transparent about data usage
3. **Compliance:** GDPR, CCPA compliant
4. **Insights:** Still enables data-driven decisions

### Trade-offs

**Accuracy:**
- Noise reduces precision
- Cannot publish fine-grained metrics
- Mitigation: Larger sample sizes, careful epsilon tuning

**Granularity:**
- Cannot segment by small groups
- Limited demographic analysis
- Mitigation: Aggregate across larger dimensions

**Complexity:**
- Requires careful implementation
- Privacy budget management
- Mitigation: Use established libraries, expert review

### Implementation Details

```python
class PublicMetricsService:
    def __init__(self, k_threshold=10, epsilon=0.1):
        self.k_threshold = k_threshold
        self.epsilon = epsilon
    
    def publish_metrics(self, start_date, end_date):
        # Aggregate
        raw_metrics = self._aggregate_outcomes(start_date, end_date)
        
        # Apply K-anonymity
        filtered_metrics = [
            m for m in raw_metrics 
            if m['count'] >= self.k_threshold
        ]
        
        # Apply differential privacy
        noisy_metrics = [
            {
                'outcome': m['outcome'],
                'count': self._add_noise(m['count']),
                'avg_sentiment': self._add_noise(m['avg_sentiment'], sensitivity=0.1)
            }
            for m in filtered_metrics
        ]
        
        return noisy_metrics
    
    def _add_noise(self, value, sensitivity=1):
        scale = sensitivity / self.epsilon
        noise = np.random.laplace(0, scale)
        return max(0, value + noise)  # Ensure non-negative
```

## Conclusion

These engineering decisions prioritize:

1. **Data Integrity:** Immutability ensures trustworthy records
2. **AI Safety:** Bounded agents prevent hallucinations
3. **Scalability:** Clear bottlenecks and mitigation strategies
4. **Privacy:** Multi-layer anonymization protects individuals

The system balances:
- **Functionality** vs **Simplicity**
- **Flexibility** vs **Predictability**
- **Performance** vs **Cost**
- **Insights** vs **Privacy**

All decisions are grounded in real-world trade-offs, not perfect abstractions.
