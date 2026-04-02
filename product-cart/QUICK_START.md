# 🚀 ClickPesa Integration - Quick Start Card

## 📋 Quick Reference Card

Print this page or save for quick reference!

---

## 🔑 Get Credentials (Do This First!)

```
1. Go to https://dashboard.clickpesa.com
2. Login
3. Settings → Developers → Create Application
4. Get these 3 things:
   • Client ID
   • API Key
   • Checksum Key
5. Save somewhere safe!
```

---

## ⚙️ Setup Commands

### Option A: Automatic (Windows Only)
```bash
# Run setup script
SETUP.bat
```

### Option B: Manual Setup

```bash
# Step 1: Install backend dependencies
cd backend
npm install
cd ..

# Step 2: Install frontend dependencies
npm install

# Step 3: Configure backend
# Create/edit backend/.env with:
# CLICKPESA_CLIENT_ID=your_id
# CLICKPESA_API_KEY=your_key
# CLICKPESA_CHECKSUM_KEY=your_checksum
```

---

## ▶️ Start Servers

### Terminal 1 - Frontend
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

### Terminal 2 - Backend
```bash
cd backend
npm run dev
# Backend runs on http://localhost:5001
```

---

## ✅ Verify Everything Works

```bash
# In a browser or terminal, check:
http://localhost:5173          ← Frontend
http://localhost:5001/api/health   ← Backend health
```

Both should respond without errors!

---

## 🧪 Test Payment Flow

```
1. Go to http://localhost:5173
2. Add products to cart
3. Click "Pay Now"
4. Fill customer details
5. Click "Pay Now" button
6. Complete payment on ClickPesa
7. Check backend logs for "🎉 Order created: ORD-..."
8. Admin → Orders will show the order!
```

---

## 📁 Important Files

```
backend/.env              ← Your credentials here
backend/data/orders.json  ← Successful orders
backend/data/payments.json ← All payments
```

---

## 🔍 Debugging

```bash
# Check if port in use
netstat -ano | findstr :5001

# Kill process on Windows
taskkill /PID <pid> /F

# Watch backend logs
# Terminal showing "npm run dev" output
```

---

## 📚 Documentation

```
IMPLEMENTATION_COMPLETE.md     ← Start here!
CLICKPESA_SETUP_GUIDE.md       ← Full guide
INTEGRATION_SUMMARY.md         ← Technical details
backend/README.md              ← Backend docs
backend/.env.example           ← Config template
```

---

## ⚠️ Important

- ❌ Never commit `.env` file
- ❌ Never share API Key
- ⚠️ Use HTTPS in production
- 🔒 Keep credentials secret

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 5001 in use | `taskkill /PID <pid> /F` |
| npm not found | Install Node.js |
| Cannot find module | `cd backend && npm install` |
| Payment fails | Check `.env` credentials |
| Orders not appearing | Check backend logs |

---

## ✨ What You'll See

### Success
```
Frontend: http://localhost:5173 working
Backend: http://localhost:5001/api/health OK
Payment: Customer redirected to ClickPesa
Webhook: "🎉 Order created: ORD-..."  
Admin: Order appears in dashboard
```

### Common Errors
```
ERROR: Port 5001 already in use
ERROR: Cannot find module 'express'
ERROR: CLICKPESA_API_KEY not defined
```

All fixable following guide above!

---

## 📞 Questions?

1. Check the guide: `IMPLEMENTATION_COMPLETE.md`
2. Review backend logs (Terminal 2)
3. Check `.env` file has credentials
4. Read `CLICKPESA_SETUP_GUIDE.md`

---

## 🎯 Success Checklist

- [ ] Credentials from ClickPesa
- [ ] backend/.env configured
- [ ] npm install completed
- [ ] Both servers running
- [ ] Frontend loads at 5173
- [ ] Backend responds at 5001
- [ ] Add item to cart works
- [ ] Pay Now button clickable
- [ ] Checkout form opens
- [ ] Payment completes
- [ ] Order appears in admin

✅ All checked? You're done!

---

**Print this card and keep it handy!**

*Last updated: 2024-03-21*
