# TruthOS Deployment Guide

Complete guide for deploying frontend to Vercel and backend to Render.

---

## Overview

- **Frontend**: Vercel (already deployed)
- **Backend**: Render.com (recommended)
- **Database**: Render PostgreSQL (free tier)

---

## Part 1: Deploy Backend to Render

### Step 1: Sign Up for Render

1. Go to https://render.com
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

### Step 2: Create PostgreSQL Database

1. Click "New +" → "PostgreSQL"
2. Settings:
   - **Name**: `truthos-db`
   - **Database**: `truthos`
   - **User**: `truthos`
   - **Region**: Oregon (or closest to you)
   - **Plan**: Free
3. Click "Create Database"
4. Wait for database to provision (~2 minutes)
5. Copy the **Internal Database URL** (starts with `postgresql://`)

### Step 3: Create Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Settings:
   - **Name**: `truthos-api`
   - **Region**: Oregon (same as database)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty
   - **Runtime**: Python 3
   - **Build Command**: 
     ```bash
     pip install -r backend/requirements.txt
     ```
   - **Start Command**:
     ```bash
     cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Plan**: Free

### Step 4: Add Environment Variables

In the "Environment" section, add these variables:

```
PYTHON_VERSION=3.11.0
JWT_SECRET=<generate-random-string-here>
OPENAI_API_KEY=<your-openai-api-key>
DATABASE_URL=<paste-internal-database-url-from-step-2>
```

**Generate JWT_SECRET**:
```bash
# On Mac/Linux
openssl rand -hex 32

# Or use this Python command
python -c "import secrets; print(secrets.token_hex(32))"
```

### Step 5: Deploy

1. Click "Create Web Service"
2. Render will automatically:
   - Clone your repo
   - Install dependencies
   - Start your FastAPI app
3. Wait for deployment (~3-5 minutes)
4. Your API will be available at: `https://truthos-api.onrender.com`

### Step 6: Test Backend

```bash
# Test health endpoint
curl https://truthos-api.onrender.com/health

# Expected response
{"status": "healthy"}

# Test login
curl -X POST https://truthos-api.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@truthos.com","password":"AdminPass123"}'

# Expected: JWT token response
```

---

## Part 2: Update Vercel Frontend

### Step 1: Add Backend URL to Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add new variable:
   - **Key**: `BACKEND_URL`
   - **Value**: `https://truthos-api.onrender.com`
   - **Environment**: Production, Preview, Development
5. Click "Save"

### Step 2: Redeploy Frontend

1. Go to "Deployments" tab
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Or push a new commit to trigger auto-deploy

### Step 3: Test Full Stack

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Go to login page
3. Login with demo credentials
4. Submit a meeting
5. View contact page
6. Trigger analysis

---

## Part 3: Database Setup

### Initialize Database Tables

**Option 1: Using Render Shell**

1. Go to your Render web service
2. Click "Shell" tab
3. Run:
```bash
cd backend
python -c "from app.db.database import Base, engine; Base.metadata.create_all(bind=engine)"
```

**Option 2: Using Local Connection**

1. Copy External Database URL from Render
2. On your local machine:
```bash
cd backend
export DATABASE_URL="<external-database-url>"
python -c "from app.db.database import Base, engine; Base.metadata.create_all(bind=engine)"
```

**Option 3: Using Migration Script**

Create `backend/init_db.py`:
```python
from app.db.database import Base, engine

def init_db():
    """Initialize database tables."""
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created successfully")

if __name__ == "__main__":
    init_db()
```

Then run on Render shell:
```bash
cd backend && python init_db.py
```

---

## Part 4: CORS Configuration

Update `backend/app/main.py` to allow your Vercel domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "https://your-app.vercel.app",  # Your Vercel domain
        "https://*.vercel.app",  # All Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Commit and push to trigger redeploy.

---

## Part 5: Monitoring & Logs

### View Backend Logs

1. Go to Render dashboard
2. Select your web service
3. Click "Logs" tab
4. View real-time logs

### View Frontend Logs

1. Go to Vercel dashboard
2. Select your project
3. Click "Deployments" → Select deployment
4. Click "View Function Logs"

---

## Alternative: Deploy Backend to Railway

If you prefer Railway over Render:

### Step 1: Sign Up

1. Go to https://railway.app
2. Sign up with GitHub

### Step 2: New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your repository
4. Railway auto-detects Python

### Step 3: Configure

1. Add environment variables:
   - `JWT_SECRET`
   - `OPENAI_API_KEY`
