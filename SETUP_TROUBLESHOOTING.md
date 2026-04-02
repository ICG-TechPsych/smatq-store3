# SMATQ Store - Setup & Troubleshooting Guide

## ⚠️ Cannot Connect to Backend Error

If you see: **"Cannot connect to backend at http://localhost:5002"**

### Step 1: Start the Backend Server

Open a **NEW Terminal** and run:

```bash
cd backend
npm install  # Only needed if dependencies not installed
npm start
```

You should see:
```
✅ Backend server running on http://localhost:5002
🔐 Snippe Integration Ready
```

### Step 2: Verify Backend is Running

Test the health check in your browser:
- Go to: http://localhost:5002/api/health
- You should see: `{"status":"Server is running","timestamp":"..."}`

### Step 3: Start the Frontend

In a DIFFERENT terminal:

```bash
cd product-cart
npm run dev
```

You should see:
```
  VITE v... ready in XXX ms
  ➜  Local:   http://localhost:5173
```

### Step 4: Check API Configuration

Make sure `.env` file exists in `product-cart/` with:

```env
VITE_API_URL=http://localhost:5002
```

## Full Setup Order

1. **Terminal 1 - Start Backend:**
   ```bash
   cd product-cart/backend
   npm start
   ```

2. **Terminal 2 - Start Frontend:**
   ```bash
   cd product-cart
   npm run dev
   ```

3. **Open Browser:**
   - Go to http://localhost:5173
   - Login to Admin Panel
   - Try adding a product

## Common Issues & Solutions

### "Failed to fetch" Error
**Cause:** Backend is not running  
**Fix:** Make sure backend started successfully (step 1 above)

### "Cannot connect to backend at http://localhost:5002"
**Cause:** Frontend can't reach backend  
**Fix:** 
- Check backend is running on port 5002
- Check .env file has correct URL
- Reload the page (Ctrl+Shift+R)

### Products don't appear after adding
**Cause:** Backend didn't save properly  
**Fix:** 
- Check browser console for error messages
- Check that you see the green "✓ Product saved successfully!" message
- Try adding again

### CORS Errors
**Cause:** Frontend and backend origins don't match  
**Fix:** Already handled in code, but make sure:
- Backend is on port 5002
- Frontend is on port 5173
- Both are running on localhost

## Database Location

Products are stored in: `backend/data/products.json`

You can manually check/edit this file if needed.

## Development Workflow

```
┌─────────────┐         ┌──────────────┐
│  Frontend   │◄─────►  │  Backend     │
│ :5173       │ HTTP    │  :5002       │
│ (Admin UI)  │         │  (API)       │
└─────────────┘         └──────────────┘
                             │
                             ▼
                        ┌──────────────┐
                        │ products.json│
                        │ (Data Store) │
                        └──────────────┘
```

## Console Debugging

Open browser DevTools (F12) and look for:

```
[ProductService] API Base URL: http://localhost:5002
[ProductService] Posting to http://localhost:5002/api/products
[ProductService] Response status: 201
```

All these should show for successful product addition.

## For NGROK Deployment

To use NGROK for public access:

1. Install NGROK from https://ngrok.com/download

2. Start NGROK tunnel:
   ```bash
   ngrok http 5002
   ```

3. Get the HTTPS URL (e.g., https://abc-123-def-456.ngrok.io)

4. Update .env file:
   ```env
   VITE_API_URL=https://abc-123-def-456.ngrok.io
   ```

5. Update backend .env:
   ```env
   FRONTEND_URL=https://your-frontend-url.ngrok.io
   ```

## Need More Help?

Check these files for configuration:
- Frontend: `product-cart/.env`
- Backend: `product-cart/backend/.env`
- Backend App: `product-cart/backend/src/app.js`
- Product Service: `product-cart/src/services/productService.ts`
