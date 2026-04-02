# 🚀 GITHUB + DEPLOYMENT SETUP - Step-by-Step

## ✅ What's Done
- Git repository initialized locally
- All files committed and ready to push
- `.gitignore` configured (protects `.env` and `node_modules`)
- Backend and frontend configured for deployment

---

## 📍 STEP 1: Create GitHub Repository (2 min)

### On GitHub.com:
1. Go to https://github.com/new
2. Fill in:
   - **Repository name**: `smatq-store` (or your choice)
   - **Description**: "E-commerce store with Vercel + Render deployment"
   - **Visibility**: Public (recommended for easier deployment integration)
3. **DO NOT** initialize with README, .gitignore, or license (we have them)
4. Click **Create repository**

### Copy the URL:
You'll see a page with commands. Copy the HTTPS URL (looks like):
```
https://github.com/YOUR_USERNAME/smatq-store.git
```

---

## 📍 STEP 2: Push to GitHub (3 min)

### In your terminal, run:
```bash
cd C:\Users\GASPER\Desktop\SMATQ_STORE
git remote add origin https://github.com/YOUR_USERNAME/smatq-store.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### You may be asked for:
- **Username**: Your GitHub username
- **Password**: Your GitHub personal access token (PAT)
  - If you don't have one: https://github.com/settings/tokens
  - Create new token → check `repo` checkbox → copy & paste as password

### ✅ Done!
Your code is now on GitHub. You should see all files at:
```
https://github.com/YOUR_USERNAME/smatq-store
```

---

## 📍 STEP 3: Deploy Backend to Render (10 min)

### 3.1 Go to Render Dashboard:
1. https://dashboard.render.com
2. Click **New +** → **Web Service**

### 3.2 Connect GitHub:
1. Click **Build and deploy from a Git repository**
2. Click **Connect GitHub** (if not already connected)
3. Authorize Render to access GitHub
4. Search for `smatq-store` repo and click **Connect**

### 3.3 Configure Service:
Fill in these settings:

| Field | Value |
|-------|-------|
| **Name** | `smatq-store-backend` |
| **Runtime** | `Node` |
| **Root Directory** | `product-cart/backend` ← IMPORTANT |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free |

### 3.4 Add Environment Variables:
Click **Environment** and add these variables:

```
KEY                    VALUE
---                    -----
NODE_ENV               production
PORT                   5002
FRONTEND_URL           (leave blank for now, update after Vercel)
SNIPPE_API_KEY         [your key from ClickPesa]
SNIPPE_BASE_URL        https://api.snippe.sh
SNIPPE_WEBHOOK_SECRET  [your secret from ClickPesa]
WEBHOOK_URL            (leave blank for now)
```

### 3.5 Deploy:
Click **Create Web Service**

⏳ **Wait 2-5 minutes for deployment**

### ✅ When it turns green:
1. Copy your Render backend URL (looks like):
   ```
   https://smatq-store-backend.onrender.com
   ```
2. **Save this URL** - you need it for the next step

---

## 📍 STEP 4: Deploy Frontend to Vercel (10 min)

### 4.1 Go to Vercel Dashboard:
1. https://vercel.com/dashboard
2. Click **Add New...** → **Project**

### 4.2 Import Repository:
1. Click **Import Git Repository**
2. Paste your GitHub repo URL:
   ```
   https://github.com/YOUR_USERNAME/smatq-store
   ```
3. Click **Continue**

### 4.3 Configure Project:
On the "Configure Project" page:

| Field | Value |
|-------|-------|
| **Framework Preset** | React |
| **Root Directory** | `product-cart` ← IMPORTANT |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### 4.4 Add Environment Variables:
Before clicking Deploy, scroll down to **Environment Variables**

Add this variable:
```
KEY              VALUE
---              -----
VITE_API_URL     https://smatq-store-backend.onrender.com
```
(Use your Render URL from Step 3)

### 4.5 Deploy:
Click **Deploy**

⏳ **Wait 3-5 minutes for deployment**

### ✅ When it completes:
1. You'll see your Vercel URL (looks like):
   ```
   https://smatq-store.vercel.app
   ```
2. **Save this URL** - you need it for the next step
3. Click **Visit** to test your frontend loads

---

## 📍 STEP 5: Final Configuration (5 min)

### 5.1 Update Render Backend Environment Variables:
1. Go to https://dashboard.render.com
2. Click your `smatq-store-backend` service
3. Click **Environment** tab
4. Edit these variables:
   - `FRONTEND_URL` = your Vercel URL from Step 4
   - `WEBHOOK_URL` = `https://smatq-store-backend.onrender.com/api/webhooks/snippe`