2. Railway automatically provisions PostgreSQL
3. `DATABASE_URL` is auto-set

### Step 4: Deploy

1. Railway auto-deploys
2. Get your URL from dashboard
3. Update Vercel `BACKEND_URL`

---

## Cost Breakdown

### Free Tier (Recommended for Demo)

**Render**:
- Web Service: Free (spins down after 15 min inactivity)
- PostgreSQL: Free (90 days, then $7/month)
- Bandwidth: 100 GB/month
- **Total**: $0/month (first 90 days)

**Vercel**:
- Hobby plan: Free
- Bandwidth: 100 GB/month
- Serverless functions: 100 GB-hours
- **Total**: $0/month

**Total Cost**: $0/month for first 90 days

### Paid Tier (Production)

**Render**:
- Web Service: $7/month (always-on)
- PostgreSQL: $7/month
- **Total**: $14/month

**Vercel**:
- Pro plan: $20/month (optional, for team features)

**Total Cost**: $14-34/month

---

## Troubleshooting

### Issue: Backend Returns 502 Bad Gateway

**Cause**: Backend not running or wrong start command

**Solution**:
1. Check Render logs for errors
2. Verify start command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Ensure `$PORT` is used (Render assigns port dynamically)

### Issue: Database Connection Error

**Cause**: Wrong DATABASE_URL or database not initialized

**Solution**:
1. Verify DATABASE_URL in environment variables
2. Use Internal Database URL (not External)
3. Initialize tables using shell command

### Issue: CORS Error in Browser

**Cause**: Vercel domain not in CORS allow_origins

**Solution**:
1. Update `backend/app/main.py` CORS settings
2. Add your Vercel domain to allow_origins
3. Redeploy backend

### Issue: 401 Unauthorized on All Requests

**Cause**: JWT_SECRET mismatch or not set

**Solution**:
1. Verify JWT_SECRET is set in Render environment variables
2. Ensure it's the same secret used to generate tokens
3. Restart backend service

### Issue: Cold Starts (Free Tier)

**Cause**: Render free tier spins down after 15 minutes

**Solution**:
- Upgrade to paid plan ($7/month) for always-on
- Or accept 30-second cold start delay
- Or use a ping service to keep it warm

---

## Production Checklist

Before going to production:

- [ ] Use paid Render plan (always-on)
- [ ] Set strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS only (Render does this automatically)
- [ ] Restrict CORS to specific domains (not wildcard)
- [ ] Set up database backups (Render Pro plan)
- [ ] Add monitoring (Render has built-in metrics)
- [ ] Set up custom domain (optional)
- [ ] Enable rate limiting
- [ ] Review security checklist in IMPLEMENTATION_SUMMARY.md
- [ ] Test all endpoints in production
- [ ] Set up error tracking (Sentry, etc.)

---

## Custom Domain (Optional)

### For Backend (Render)

1. Go to Render dashboard → Your service
2. Click "Settings" → "Custom Domain"
3. Add domain: `api.yourdomain.com`
4. Add CNAME record in your DNS:
   - Name: `api`
   - Value: `truthos-api.onrender.com`
5. Wait for DNS propagation (~5 minutes)
6. Render auto-provisions SSL certificate

### For Frontend (Vercel)

1. Go to Vercel dashboard → Your project
2. Click "Settings" → "Domains"
3. Add domain: `yourdomain.com`
4. Follow Vercel's DNS instructions
5. Vercel auto-provisions SSL certificate

---

## Environment Variables Reference

### Backend (Render)

```bash
# Required
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=your-secret-key-here
OPENAI_API_KEY=sk-...

# Optional
PYTHON_VERSION=3.11.0
LLM_PROVIDER=openai
LLM_MODEL=gpt-4
```

### Frontend (Vercel)

```bash
# Required
BACKEND_URL=https://truthos-api.onrender.com

# Optional (if using different environments)
NEXT_PUBLIC_API_URL=https://truthos-api.onrender.com
```

---

## Quick Deploy Commands

### Deploy Backend (Render)

```bash
# Render auto-deploys on git push
git add .
git commit -m "Deploy to Render"
git push origin main
```

### Deploy Frontend (Vercel)

```bash
# Vercel auto-deploys on git push
git add .
git commit -m "Deploy to Vercel"
git push origin main

# Or manual deploy
vercel --prod
```

---

## Support & Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **FastAPI Deployment**: https://fastapi.tiangolo.com/deployment/
- **PostgreSQL on Render**: https://render.com/docs/databases

---

**Last Updated**: February 2026  
**Status**: Production-Ready
