# Railway Deployment Troubleshooting Guide

## Quick Checklist

Before debugging, verify these are set up:

- [ ] PostgreSQL database added in Railway
- [ ] Environment variables configured
- [ ] `railway.json` file in project root
- [ ] `runtime.txt` in backend folder
- [ ] All files committed and pushed to GitHub

---

## Step-by-Step Debugging

### 1. View Deployment Logs

1. Go to Railway dashboard
2. Click your service
3. Click "Deployments" tab
4. Click the failed deployment
5. Read the error message (usually at the bottom)

### 2. Common Error Messages & Solutions

#### Error: "No such file or directory: requirements.txt"

**Cause**: Railway can't find your backend folder

**Solution**: Use the `railway.json` file I created:

```json
{
  "build": {
    "buildCommand": "cd backend && pip install -r requirements.txt"
  },
  "deploy": {
    "startCommand": "cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT"
  }
}
```

**Steps**:
1. Make sure `railway.json` is in your project ROOT (not in backend folder)
2. Commit and push:
   ```bash
   git add railway.json
   git commit -m "Add Railway config"
   git push origin main
   ```
3. Railway will auto-redeploy

---

#### Error: "ModuleNotFoundError: No module named 'jose'"

**Cause**: Dependencies not installed

**Solution**: 
1. Check `backend/requirements.txt` exists
2. Verify it contains `python-jose[cryptography]==3.3.0`
3. Check Railway build logs - should see "Installing dependencies..."
4. If not, update `railway.json` buildCommand

---

#### Error: "could not connect to server: Connection refused"

**Cause**: Database not configured

**Solution**:
1. In Railway dashboard, click "New" → "Database" → "Add PostgreSQL"
2. Wait for database to provision (~1 minute)
3. Railway automatically creates `DATABASE_URL` variable
4. Go to your service → "Variables" tab
5. Verify `DATABASE_URL` exists (starts with `postgresql://`)
6. Redeploy your service

---

#### Error: "Address already in use" or "Failed to bind to port"

**Cause**: Not using Railway's PORT variable

**Solution**: 
Your start command should be:
```bash
cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Note the `$PORT` - Railway assigns this dynamically.

---

#### Error: "Application startup failed"

**Cause**: Usually database connection or missing environment variables

**Solution**:
1. Check Variables tab in Railway
2. Ensure these are set:
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=<random-string>
   OPENAI_API_KEY=sk-...
   ```
3. Generate JWT_SECRET:
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```

---

#### Error: "Build failed" or "Build timed out"

**Cause**: Build taking too long or failing

**Solution**:
1. Check if `requirements.txt` has conflicting versions
2. Try pinning versions (already done in your file)
3. Check Railway build logs for specific package errors
4. If timeout, upgrade to Railway Pro (more build time)

---

#### Error: "Deployment failed: Health check timeout"

**Cause**: App not responding on the correct port

**Solution**:
1. Verify start command uses `$PORT`
2. Check app logs for startup errors
3. Test health endpoint locally:
   ```bash
   cd backend
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   curl http://localhost:8000/health
   ```

---

### 3. Manual Deployment Steps

If auto-deploy isn't working, try manual setup:

#### Step 1: Create Service

1. Railway dashboard → "New Project"
2. "Deploy from GitHub repo"
3. Select your repository
4. Railway detects Python automatically

#### Step 2: Configure Root Directory

1. Click your service → "Settings"
2. Scroll to "Root Directory"
3. Leave EMPTY (we use `railway.json` to handle paths)
4. Save

#### Step 3: Configure Build

1. Settings → "Build"
2. Build Command:
   ```bash
   cd backend && pip install -r requirements.txt
   ```
3. Start Command:
   ```bash
   cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

#### Step 4: Add PostgreSQL

1. Click "New" in your project
2. Select "Database" → "Add PostgreSQL"
3. Wait for provisioning
4. `DATABASE_URL` auto-added to your service

#### Step 5: Add Environment Variables

1. Your service → "Variables" tab
2. Click "New Variable"
3. Add:
   ```
   JWT_SECRET=<generate-with-command-below>
   OPENAI_API_KEY=sk-...
   ```
4. Generate JWT_SECRET:
   ```bash
   openssl rand -hex 32
   ```