5. Click **Save** (backend will redeploy automatically)

### 5.2 Configure Webhooks in Snippe Dashboard:
1. Log in to https://dashboard.clickpesa.com
2. Find **Webhook Settings** or **Developer Settings**
3. Add webhook URL:
   ```
   https://smatq-store-backend.onrender.com/api/webhooks/snippe
   ```
4. Set webhook secret (must match `SNIPPE_WEBHOOK_SECRET`)
5. **Save**

---

## ✅ STEP 6: Test Production (5 min)

### Test 1: Frontend Loads
```
https://your-app.vercel.app
```
- Should load without errors
- Products should display
- No red errors in console (F12)

### Test 2: Add to Cart
- Click "Add to Cart" on any product
- Verify items appear in cart

### Test 3: Checkout Form
- Click "Checkout"
- Form should display properly
- No "API connection" errors

### Test 4: Payment Initiation
- Fill checkout form with test data
- Click "Pay Now"
- Should redirect to Snippe or show QR code

---

## 🎉 Success Indicators

✅ **All systems operational:**
- [ ] Frontend loads at Vercel URL
- [ ] Products display from API
- [ ] Cart works
- [ ] Checkout form displays
- [ ] Payment system responds
- [ ] No console errors
- [ ] Render logs show requests being received

---

## 📞 Your Production URLs

After deployment:

| Service | URL |
|---------|-----|
| **Frontend** | https://smatq-store.vercel.app |
| **Backend API** | https://smatq-store-backend.onrender.com |
| **Health Check** | https://smatq-store-backend.onrender.com/api/health |
| **Admin Panel** | https://smatq-store.vercel.app/admin/login |

---

## 🔄 Updating Your App

After making changes:

```bash
# Make changes locally
# Test locally

# Commit and push to GitHub
git add .
git commit -m "Your change description"
git push origin main

# Both Vercel and Render auto-deploy on git push!
# ✅ No manual deployment needed
```

---

## 🆘 Troubleshooting

### ❌ Git push fails - "fatal: Could not read from remote repository"
**Fix**: 
```bash
git remote -v
# Should show: origin  https://github.com/YOUR_USERNAME/smatq-store.git
# If not:
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/smatq-store.git
```

### ❌ Render build fails
- Check Root Directory = `product-cart/backend`
- Check Build Command = `npm install`
- Check for errors in Render logs

### ❌ Vercel build fails
- Check Root Directory = `product-cart`
- Check VITE_API_URL is set correctly
- Check for errors in Vercel logs

### ❌ Frontend can't reach backend
- Verify VITE_API_URL = correct Render URL
- Verify Render FRONTEND_URL = correct Vercel URL
- Redeploy both services

---

## 📊 Full Timeline

| Step | Time | Status |
|------|------|--------|
| Create GitHub repo | 2 min | ⬜ TODO |
| Push to GitHub | 3 min | ⬜ TODO |
| Deploy backend (Render) | 10 min | ⬜ TODO |
| Deploy frontend (Vercel) | 10 min | ⬜ TODO |
| Configure webhooks | 5 min | ⬜ TODO |
| Test production | 5 min | ⬜ TODO |
| **TOTAL** | **~35 min** | |

---

## 🚀 You're Almost There!

Your code is ready to deploy. Follow the steps above and you'll have:
- Production frontend on Vercel
- Production backend on Render
- Real payments working via Snippe/ClickPesa
- Auto-deployment on every git push

**Ready?** Start with STEP 1! 🎯
