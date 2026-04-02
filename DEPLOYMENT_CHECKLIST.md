# 🚀 SMATQ Store - Quick Deployment Checklist

## Pre-Deployment Setup (Do This First!)

### ✅ Step 1: Get Snippe/ClickPesa Credentials
- [ ] Register at https://dashboard.clickpesa.com
- [ ] Create an application
- [ ] Copy `SNIPPE_API_KEY` (also called Client ID or API Key)
- [ ] Generate `SNIPPE_WEBHOOK_SECRET` (for webhook verification)
- [ ] Note: Base URL is always `https://api.snippe.sh`

### ✅ Step 2: Create Backend .env File
Create `backend/.env` with:
```
PORT=5002
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
SNIPPE_API_KEY=your_key_here
SNIPPE_BASE_URL=https://api.snippe.sh
SNIPPE_WEBHOOK_SECRET=your_secret_here
WEBHOOK_URL=
```

### ✅ Step 3: Test Locally
```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev
# Should show: ✅ Backend server running on http://localhost:5002

# Terminal 2: Frontend
cd product-cart
npm install
npm run dev
# Should show: Local: http://localhost:5173
```

Test the app:
- [ ] Products load
- [ ] Add item to cart
- [ ] Checkout form works
- [ ] No CORS errors

### ✅ Step 4: Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel/Render deployment"
git push origin main
```

---

## Deployment Steps

### 🟦 STEP A: Deploy Backend to Render (15 min)

1. Go to https://render.com → Sign up (free)
2. Click **New +** → **Web Service**
3. Connect GitHub repo
4. Configure:
   - **Name**: `smatq-store-backend`
   - **Runtime**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free
5. Click **Create Web Service**
6. ⏳ Wait for deployment (2-3 min)
7. ✅ Copy the Render URL (looks like: `https://smatq-store-backend.onrender.com`)

### 🟦 Configuration in Render Environment Variables:
Set these in Render dashboard:
```
PORT                    5002
NODE_ENV                production
FRONTEND_URL            (will update after Vercel)
SNIPPE_API_KEY          (from ClickPesa)
SNIPPE_BASE_URL         https://api.snippe.sh
SNIPPE_WEBHOOK_SECRET   (from ClickPesa)
WEBHOOK_URL             (will update after deploy)
```

---

### 🟦 STEP B: Deploy Frontend to Vercel (15 min)

1. Go to https://vercel.com → Sign up (free)
2. Click **Add New** → **Project**
3. Import your GitHub repo
4. Configure:
   - **Framework**: React
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Before deploying**, add Environment Variable:
   ```
   VITE_API_URL = https://smatq-store-backend.onrender.com
   ```
   (Use your Render URL from Step A)
6. Click **Deploy**
7. ⏳ Wait for deployment (3-5 min)
8. ✅ Copy the Vercel URL (looks like: `https://smatq-store.vercel.app`)

---

### 🟦 STEP C: Final Configuration (10 min)

1. **Update Render Backend**, go to Environment Variables:
   - Edit `FRONTEND_URL` = your Vercel URL
   - Edit `WEBHOOK_URL` = `https://smatq-store-backend.onrender.com/api/webhooks/snippe`
   - Click Save (backend will redeploy)

2. **Configure Webhooks in Snippe Dashboard**:
   - Log in: https://dashboard.clickpesa.com
   - Find Webhook or Developer Settings
   - Add webhook endpoint: `https://smatq-store-backend.onrender.com/api/webhooks/snippe`
   - Set webhook secret (match `SNIPPE_WEBHOOK_SECRET`)
   - Save

---

## ✅ Testing Production

1. **Open frontend**: https://your-smatq-store.vercel.app
2. **Browse products** → should load from API
3. **Add to cart** → works?
4. **Checkout** → form displays?
5. **Payment test** → redirects to Snippe?

---

## 📋 Environment Variables Reference

### Backend (.env or Render)
| Variable | Example | Where to Get |
|----------|---------|--------------|
| `SNIPPE_API_KEY` | `sk_live_...` | ClickPesa dashboard |
| `SNIPPE_BASE_URL` | `https://api.snippe.sh` | Fixed value |
| `SNIPPE_WEBHOOK_SECRET` | `secret_123...` | Generate in ClickPesa |
| `FRONTEND_URL` | `https://your-app.vercel.app` | Vercel URL |
| `WEBHOOK_URL` | `https://backend.onrender.com/api/webhooks/snippe` | Render URL |
| `PORT` | `5002` | Fixed value |
| `NODE_ENV` | `production` | Fixed value |

### Frontend (Vercel Environment)
| Variable | Example |
|----------|---------|
| `VITE_API_URL` | `https://your-backend.onrender.com` |

---

## 🆘 Troubleshooting

### ❌ "Cannot reach API" Error
- [ ] Check Render backend is running (green status)
- [ ] Check Vercel `VITE_API_URL` matches Render URL
- [ ] Check Render `FRONTEND_URL` matches Vercel URL
- [ ] Redeploy both services

### ❌ "CORS" Error
- [ ] Verify Render `FRONTEND_URL` = exact Vercel URL
- [ ] Redeploy backend

### ❌ Payment not completing
- [ ] Check Snippe credentials are correct
- [ ] Verify webhook URL in Snippe dashboard
- [ ] Verify webhook secret matches
- [ ] Check Render logs for errors

### ❌ Build Failed
- [ ] Check error logs in dashboard
- [ ] Run `npm run build` locally to test
- [ ] Ensure `package.json` is correct

---

## 📞 URLs After Deployment

- **Frontend**: https://your-app.vercel.app
- **Backend API**: https://your-backend.onrender.com
- **Health Check**: https://your-backend.onrender.com/api/health

---

## ⏰ Timeline
- Pre-deployment setup: ~1 hour
- Backend deployment: ~5-10 min
- Frontend deployment: ~5-10 min
- Configuration: ~10 min
- Testing: ~5-10 min
- **Total: ~1.5 hours**

---

## 🎉 You're Live!
Once all tests pass, your production app is ready! 🚀

Share the Vercel URL with users to start taking orders!
