# Configuration Guide

## Environment Variables

This project uses environment variables for configuration. Both backend and frontend have their own `.env` files.

### Backend Configuration

Location: `backend/.env`

```env
# Database Configuration
DATABASE_URL=postgresql://neondb_owner:npg_Y3vyDsGe6zlA@ep-orange-mountain-aidof922-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# LLM API Configuration
OPENAI_API_KEY=your_openai_api_key_here
LLM_PROVIDER=openai
LLM_MODEL=gpt-4

# Authentication
JWT_SECRET=d687019fcd2ef40a5710aa556ec1902c

# Application Settings
ENVIRONMENT=development
LOG_LEVEL=INFO
```

#### Database Setup

**Neon PostgreSQL Database**
- Provider: Neon (Serverless PostgreSQL)
- Connection String: Already configured in `.env`
- Database: `neondb`
- User: `neondb_owner`

To connect directly via psql:
```bash
psql 'postgresql://neondb_owner:npg_Y3vyDsGe6zlA@ep-orange-mountain-aidof922-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
```

#### LLM Provider Options

**Option 1: OpenAI (Default)**
- Provider: OpenAI
- Model: gpt-4
- API Key: Already configured

**Option 2: xAI Grok (Alternative)**
To use Grok instead, update your `.env`:
```env
# Comment out OpenAI
# OPENAI_API_KEY=...
# LLM_PROVIDER=openai

# Uncomment xAI Grok
XAI_API_KEY=your_xai_api_key_here
LLM_PROVIDER=xai
LLM_MODEL=grok-4-latest
```

Test xAI Grok connection:
```bash
curl https://api.x.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_XAI_API_KEY" \
  -d '{
    "messages": [
      {"role": "system", "content": "You are a test assistant."},
      {"role": "user", "content": "Testing. Just say hi and hello world and nothing else."}
    ],
    "model": "grok-4-latest",
    "stream": false,
    "temperature": 0
  }'
```

#### JWT Secret

The JWT secret is used for authentication token signing and validation:
```
JWT_SECRET=d687019fcd2ef40a5710aa556ec1902c
```

This secret must be the same in both backend and frontend configurations.

### Frontend Configuration

Location: `frontend/.env.local`

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Authentication
JWT_SECRET=d687019fcd2ef40a5710aa556ec1902c

# Application Settings
NEXT_PUBLIC_APP_NAME=TruthOS Meeting Intelligence
NEXT_PUBLIC_ENVIRONMENT=development
```

#### Environment Variables Explained

- `NEXT_PUBLIC_API_URL`: Backend API base URL (must start with `NEXT_PUBLIC_` to be accessible in browser)
- `JWT_SECRET`: Must match backend JWT secret for token validation
- `NEXT_PUBLIC_APP_NAME`: Application name displayed in UI
- `NEXT_PUBLIC_ENVIRONMENT`: Current environment (development/production)

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit `.env` files to Git** - They contain sensitive credentials
2. **Use `.env.example` for templates** - These are safe to commit
3. **Rotate credentials regularly** - Especially API keys and JWT secrets
4. **Use different secrets for production** - Never use development secrets in production

## Production Deployment

### Vercel Environment Variables

When deploying to Vercel, set these environment variables in the Vercel dashboard:

**Backend (Vercel Serverless Functions or External Service):**
- `DATABASE_URL`
- `OPENAI_API_KEY` or `XAI_API_KEY`
- `LLM_PROVIDER`
- `LLM_MODEL`
- `JWT_SECRET`
- `ENVIRONMENT=production`

**Frontend (Vercel):**
- `NEXT_PUBLIC_API_URL` (your production backend URL)
- `JWT_SECRET` (must match backend)
- `NEXT_PUBLIC_ENVIRONMENT=production`

### Database Migration

Before deploying, ensure database schema is set up:

```bash
cd backend
python -m app.db.init_db
```

This will create:
- `meetings` table (immutable records)
- `meeting_analyses` table (derived data)
- `contacts` table (simplified)
- Database triggers for immutability enforcement

## Verification

### Test Backend Configuration

```bash
cd backend
source venv/bin/activate
python -c "from app.core.config import settings; print(f'Database: {settings.DATABASE_URL[:30]}...'); print(f'LLM Provider: {settings.LLM_PROVIDER}')"
```

### Test Frontend Configuration

```bash
cd frontend
npm run dev
# Check browser console for environment variables
```

### Test Database Connection

```bash
cd backend
python -c "from app.db.database import engine; engine.connect(); print('Database connection successful!')"
```

### Test LLM API

```bash
cd backend
python -c "from app.services.llm_client import LLMClient; client = LLMClient(); print('LLM client initialized successfully!')"
```

## Troubleshooting

### Database Connection Issues

If you get connection errors:
1. Check that DATABASE_URL is correct
2. Verify network access to Neon (firewall/VPN)
3. Ensure SSL mode is enabled
4. Check Neon dashboard for database status

### LLM API Issues

If you get API errors:
1. Verify API key is correct and active
2. Check API rate limits and quotas
3. Ensure correct model name
4. Test with curl command provided above

### JWT Issues

If authentication fails:
1. Ensure JWT_SECRET matches in backend and frontend
2. Check token expiration settings
3. Verify token format in requests

## Cost Monitoring

### LLM API Costs

**OpenAI GPT-4:**
- ~$0.03 per meeting analysis (1000 token transcript)
- Monitor usage at: https://platform.openai.com/usage

**xAI Grok:**
- Pricing varies, check xAI dashboard
- Monitor usage at: https://console.x.ai

### Database Costs

**Neon PostgreSQL:**
- Free tier: 0.5 GB storage, 100 hours compute/month
- Monitor usage at: https://console.neon.tech

### Vercel Costs

**Free Tier:**
- 100 GB bandwidth
- 100 serverless function invocations/day

**Pro Tier ($20/month):**
- Unlimited bandwidth
- Unlimited function invocations

Monitor at: https://vercel.com/dashboard/usage

## Support

For configuration issues:
1. Check this guide first
2. Review `.env.example` files
3. Check application logs
4. Verify credentials in respective dashboards
