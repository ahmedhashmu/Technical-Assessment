# Railway Environment Variables Setup

## Copy These Values to Railway

Go to your Railway service → **Variables** tab → Click **"New Variable"** for each:

### 1. JWT_SECRET (Required)
```
JWT_SECRET=b61721012c5fdf3b7b5a7ebba898bff469995cdf05f45f557ca49b45251ad20a
```

### 2. DATABASE_URL (Auto-generated)
This should already exist if you added PostgreSQL database.
If not:
1. Click "New" in your Railway project
2. Select "Database" → "Add PostgreSQL"
3. Wait 30 seconds - `DATABASE_URL` will appear automatically

### 3. OPENAI_API_KEY (Optional - for AI features)
```
OPENAI_API_KEY=sk-your-actual-openai-key-here
```
**Note**: Replace with your real OpenAI API key, or use placeholder for now:
```
OPENAI_API_KEY=sk-placeholder
```

---

## Step-by-Step Instructions

### Option 1: Add Variables via Railway Dashboard (2 minutes)

1. **Open Railway Dashboard**: https://railway.app/dashboard
2. **Select your project**: "cozy-intuition" 
3. **Click your service**: "comfortable-illumination"
4. **Go to Variables tab**
5. **Add each variable**:
   - Click "New Variable"
   - Paste variable name (e.g., `JWT_SECRET`)
   - Paste value (from above)
   - Click "Add"
6. **Verify DATABASE_URL exists**:
   - Should see `DATABASE_URL=postgresql://...`
   - If missing, add PostgreSQL database (see step 2 above)
7. **Save and Deploy**:
   - Railway auto-deploys when variables change
   - Watch "Deployments" tab for success

### Option 2: Add Variables via Railway CLI (1 minute)

```bash
# Install Railway CLI (if not installed)
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Add variables
railway variables set JWT_SECRET=b61721012c5fdf3b7b5a7ebba898bff469995cdf05f45f557ca49b45251ad20a
railway variables set OPENAI_API_KEY=sk-placeholder

# Verify
railway variables
```

---

## Verification Checklist

After adding variables, verify in Railway dashboard:

- [ ] `DATABASE_URL` exists (starts with `postgresql://`)
- [ ] `JWT_SECRET` exists (64 character hex string)
- [ ] `OPENAI_API_KEY` exists (starts with `sk-` or placeholder)
- [ ] Deployment status shows "Running" (not "Crashed")
- [ ] Logs show "Application startup complete"

---

## Test Your Deployment

Once deployed successfully, test these endpoints:

```bash
# Replace with your Railway URL
export API_URL="https://comfortable-illumination-production.up.railway.app"

# Test health endpoint
curl $API_URL/health
# Expected: {"status":"healthy"}

# Test root endpoint
curl $API_URL/
# Expected: {"name":"TruthOS Meeting Intelligence API",...}
```

---

## Troubleshooting

### Still seeing "Field required" error?
- Verify variables are added to the **service** (not the database)
- Check spelling: `DATABASE_URL` and `JWT_SECRET` (case-sensitive)
- Click "Redeploy" to force restart

### DATABASE_URL missing?
- Add PostgreSQL database: New → Database → Add PostgreSQL
- Wait 30 seconds for provisioning
- `DATABASE_URL` appears automatically in Variables tab

### Deployment still failing?
- Check "Deploy Logs" tab for new errors
- Share the error message for more help

---

## Quick Copy-Paste (All Variables)

```bash
JWT_SECRET=b61721012c5fdf3b7b5a7ebba898bff469995cdf05f45f557ca49b45251ad20a
OPENAI_API_KEY=sk-placeholder
```

**Note**: `DATABASE_URL` is auto-generated when you add PostgreSQL database.

---

## Next Steps After Deployment

1. **Initialize Database** (first time only):
   ```bash
   # Copy DATABASE_URL from Railway Variables tab
   export DATABASE_URL="postgresql://..."
   cd backend
   python -c "from app.db.database import Base, engine; Base.metadata.create_all(bind=engine)"
   ```

2. **Test Login**:
   ```bash
   curl -X POST $API_URL/api/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@truthos.com","password":"AdminPass123"}'
   ```

3. **Update Frontend** (if needed):
   - Update `frontend/.env.local` with Railway URL
   - Redeploy frontend to Vercel

---

**Generated**: February 19, 2026  
**JWT_SECRET**: Securely generated using Python secrets module  
**Status**: Ready to deploy
