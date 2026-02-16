# Deployment Guide

## Vercel Deployment

Your TruthOS Meeting Intelligence application is ready for deployment on Vercel.

### Prerequisites

- Vercel account
- GitHub repository connected to Vercel
- Environment variables configured

### Deployment Steps

#### 1. Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository: `ahmedhashmu/Technical-Assessment`
4. Vercel will auto-detect Next.js configuration

#### 2. Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

**Production Environment:**

```
# Database
DATABASE_URL=postgresql://neondb_owner:npg_Y3vyDsGe6zlA@ep-orange-mountain-aidof922-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# LLM API (OpenAI)
OPENAI_API_KEY=your_openai_key
LLM_PROVIDER=openai
LLM_MODEL=gpt-4

# Authentication
JWT_SECRET=d687019fcd2ef40a5710aa556ec1902c

# Application
ENVIRONMENT=production
LOG_LEVEL=INFO

# Frontend
NEXT_PUBLIC_API_URL=https://technical-assessment-lake.vercel.app/api
```

#### 3. Deploy

```bash
# Option 1: Deploy via Git Push
git push origin main
# Vercel will automatically deploy

# Option 2: Deploy via Vercel CLI
npm i -g vercel
vercel --prod
```

### Project Structure for Vercel

```
Technical-Assessment/
├── frontend/          # Next.js app (auto-detected)
│   ├── app/
│   ├── components/
│   └── package.json
├── backend/           # Python FastAPI
│   ├── app/
│   └── requirements.txt
└── vercel.json        # Vercel configuration
```

### Vercel Configuration

The `vercel.json` file configures:
- Next.js frontend build
- Python backend as serverless functions
- API routing to backend
- Static file serving from frontend

### Database Initialization

After first deployment, initialize the database:

```bash
# SSH into Vercel or run locally with production DATABASE_URL
python backend/app/db/init_db.py
```

Or use Vercel CLI:

```bash
vercel env pull .env.production
cd backend
python -m app.db.init_db
```

### Verify Deployment

1. **Frontend**: https://technical-assessment-lake.vercel.app/
2. **API Health**: https://technical-assessment-lake.vercel.app/api/health
3. **API Docs**: https://technical-assessment-lake.vercel.app/api/docs

### Testing the Deployment

#### 1. Submit a Meeting

```bash
curl -X POST https://technical-assessment-lake.vercel.app/api/meetings \
  -H "Content-Type: application/json" \
  -d '{
    "meetingId": "meet_test_001",
    "contactId": "contact_test_001",
    "type": "sales",
    "occurredAt": "2026-02-16T10:00:00Z",
    "transcript": "This is a test meeting transcript discussing product features and pricing."
  }'
```

#### 2. Analyze the Meeting

```bash
curl -X POST https://technical-assessment-lake.vercel.app/api/meetings/meet_test_001/analyze
```

#### 3. View Contact Meetings

```bash
curl https://technical-assessment-lake.vercel.app/api/contacts/contact_test_001/meetings
```

Or visit in browser:
- https://technical-assessment-lake.vercel.app/meetings/new
- https://technical-assessment-lake.vercel.app/contacts/contact_test_001

### Monitoring

**Vercel Dashboard:**
- View deployment logs
- Monitor function invocations
- Track bandwidth usage
- Check error rates

**Database Monitoring:**
- Neon Console: https://console.neon.tech
- Monitor connection pool
- Check query performance
- View storage usage

**LLM API Monitoring:**
- OpenAI Dashboard: https://platform.openai.com/usage
- Track API costs
- Monitor rate limits
- View usage patterns

### Troubleshooting

#### Database Connection Issues

```bash
# Test connection
psql 'postgresql://neondb_owner:npg_Y3vyDsGe6zlA@ep-orange-mountain-aidof922-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

# Check if tables exist
\dt
```

#### API Errors

Check Vercel function logs:
```bash
vercel logs
```

#### Frontend Build Errors

```bash
cd frontend
npm install
npm run build
```

### Performance Optimization

**Frontend:**
- Static page generation where possible
- Image optimization with Next.js Image
- Code splitting and lazy loading
- CDN caching via Vercel Edge Network

**Backend:**
- Connection pooling for database
- LLM response caching
- Rate limiting on analysis endpoints
- Async processing for heavy operations

**Database:**
- Indexes on frequently queried fields
- Connection pooling via PgBouncer
- Query optimization
- Read replicas for scaling

### Cost Estimates

**Vercel (Pro Plan - $20/month):**
- Unlimited bandwidth
- Unlimited function invocations
- 100GB storage

**Neon PostgreSQL:**
- Free tier: 0.5GB storage, 100 hours compute/month
- Pro tier: $19/month for 10GB storage

**OpenAI GPT-4:**
- ~$0.03 per meeting analysis
- 100 meetings/month = $3
- 1000 meetings/month = $30

**Total Estimated Monthly Cost:**
- Low usage (< 100 meetings): $20-40
- Medium usage (< 1000 meetings): $50-100
- High usage (> 1000 meetings): $100-200

### Scaling Strategy

**Phase 1 (Current → 1000 meetings/month):**
- Current setup sufficient
- Monitor Vercel function limits
- Track LLM API costs

**Phase 2 (1000 → 10,000 meetings/month):**
- Implement analysis job queue
- Add Redis caching
- Upgrade Neon to Pro tier
- Consider batch processing

**Phase 3 (10,000+ meetings/month):**
- Dedicated backend server
- Database read replicas
- CDN for static assets
- Horizontal scaling

### Security Checklist

- [x] Environment variables in Vercel (not in code)
- [x] HTTPS enforced
- [x] CORS configured
- [x] Database SSL enabled
- [x] API rate limiting (recommended)
- [x] Input validation on all endpoints
- [x] JWT secret rotation (recommended quarterly)

### Backup Strategy

**Database Backups:**
- Neon automatic daily backups
- Point-in-time recovery available
- Manual backup: `pg_dump`

**Code Backups:**
- GitHub repository
- Vercel deployment history
- Local development copies

### Support

**Vercel Support:**
- Documentation: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions

**Neon Support:**
- Documentation: https://neon.tech/docs
- Discord: https://discord.gg/neon

**Project Repository:**
- GitHub: https://github.com/ahmedhashmu/Technical-Assessment
- Issues: https://github.com/ahmedhashmu/Technical-Assessment/issues

## Local Development

For local development setup, see [README.md](README.md).

## Production Checklist

Before going live:

- [ ] Database initialized with schema and triggers
- [ ] Environment variables configured in Vercel
- [ ] API endpoints tested
- [ ] Frontend pages tested
- [ ] LLM analysis working
- [ ] Error handling verified
- [ ] Monitoring set up
- [ ] Backup strategy in place
- [ ] Documentation updated
- [ ] Security review completed
