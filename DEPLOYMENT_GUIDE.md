# 🚀 SMATQ Store - Deployment Guide (Vercel + Render)

## Overview
This guide walks you through deploying **SMATQ Store** to production:
- **Frontend**: Vercel (React app)
- **Backend**: Render (Express API)
- **Payment Integration**: Snippe/ClickPesa

### Prerequisites
Before starting, ensure you have:
- [ ] GitHub account (for git push)
- [ ] Vercel account (free tier OK)
- [ ] Render account (free tier OK, but limited)
- [ ] Snippe/ClickPesa API credentials (from https://dashboard.clickpesa.com)

---

## Phase 1: Get Snippe API Credentials (30 minutes)

### Step 1: Register with Snippe/ClickPesa
1. Go to https://dashboard.clickpesa.com
2. Sign up or log in
3. Create a new **Application** or **Project**

### Step 2: Collect Your Credentials
From your ClickPesa dashboard, copy these values:

```
SNIPPE_API_KEY = [Copy from dashboard]
SNIPPE_WEBHOOK_SECRET = [Generate and note]
```

- **Note**: Some dashboards call it "API Key" or "Client ID"
- **Base URL** is always: `https://api.snippe.sh`

### Step 3: Create .env File (Local Testing)
Create `backend/.env` in your project:

```bash
# backend/.env
PORT=5002
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Payment (from ClickPesa dashboard)
SNIPPE_API_KEY=your_actual_api_key_here
SNIPPE_BASE_URL=https://api.snippe.sh
SNIPPE_WEBHOOK_SECRET=your_actual_webhook_secret_here
WEBHOOK_URL=
```

---

## Phase 2: Test Locally Before Deployment (1 hour)

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Start Backend
```bash
npm run dev
# Should show: ✅ Backend server running on http://localhost:5002
```

### Step 3: In Another Terminal - Start Frontend
```bash
cd product-cart  # root folder
npm run dev
# Should show: http://localhost:5173
```

### Step 4: Test Payment Flow
1. Open http://localhost:5173 in browser
2. Add items to cart
3. Go to checkout
4. Test payment initiation
   - Should NOT error about API connection
   - Should show payment options

### ✅ If Local Testing Works
You're ready for deployment! Move to Phase 3.

---

## Phase 3: Deploy Backend to Render (15 minutes)

### Step 1: Push Code to GitHub
```bash
git add .
git commit -m "Prepare for Render/Vercel deployment"
git push origin main
```

### Step 2: Create Render Account & Connect GitHub
1. Go to https://render.com
2. Sign up (free)
3. Click **Dashboard** → **New +** → **Web Service**
4. Select **Build and deploy from a Git repository**
5. Authorize GitHub & connect your repository

### Step 3: Configure Render Service
On Render's "Create Web Service" page:

| Setting | Value |
|---------|-------|
| **Name** | `smatq-store-backend` |
| **Runtime** | `Node` |
| **Build Command** | `cd backend && npm install` |
| **Start Command** | `cd backend && npm start` |
| **Plan** | `Free` (sufficient for testing) |

Click **Create Web Service** and wait for build to complete (~2 minutes).

### Step 4: Configure Environment Variables in Render
1. In your Render service dashboard, go to **Environment**
2. Add these variables:

```
KEY                        VALUE
------                     -----
NODE_ENV                   production
PORT                       5002 (auto-detected)
FRONTEND_URL               https://your-smatq-store.vercel.app (update after Vercel deploy)
SNIPPE_API_KEY             [from ClickPesa dashboard]
SNIPPE_BASE_URL            https://api.snippe.sh
SNIPPE_WEBHOOK_SECRET      [from ClickPesa dashboard]
WEBHOOK_URL                [Will create after Render URL is assigned]
```

### Step 5: Get Render Backend URL
After service deploys successfully (green status):
1. Copy the URL shown at the top (looks like: `https://smatq-store-backend.onrender.com`)
2. Save this - you'll need it for Vercel setup

---

## Phase 4: Deploy Frontend to Vercel (15 minutes)

### Step 1: Create Vercel Account & Import Project
1. Go to https://vercel.com
2. Sign up (free)
3. Click **Add New...** → **Project**
4. Choose **Import Git Repository**
5. Find your GitHub repo and import

### Step 2: Configure Project Settings
On Vercel's import page:

| Setting | Value |
|---------|-------|
| **Framework Preset** | React |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### Step 3: Add Environment Variables
Before deploying, click **Environment Variables** and add:

```
KEY                VALUE
---                -----
VITE_API_URL       https://smatq-store-backend.onrender.com
```
(Use the Render backend URL from Phase 3, Step 5)

Click **Deploy** and wait (~3-5 minutes for build).

### Step 4: Get Vercel Frontend URL
After deployment completes (green status):
1. Copy the URL shown (looks like: `https://smatq-store.vercel.app`)
2. Save this

---

## Phase 5: Complete Backend Configuration (10 minutes)

### Step 1: Update Render Backend FRONTEND_URL
Go back to your Render service:
1. **Environment** tab
2. Edit `FRONTEND_URL`
3. Change to your Vercel frontend URL: `https://smatq-store.vercel.app`
4. Click **Save** (service will redeploy)

### Step 2: Configure Webhooks in Snippe Dashboard
This tells Snippe where to send payment callbacks:

1. Log in to https://dashboard.clickpesa.com
2. Find **Webhook Settings** or **Developer Settings**
3. Add webhook URL:
   ```
   https://smatq-store-backend.onrender.com/api/webhooks/snippe
   ```
4. Set webhook secret (must match `SNIPPE_WEBHOOK_SECRET` in Render env)
5. Save

### Step 3: Update Render WEBHOOK_URL Variable
In Render service environment:
1. Edit `WEBHOOK_URL`
2. Set to: `https://smatq-store-backend.onrender.com/api/webhooks/snippe`
3. Click **Save** (service will redeploy)

---

## Phase 6: Test Production Deployment (10 minutes)

### Test 1: Frontend Loads
1. Open https://your-smatq-store.vercel.app (your Vercel URL)
2. Should load without errors
3. Check browser console (F12) - no CORS errors?

### Test 2: Products Load
1. Should see product grid
2. No "Failed to fetch products" errors
3. Check Network tab → `/api/products` should return 200

### Test 3: Cart Works
1. Add item to cart
2. Go to Cart page
3. Items persist

### Test 4: Checkout Form Loads
1. Click Checkout
2. Form should display
3. No "API connection" errors

### Test 5: Payment Initiation (Full Test)
⚠️ **WARNING**: This will create a REAL pending payment!
1. Fill checkout form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Phone: "0712123456" (test number)
   - Location: "Dar es Salaam"
2. Select payment method (Card or Mobile)
3. Click **Pay Now**
4. Should redirect to Snippe payment page OR show QR code
5. **DO NOT complete payment** in test (uses real money)

### ✅ All Tests Pass?
**Congratulations!** Your deployment is working! 🎉

---

## Phase 7: Troubleshooting Common Issues

### ❌ "Failed to fetch products" Error
**Cause**: Frontend can't reach backend API  
**Fix**:
1. Check Vercel environment variable: `VITE_API_URL` is set to Render URL
2. Check Render backend is running (green status)
3. Check CORS: Render `FRONTEND_URL` matches Vercel URL

### ❌ "CORS Error" in Console
**Cause**: Backend CORS not configured for Vercel domain  
**Fix**:
1. In Render environment, set `FRONTEND_URL=https://your-vercel-app.vercel.app`
2. Redeploy backend

### ❌ "API Key Invalid" Error When Paying
**Cause**: Wrong Snippe API credentials  
**Fix**:
1. Double-check credentials from ClickPesa dashboard
2. Update in Render environment variables
3. Redeploy backend

### ❌ Webhook Not Working (Payment Doesn't Complete)
**Cause**: Webhook URL or secret mismatch  
**Fix**:
1. Verify webhook URL in Snippe dashboard = `https://smatq-store-backend.onrender.com/api/webhooks/snippe`
2. Verify webhook secret matches `SNIPPE_WEBHOOK_SECRET` in Render env
3. Check Render logs for webhook errors

### ❌ Build Fails on Vercel
**Cause**: Missing dependencies or build error  
**Fix**:
1. Check Vercel logs in dashboard
2. Ensure `vite.config.ts` and `tsconfig.json` are correct
3. Run `npm run build` locally to test

### ❌ Render Build Fails
**Cause**: Backend dependencies not installed  
**Fix**:
1. Check Render logs
2. Ensure `backend/package.json` is correct
3. Verify build command: `cd backend && npm install`

---

## Phase 8: Production Checklist

Before considering this "production-ready", verify:

- [ ] **Frontend deploys to Vercel**
- [ ] **Backend deploys to Render**
- [ ] **VITE_API_URL set to Render URL**
- [ ] **CORS configured (FRONTEND_URL set in Render)**
- [ ] **Snippe credentials configured**
- [ ] **Webhooks configured in Snippe dashboard**
- [ ] **Products load from API** (not just local storage)
- [ ] **Checkout form displays**
- [ ] **Payment initiation works** (redirects properly)
- [ ] **No console errors on Vercel app**
- [ ] **No API errors in Render logs**

---

## Recommended Next Steps (After Initial Deployment)

### 🔐 Security Improvements (2-3 hours)
- [ ] Implement JWT authentication for admin routes
- [ ] Remove hardcoded admin password
- [ ] Add password hashing
- [ ] Implement rate limiting on payment endpoint

### 💾 Database Migration (4-6 hours)
- [ ] Migrate from JSON files to PostgreSQL
- [ ] Add database to Render
- [ ] Update backend services to use database
- [ ] Implement data backups

### 🧪 Monitoring & Logging (2-3 hours)
- [ ] Set up error tracking (Sentry)
- [ ] Add structured logging
- [ ] Create monitoring dashboard
- [ ] Set up alerts

### 📱 Mobile Optimization
- [ ] Test on mobile devices
- [ ] Optimize images
- [ ] Test payment flow on mobile

---

## Support & Debugging

### Check Service Status
- **Vercel**: https://vercel.com/dashboard
- **Render**: https://dashboard.render.com
- **Both**: Recent deploy logs available in dashboard

### View Logs
- **Vercel**: Dashboard → Project → Deployments → Logs
- **Render**: Dashboard → Service → Logs (tail in real-time)

### Test API Connectivity
```bash
# Test backend is alive
curl https://smatq-store-backend.onrender.com/api/health

# Should return: { "status": "Server is running", "timestamp": "..." }
```

### Restart Services
- **Vercel**: Automatic on git push
- **Render**: Dashboard → Service → More → Restart Service

---

## 🎉 Deployment Complete!

Your production app is now:
- **Frontend**: https://your-smatq-store.vercel.app
- **Backend**: https://smatq-store-backend.onrender.com
- **Payments**: Connected to Snippe/ClickPesa

### Next: Share with Users!
Your app is ready for customers. Share the frontend URL and start taking orders! 🚀

---

**Questions?** Check the logs or refer to:
- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [Snippe API Docs](https://api.snippe.sh/docs)