#### Step 6: Deploy

1. Click "Deploy" button
2. Watch logs in real-time
3. Wait for "Deployment successful"

---

### 4. Verify Deployment

Once deployed, test these endpoints:

```bash
# Replace with your Railway URL
export API_URL="https://your-app.up.railway.app"

# Test health
curl $API_URL/health
# Expected: {"status": "healthy"}

# Test root
curl $API_URL/
# Expected: {"name": "TruthOS Meeting Intelligence API", ...}

# Test login
curl -X POST $API_URL/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@truthos.com","password":"AdminPass123"}'
# Expected: {"access_token": "...", ...}
```

---

### 5. Database Initialization

After first successful deployment, initialize database tables:

#### Option 1: Railway Shell

1. Your service → "Shell" tab (if available)
2. Run:
   ```bash
   cd backend
   python -c "from app.db.database import Base, engine; Base.metadata.create_all(bind=engine)"
   ```

#### Option 2: Local Connection

1. Copy DATABASE_URL from Railway Variables
2. On your local machine:
   ```bash
   cd backend
   export DATABASE_URL="<railway-database-url>"
   python -c "from app.db.database import Base, engine; Base.metadata.create_all(bind=engine)"
   ```

#### Option 3: Create Init Script

Create `backend/init_db.py`:
```python
from app.db.database import Base, engine

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("✓ Database initialized")
```

Then run via Railway shell:
```bash
cd backend && python init_db.py
```

---

### 6. Common Configuration Issues

#### Issue: CORS Errors

**Symptom**: Frontend can't connect to backend

**Solution**: Update `backend/app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-app.vercel.app",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Issue: Environment Variables Not Loading

**Symptom**: App can't find DATABASE_URL or JWT_SECRET

**Solution**:
1. Check Variables tab - ensure they're set
2. Restart deployment (click "Redeploy")
3. Check logs for "KeyError" messages

#### Issue: Database Connection Pool Exhausted

**Symptom**: "too many connections" error

**Solution**: Add to environment variables:
```
DATABASE_POOL_SIZE=5
DATABASE_MAX_OVERFLOW=10
```

---

### 7. Logs Analysis

#### Good Deployment Logs Should Show:

```
✓ Building...
✓ Installing dependencies from requirements.txt
✓ Successfully installed fastapi uvicorn sqlalchemy...
✓ Starting application...
✓ Uvicorn running on http://0.0.0.0:$PORT
✓ Application startup complete
✓ Deployment successful
```

#### Bad Deployment Logs Might Show:

```
✗ ModuleNotFoundError: No module named 'jose'
  → Missing dependency, check requirements.txt

✗ could not connect to server
  → Database not configured, add PostgreSQL

✗ Address already in use
  → Not using $PORT variable

✗ No such file or directory: requirements.txt
  → Wrong root directory, use railway.json
```

---

### 8. Still Not Working?

If you've tried everything above:

1. **Copy your error logs**:
   - Go to Deployments → Failed deployment
   - Copy the entire log output
   - Share it with me

2. **Check Railway Status**:
   - Visit https://railway.app/status
   - Verify no ongoing incidents

3. **Try Railway CLI**:
   ```bash
   npm install -g @railway/cli
   railway login
   railway link
   railway logs
   ```

4. **Contact Railway Support**:
   - Railway Discord: https://discord.gg/railway
   - Usually respond within hours

---

## Quick Fix Checklist

Run through this checklist:

```bash
# 1. Verify files exist
ls railway.json          # Should exist in project root
ls backend/runtime.txt   # Should exist
ls backend/requirements.txt  # Should exist

# 2. Verify railway.json content
cat railway.json
# Should have buildCommand and startCommand with "cd backend"

# 3. Commit and push
git add railway.json backend/runtime.txt
git commit -m "Fix Railway deployment"
git push origin main

# 4. Check Railway dashboard
# - PostgreSQL database added?
# - Environment variables set?
# - Deployment logs show errors?

# 5. Test locally first
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
# Visit http://localhost:8000/health
```

---

## Need Help?

**Share these with me**:
1. Screenshot of Railway deployment logs (the error part)
2. Screenshot of your Variables tab
3. Output of: `ls -la` (to see your file structure)
4. Your railway.json content

I'll help you fix it immediately!
