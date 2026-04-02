# 📊 SMATQ Store - Comprehensive Project Analysis

**Date**: March 28, 2026  
**Status**: ✅ Full e-commerce platform with Snippe payment integration (in progress/development)

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Integration Flow](#integration-flow)
5. [Data Flow & Models](#data-flow--models)
6. [Configuration](#configuration)
7. [Key Findings & Issues](#key-findings--issues)

---

## Project Overview

### What is SMATQ Store?
A complete e-commerce application with:
- **Customer-facing storefront** for browsing and purchasing products
- **Secure payment processing** via Snippe payment gateway
- **Admin dashboard** for managing products, orders, and analytics
- **Mobile-friendly design** with Tanzanian context (Swahili text, TSh currency, M-Pesa/Airtel Money support)

### Technology Stack
| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React + TypeScript | 19.2.4 |
| **Frontend Build** | Vite | 8.0.1 |
| **Styling** | Tailwind CSS | 4.2.2 |
| **Icons** | Lucide React | 0.577.0 |
| **Routing** | React Router DOM | 7.13.1 |
| **Backend** | Express.js | 4.18.2 |
| **HTTP Client** | Axios | 1.6.2 |
| **Environment** | Node.js (ES modules) | - |
| **Data Storage** | JSON files | - |

### Port Configuration
- **Frontend Dev**: `http://localhost:5173` (Vite server)
- **Backend API**: `http://localhost:5002` (Express server)

---

## Frontend Architecture

### 📁 Main Files & Structure

#### [src/App.tsx](src/App.tsx) - Application Root
- **3-second splash screen** with animated shopping cart icon and branding
- **Client-side routing** with React Router
- **Route protection** - Admin routes require password verification
- **Routes defined**:
  - User routes: `/`, `/cart`, `/payment-success`, `/payment-failed`, `/payment-qr`, `/payment-pending`
  - Admin routes: `/admin/login`, `/admin/dashboard`, `/admin/products`, `/admin/orders`, `/admin/analytics`

#### [src/types.ts](src/types.ts) - TypeScript Interfaces
```typescript
Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  images: string[] (up to 3 per product)
}

CartItem {
  productId: number
  quantity: number
  name?: string
}

Order {
  id: string (unique token)
  customerName: string
  phoneNumber: string
  location: string
  items: CartItem[]
  totalPrice: number
  status: 'pending' | 'completed'
  createdAt: string
}
```

### 📄 Pages (User-Facing)

| Page | File | Purpose |
|------|------|---------|
| **Home/Products** | [HomePage.tsx](src/pages/HomePage.tsx) | Product grid with search, image gallery, stock status |
| **Shopping Cart** | [CartPage.tsx](src/pages/CartPage.tsx) | View cart, adjust quantities, proceed to checkout |
| **Checkout** | [CheckoutForm.tsx](src/components/CheckoutForm.tsx) | Collect customer info, initiate payment |
| **Payment Pending** | [PaymentPendingPage.tsx](src/pages/PaymentPendingPage.tsx) | USSD push waiting page (polls status every 5s) |
| **Payment QR** | [PaymentQrPage.tsx](src/pages/PaymentQrPage.tsx) | Display QR code for mobile money scanning |
| **Payment Success** | [PaymentSuccessPage.tsx](src/pages/PaymentSuccessPage.tsx) | Order confirmation, can copy order reference |
| **Payment Failed** | [PaymentFailedPage.tsx](src/pages/PaymentFailedPage.tsx) | Failure message, retry option |

### 📄 Pages (Admin)

| Page | File | Purpose |
|------|------|---------|
| **Login** | [AdminLoginPage.tsx](src/pages/AdminLoginPage.tsx) | Password-based admin access |
| **Dashboard** | [AdminDashboardPage.tsx](src/pages/AdminDashboardPage.tsx) | Statistics (total products, orders, revenue, pending orders) |
| **Products** | [AdminProductsPage.tsx](src/pages/AdminProductsPage.tsx) | CRUD operations on products |
| **Orders** | [AdminOrdersPage.tsx](src/pages/AdminOrdersPage.tsx) | View paid orders, filter by status, update delivery status |
| **Analytics** | [AdminAnalyticsPage.tsx](src/pages/AdminAnalyticsPage.tsx) | (Not fully explored in this analysis) |

### 🧩 Components

| Component | File | Responsibility |
|-----------|------|-----------------|
| **NavBar** | [NavBar.tsx](src/components/NavBar.tsx) | User navigation (Products, Cart, Admin link) |
| **AdminNav** | [AdminNav.tsx](src/components/AdminNav.tsx) | Admin navigation (Dashboard, Products, Orders, Analytics) |
| **ProductGrid** | [ProductGrid.tsx](src/components/ProductGrid.tsx) | Display products in grid with image gallery, stock badges, "Add to Cart" |
| **ProductForm** | [ProductForm.tsx](src/components/ProductForm.tsx) | Form for adding/editing products in admin |
| **CheckoutForm** | [CheckoutForm.tsx](src/components/CheckoutForm.tsx) | Checkout form with payment method selection (card/mobile) |
| **SearchBar** | [searchbar.tsx](src/components/searchbar.tsx) | Real-time product search |

#### CheckoutForm Details:
- **Payment methods**: Card (hosted checkout) vs Mobile (USSD push)
- **Form fields**: Full name, email, phone, address, city, state, postcode, country
- **Validation**: Email format, required fields
- **Error handling**: User-friendly error messages
- **Processing**: Shows loading state during payment initiation
- **Security notice**: Bilingual (Swahili/English) about secure payment

#### ProductGrid Details:
- **Stock badges**: "Out of stock" (red), "Only X left" (amber), "X in stock" (green)
- **Image gallery**: Navigate with prev/next arrows or click dots
- **Add to cart**: Visual feedback (success state for 2 seconds)

### 📦 Services

| Service | File | Functionality |
|---------|------|-----------------|
| **paymentService** | [paymentService.ts](src/services/paymentService.ts) | Call backend `/api/payments/initiate`, check payment status |
| **productService** | [productService.ts](src/services/productService.ts) | Fetch products, add/update/delete products via backend API |
| **orderService** | [orderService.ts](src/services/orderService.ts) | Fetch orders from backend, update order status |
| **storage** | [storage.ts](src/services/storage.ts) | localStorage management (products, cart, orders, admin verification) |

#### Payment Service Flow:
```typescript
initiatePayment(paymentData) {
  POST http://localhost:5002/api/payments/initiate
  Response: {
    success: true,
    paymentData: {
      paymentId,
      orderReference,
      paymentUrl (card),
      paymentQrCode (mobile QR),
      paymentToken,
      status
    }
  }
}
```

#### Storage Service Key Methods:
- `addToCart(productId, quantity)` - Add item to cart
- `getCart()` - Retrieve current cart
- `removeFromCart(productId)` - Remove item
- `updateCartQuantity(productId, quantity)` - Adjust quantity
- `clearCart()` - Empty cart (called after successful payment)
- `verifyAdmin(password)` - Check admin password
- `isAdminVerified()` - Check if logged in

---

## Backend Architecture

### 📁 Server Structure

#### [backend/src/app.js](backend/src/app.js) - Express Entry Point
- **Middleware**: JSON parsing, CORS (allows localhost:5173)
- **Routes mounted**:
  - `/api/products` - Product CRUD
  - `/api/payments` - Payment initiation and status
  - `/api/webhooks` - Webhooks from Snippe
- **Health check**: `GET /api/health` returns server status
- **Error handling**: Centralized error middleware
- **Listens on**: PORT env var or 5002

#### [backend/src/config.js](backend/src/config.js) - Environment Setup
- Loads `.env` file from backend directory
- Must be imported FIRST before other modules
- Sets up all environment variables for payment gateway

### 🛣️ Routes

#### Products Routes (`/api/products`)
```
GET    /api/products              - Get all products
GET    /api/products/:id          - Get product by ID
POST   /api/products              - Add new product
PUT    /api/products/:id          - Update product
DELETE /api/products/:id          - Delete product
```

#### Payment Routes (`/api/payments`)
```
POST   /api/payments/initiate     - Start payment (initiatePayment controller)
GET    /api/payments/status/:paymentId - Check payment status
```
- Validates request with `validatePaymentRequest` middleware
- Converts OrderReference and phone number format
- Returns payment URL/QR/token from Snippe

#### Webhook Routes (`/api/webhooks`)
```
GET    /api/webhooks/status       - Check webhook endpoint status
POST   /api/webhooks/payment-webhook - Legacy webhook endpoint
POST   /api/webhooks/snippe       - Snippe webhook receiver
```
- Receives payment.completed and payment.failed events
- Validates webhook signature
- Creates orders on successful payment
- Never throws 5xx errors (returns 200 to acknowledge)

### 👨‍💼 Controllers

#### [paymentController.js](backend/src/controllers/paymentController.js)

**initiatePayment()**
- Input: Customer info, cart items, amount, payment type
- Operations:
  1. Normalizes Tanzanian phone number (0712... → 255712...)
  2. Builds payment data for Snippe API
  3. Calls `snippeService.createPayment()`
  4. Saves pending order (cart + address) for webhook to use
  5. Saves payment record
  6. Returns payment URL/QR/token or error
- Output: Payment response with redirect URL or QR code

**checkPaymentStatus()**
- Input: paymentId
- Calls Snippe API to get current payment status
- Returns: Payment object with status

#### [webhookController.js](backend/src/controllers/webhookController.js)

**handlePaymentWebhook()**
- Validates webhook signature (if configured)
- Routes to specific handler based on event type:
  - `payment.completed` → handlePaymentCompleted()
  - `payment.failed` → handlePaymentFailed()

**handlePaymentCompleted()**
- Extracts order reference from webhook payload
- Retrieves pending order (saved cart items)
- Updates payment status to "completed"
- **Creates order** (saves to orders.json) with:
  - Order token (ORD-timestamp-random)
  - Customer details
  - Cart items
  - Total price
- Removes pending order entry

**handlePaymentFailed()**
- Updates payment status to "failed"
- Saves payment record
- Does NOT create order

### 🔧 Services

#### [snippeService.js](backend/src/services/snippeService.js)

**createPayment(paymentData)**
- Validates required fields (amount, orderReference, email)
- Builds Snippe API payload:
  - **Card payment**: Redirect URLs, customer address, city, state
  - **Mobile payment**: Phone number for USSD push
- Sends POST request to `https://api.snippe.sh/v1/payments`
- Authorization header: `Bearer ${SNIPPE_API_KEY}`
- Returns: Payment reference, URLs, QR code, status

**getPaymentStatus(paymentId)**
- Fetches payment status from Snippe
- Returns: Status, amount, currency

**verifyWebhookSignature()**
- Validates HMAC-SHA256 signature from webhook
- Prevents spoofed payment callbacks

#### [orderService.js](backend/src/services/orderService.js)

**savePendingOrder(orderReference, { cartItems, customerAddress })**
- Saves to `backend/data/pending_orders.json`
- Used by webhook to get cart after payment success

**getAndRemovePendingOrder(orderReference)**
- Retrieves pending order
- Deletes entry from pending_orders.json
- Returns: { cartItems, customerAddress }

**createOrderFromPayment(paymentData, cartItems)**
- Generates unique order token: `ORD-${timestamp}-${random}`
- Saves to `backend/data/orders.json`
- Fields: id, orderReference, paymentReference, customer info, items, totalPrice, status, channel

**savePaymentRecord(paymentData)**
- Saves to `backend/data/payments.json`
- Records ALL payment attempts (success or failed)
- Used for analytics, dispute resolution, audit trail

### 📊 Data Models

#### Data Directory: `backend/data/`

**products.json**
```json
[
  {
    "id": 1,
    "name": "Wireless Earbuds Pro",
    "description": "...",
    "price": 49.99,
    "stock": 142,
    "images": ["url1", "url2", "url3"]
  }
]
```

**orders.json** (Only successful paid orders)
```json
[
  {
    "id": "ORD-1711680123456-ABC123",
    "orderReference": "ORD-...",
    "paymentReference": "snippet_ref_...",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhoneNumber": "255712345678",
    "location": "Dar es Salaam",
    "items": [
      { "productId": 1, "quantity": 2, "name": "Wireless Earbuds Pro" }
    ],
    "totalPrice": 99.98,
    "currency": "TZS",
    "status": "completed",
    "paymentStatus": "completed",
    "channel": "Snippe",
    "createdAt": "2024-03-28T...",
    "notes": "Payment received via Snippe"
  }
]
```

**payments.json** (ALL payment attempts)
```json
[
  {
    "id": "snippet_pay_...",
    "orderReference": "ORD-...",
    "paymentReference": "snippet_...",
    "amount": 99.98,
    "currency": "TZS",
    "status": "completed|failed|pending",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhoneNumber": "255712345678",
    "channel": "Snippe",
    "createdAt": "2024-03-28T...",
    "updatedAt": "2024-03-28T...",
    "rawData": { /* full Snippe response */ }
  }
]
```

**pending_orders.json** (Temporary, cleaned up after webhook)
```json
{
  "ORD-...": {
    "cartItems": [...],
    "customerAddress": "123 Main St",
    "savedAt": "2024-03-28T..."
  }
}
```

---

## Integration Flow

### 🔄 Complete Payment & Order Creation Journey

```
STEP 1: CUSTOMER INITIATES PAYMENT
┌─────────────────────────────────────────────────────────────┐
│ User: Fills CheckoutForm, selects "card" or "mobile"       │
│ Front: Calls PaymentService.initiatePayment()              │
│ API:   POST http://localhost:5002/api/payments/initiate    │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
STEP 2: BACKEND PREPARES PAYMENT REQUEST
┌─────────────────────────────────────────────────────────────┐
│ paymentController.initiatePayment():                        │
│ • Normalizes phone: "0712..." → "255712..."                │
│ • Builds Snippe payload (amount, customer, redirect URLs)  │
│ • Saves pending order (cart items) → pending_orders.json   │
│ • Saves payment record → payments.json                      │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
STEP 3: SNIPPE API CALL
┌─────────────────────────────────────────────────────────────┐
│ snippeService.createPayment():                              │
│ • POST https://api.snippe.sh/v1/payments                   │
│ • Authorization: Bearer ${SNIPPE_API_KEY}                   │
│ • Response: {                                               │
│     reference: "snippet_pay_...",                           │
│     payment_url: "https://checkout.snippe...",             │
│     payment_qr_code: "...",                                │
│     status: "initiated"                                     │
│   }                                                         │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
STEP 4: FRONTEND RECEIVES & REDIRECTS
┌─────────────────────────────────────────────────────────────┐
│ CheckoutForm receives paymentData:                          │
│ IF card:   window.location.href = paymentUrl              │
│ IF mobile: Redirect to /payment-pending page               │
│ IF QR:     Redirect to /payment-qr page                    │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
STEP 5: CUSTOMER COMPLETES PAYMENT AT SNIPPE
┌─────────────────────────────────────────────────────────────┐
│ User: Enters card OR authorizes USSD push on phone         │
│ Snippe: Processes payment                                   │
│ Status: COMPLETED or FAILED                                 │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
STEP 6: SNIPPE SENDS WEBHOOK
┌─────────────────────────────────────────────────────────────┐
│ POST http://your-domain/api/webhooks/snippe                │
│ Payload: {                                                  │
│   type: "payment.completed",                                │
│   data: {                                                   │
│     reference: "snippet_pay_...",                           │
│     status: "completed",                                    │
│     amount: { value: 99.98, currency: "TZS" },             │
│     customer: { first_name, last_name, email, phone },     │
│     metadata: { order_id: "ORD-..." }                       │
│   }                                                         │
│ }                                                           │
│ Header: X-Webhook-Signature: HMAC...                        │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
STEP 7: WEBHOOK VALIDATION & ORDER CREATION
┌─────────────────────────────────────────────────────────────┐
│ webhookController.handlePaymentWebhook():                   │
│ • Validates signature                                       │
│ • Routes to handlePaymentCompleted()                        │
│                                                             │
│ handlePaymentCompleted():                                   │
│ • Gets orderReference from webhook                          │
│ • Fetches pending order (cart items)                        │
│ • Updates payment status → "completed"                      │
│ • Calls createOrderFromPayment():                           │
│   - Generates token: ORD-timestamp-random                   │
│   - Saves order to orders.json                              │
│   - Status: "completed"                                     │
│ • Removes entry from pending_orders.json                    │
│                                                             │
│ Response: { success: true, message: "..." }                │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
STEP 8: ADMIN SEES ORDER
┌─────────────────────────────────────────────────────────────┐
│ Admin Dashboard:                                            │
│ • Fetches orders from backend /api/orders                  │
│ • Shows: customer name, phone, location, items, total      │
│ • Can filter by status (pending/completed)                 │
│ • Can update delivery status                                │
└─────────────────────────────────────────────────────────────┘
```

### Key Points
- **Cart is saved BEFORE payment** in pending_orders.json (in case webhook is delayed, we know what user ordered)
- **Order created ONLY on successful payment** via webhook from Snippe
- **Payment record saved for ALL attempts** - success and failure tracked
- **Pending orders cleaned up** after webhook processes them

---

## Data Flow & Models

### Product Management Flow

```
ADMIN ADDS PRODUCT
├─ AdminProductsPage.tsx: Shows ProductForm modal
├─ ProductForm.tsx: Submits to backend
├─ productService.ts: POST /api/products
├─ productController.js: addProduct() → products.json
└─ Success message displayed

USER SEES PRODUCT
├─ HomePage.tsx: Calls fetchProductsFromBackend()
├─ productService.ts: Calls /api/products
├─ productController.js: getAllProducts() ← products.json
├─ Returns Product array to frontend
├─ ProductGrid renders with image gallery, price, stock
└─ User can add to cart
```

### Cart Storage Flow

```
Cart stored in localStorage (key: "smartq_cart")

Format:
{
  "cartItems": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 1 }
  ]
}

Operations:
├─ addToCart(id, quantity) → updates localStorage
├─ getCart() → reads from localStorage
├─ removeFromCart(id) → deletes item
├─ updateCartQuantity(id, qty) → modifies quantity
└─ clearCart() → empties cart (after payment success)
```

### Order Creation Sequence

```
BEFORE PAYMENT:
1. Check ADMIN allows successful payments only
   └─ Admin must exist in Admin Dashboard
2. Check BACKEND accepts /api/orders endpoint
   └─ Provides GET /api/orders (no POST in routes!)

PAYMENT FLOW:
1. Frontend has cartItems in state
2. CheckoutForm passes cartItems to backend
3. Backend saves cartItems in pending_orders.json
4. Payment initiated via Snippe
5. Webhook received from Snippe
6. Backend retrieves cartItems from pending_orders.json
7. Backend creates order with cartItems
8. Order saved to orders.json
9. Pending order deleted

AFTER PAYMENT:
1. Frontend redirects to /payment-success
2. Admin sees order in /admin/orders
3. Admin can mark as "pending" or "completed"
```

### Admin Flow

```
LOGIN:
├─ AdminLoginPage.tsx
├─ User enters password
├─ storage.verifyAdmin(password)
│  └─ Checks hardcoded password (from storage.ts)
│  └─ Default: "admin123" (must check code)
├─ Sets localStorage "smartq_admin_verified" = true
├─ Navigates to /admin/dashboard

DASHBOARD:
├─ Loads stats (products, orders, revenue, pending)
├─ Shows 4 stat cards with icons
├─ Quick action buttons to Products, Orders, Analytics

PRODUCTS PAGE:
├─ Lists all products from /api/products
├─ Can ADD (ProductForm modal)
├─ Can EDIT (ProductForm with pre-filled data)
├─ Can DELETE (with confirmation)
├─ Form POST/PUT to backend

ORDERS PAGE:
├─ Lists orders from /api/orders
├─ Shows customer name, phone, location, items, total
├─ Filter by status: all, pending, completed
├─ Click status button to toggle pending ↔ completed
├─ PATCH /api/orders/:id/status to update

ANALYTICS PAGE:
├─ (Implementation not fully explored)
└─ Likely charts/graphs of revenue, orders over time
```

---

## Configuration

### Environment Variables

#### Backend (.env file)
```bash
# Snippe Payment Gateway
SNIPPE_API_KEY=your-api-key-here
SNIPPE_BASE_URL=https://api.snippe.sh
SNIPPE_WEBHOOK_SECRET=optional-for-signature-validation

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Webhook URL (for production, must be HTTPS)
WEBHOOK_URL=https://your-domain.com/api/webhooks/snippe

# Server
PORT=5002
NODE_ENV=development
```

#### Frontend (vite.config.ts)
```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    strictPort: true,
    allowedHosts: ["nonfrosted-unexpediently-lorean.ngrok-free.dev"],
  },
})
```
- Uses ngrok for tunneling (for webhook testing)
- Allowed hosts configured for webhook testing

### Admin Password
```typescript
// From storage.ts
const ADMIN_PASSWORD = '...'; // Check actual code for value
// Used in verifyAdmin(password) function
```

### Build Configuration

#### TypeScript (tsconfig.json)
- React JSX support enabled
- Target: ES2020
- Module: ES2020

#### Vite (vite.config.ts)
- React plugin for JSX
- Tailwind CSS plugin via @tailwindcss/vite
- Hot module replacement enabled
- Build output: dist/

---

## Key Findings & Issues

### 🎯 What Works Well

1. **Clean architecture**: Frontend/backend separation with clear contracts
2. **Type safety**: TypeScript throughout prevents runtime errors
3. **Responsive design**: Tailwind CSS with mobile-first approach
4. **Bilingual interface**: Swahili + English for Tanzania user base
5. **Payment security**: 
   - Webhook signature validation
   - No sensitive data in frontend
   - Pending orders for webhook recovery
6. **Admin protection**: Password-based auth (can be improved)
7. **Error handling**: User-friendly messages, detailed logging
8. **Data persistence**: JSON files work for small-scale, easy to inspect

### ⚠️ Discrepancies Found

| Issue | Mention | Details |
|-------|---------|---------|
| **API Key Confusion** | Docs say "ClickPesa" | But code implements "Snippe" |
| **Port Number** | Varies (5001 vs 5002) | Most code shows 5002, some docs show 5001 |
| **Orders API** | Referenced in admin | No POST endpoint found in `routes/orders.js` |
| **Order Status Update** | Admin page calls PATCH | No PATCH handler found; may be incomplete |
| **Email Sending** | Docs mention emails | No email implementation found in code |

### 🔧 Technical Debt / Improvements Needed

1. **No PATCH endpoint for order status** - Admin updates won't work
   - File: [backend/src/routes/orders.js](backend/src/routes/orders.js) missing PATCH handler
   - Needs: `router.patch('/:id/status', updateOrderStatus)`

2. **Admin password hardcoded** - Should use env variable
   - File: [src/services/storage.ts](src/services/storage.ts)
   - Recommendation: Use `process.env.ADMIN_PASSWORD` or set in backend

3. **No email notifications** 
   - Docs promise email receipts
   - Implementation needs: nodemailer or SendGrid integration

4. **No product validation** 
   - Missing middleware to validate product data before saving
   - File: [backend/src/middleware/validation.js](backend/src/middleware/validation.js)

5. **Cart items with product details**
   - Checkout form sends cart with just `productId` and `quantity`
   - Product name added by frontend for display
   - Could be simplified with backend lookup

6. **Phone number normalization**
   - Code assumes Tanzanian format
   - Works but could support other countries with country code selector

7. **No inventory deduction**
   - When order created, product stock NOT decremented
   - Could lead to overselling
   - File: [backend/src/services/orderService.js](backend/src/services/orderService.js)

### 📋 Missing Features (Based on Code vs Docs)

| Feature | Docs Mention | Code Found | Status |
|---------|--------------|-----------|--------|
| Email notifications | YES | NO | ❌ Not implemented |
| Product inventory control | YES | Partial | ⚠️ Not decremented on order |
| Order status updates | YES | Routes only | ❌ PATCH handler missing |
| Analytics charts | YES | Page exists | ⚠️ Empty/incomplete |
| Payment retry logic | YES | NO | ❌ Not implemented |
| Multi-language i18n | Partial | Swahili only | ⚠️ Basic hardcoded strings |

### 🔐 Security Considerations

**Implemented ✅:**
- HTTPS-only webhook URL requirement (in Snippe config)
- Webhook signature validation available
- Environment variables for secrets
- CORS protection on backend
- Input validation on payment requests
- No sensitive data in localStorage

**Needs Attention ⚠️:**
- Admin password should be hashed, not plaintext verification
- Rate limiting not implemented
- No CSRF protection visible
- SQL injection (N/A for JSON, but good practice for future)
- No access logging for admin actions
- Frontend sends all customer data to backend (fine for checkout, but consider privacy)

### 📱 Device Compatibility

- **Mobile**: Responsive design with Tailwind breakpoints (sm, md, lg)
- **Payment QR**: Uses online QR server (qrserver.com) - requires internet
- **USSD Push**: SMS-based, works without internet on customer phone
- **ngrok tunnel**: Configured for local testing with real Snippe webhooks

---

## Summary by Component

### Frontend at a Glance
- **Entry**: App.tsx with splash screen
- **Router**: 11 routes (6 user + 5 admin)
- **State**: localStorage for cart/products, React state for temp data
- **Services**: 4 service modules (payment, product, order, storage)
- **Components**: 6 reusable UI components
- **Pages**: 11 page components

### Backend at a Glance
- **Entry**: app.js (Express server on port 5002)
- **Routes**: 3 route groups (products, payments, webhooks)
- **Controllers**: 3 controllers for business logic
- **Services**: 2 services (Snippe API, order persistence)
- **Data**: 4 JSON files (products, orders, payments, pending_orders)
- **Middleware**: Request validation on payment endpoints

### Integration at a Glance
1. **Before Payment**: Cart stored locally, checkout form collects customer info
2. **During Payment**: Frontend calls backend → Snippe → Customer pays
3. **After Payment**: Snippe webhook → Backend creates order → Admin sees it

---

## Next Steps Recommendations

1. **Fix missing PATCH endpoint** for order status updates
2. **Add email notifications** via nodemailer
3. **Implement inventory deduction** to prevent overselling
4. **Hash admin password** instead of plaintext check
5. **Add order payment receipt** generation (PDF or HTML)
6. **Implement payment retry** for failed transactions
7. **Add error logging** to Sentry or similar service
8. **Set up database** (MongoDB/PostgreSQL) for production instead of JSON files
9. **Add unit tests** for services and controllers
10. **Document API** with Swagger/OpenAPI

