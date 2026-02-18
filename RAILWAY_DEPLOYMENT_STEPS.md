# Railway Deployment - Quick Steps

## ✅ What We Just Fixed

**Problem**: Railway couldn't find your backend folder  
**Solution**: Added `railway.json` configuration file and pushed to GitHub

---

## What Happens Next

Railway will automatically:
1. Detect the new `railway.json` file
2. Know to look in the `backend/` folder
3. Install dependencies from `backend/requirements.txt`
4. Start your app with the correct command
5. Redeploy automatically (takes 2-3 minutes)

---

## Check Deployment Status

1. Go to Railway dashboard
2. Click your backend service
3. Click "Deployments" tab
4. Watch the latest deployment
5. It should now show:
   ```
   ✓ Building...
   ✓ Installing dependencies...
   ✓ Starting application...
   ✓ Deployment successful
   ```

---

## Still Need to Do

### 1. Add PostgreSQL Database (If Not Done)
1. In Railway project, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Wait 30 seconds
4. `DATABASE_URL` will be auto-added to your service

### 2. Add Environment Variables
Go to your backend service → Variables tab → Add these:

**JWT_SECRET**:
```
d687019fcd2ef40a5710aa556ec1902c8b3a4f5e6d7c8b9a0e1f2d3c4b5a6978
```

**OPENAI_API_KEY** (optional for now):
```
sk-placeholder-for-demo
```

### 3. Verify DATABASE_URL Exists
- Should be automatically created when you add PostgreSQL
- Looks like: `postgresql://postgres:...@...railway.app:5432/railway`

---

## After Deployment Succeeds

### Test Your API

Railway will give you a URL like: `https://your-app.up.railway.app`

Test it:
```bash
# Replace with your Railway URL
curl https://your-app.up.railway.app/health

# Expected response:
{"status": "healthy"}
```

### Test Login:
```bash
curl -X POST https://your-app.up.railway.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@truthos.com","password":"AdminPass123"}'

# Expected: JWT token response
```

---

## Update Vercel Frontend

Once backend is deployed:

1. Go to Vercel dashboard
2. Your project → Settings → Environment Variables
3. Add:
   - **Key**: `BACKEND_URL`
   - **Value**: `https://your-app.up.railway.app` (your Railway URL)
4. Redeploy frontend

---

## Troubleshooting

### If Deployment Still Fails

Check the logs for:

**"ModuleNotFoundError"** → Dependencies issue
- Solution: Check `backend/requirements.txt` exists

**"KeyError: 'DATABASE_URL'"** → Database not connected
- Solution: Add PostgreSQL database in Railway

**"could not connect to server"** → Database not provisioned
- Solution: Wait for PostgreSQL to finish provisioning

**"Address already in use"** → Port issue
- Solution: Already fixed in railway.json (uses $PORT)

---

## Current Status

✅ railway.json created and pushed to GitHub  
✅ Railway will auto-redeploy  
⏳ Waiting for deployment to complete  
⏳ Need to add PostgreSQL database  
⏳ Need to add environment variables  
⏳ Need to update Vercel with backend URL  

---

## Next Steps (In Order)

1. **Wait 2-3 minutes** for Railway to redeploy
2. **Check deployment logs** - should succeed now
3. **Add PostgreSQL database** (if not done)
4. **Add environment variables** (JWT_SECRET, OPENAI_API_KEY)
5. **Test API endpoints** (health, login)
6. **Update Vercel** with backend URL
7. **Test full stack** (frontend → backend)

---

## Need Help?

If deployment still fails after 3 minutes:
1. Go to Deployments tab
2. Click the failed deployment
3. Copy the error message
4. Share it with me

I'll help you fix it immediately!
