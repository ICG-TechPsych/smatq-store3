# 🏗️ SMATQ STORE - Comprehensive Technical Overview

**Project**: E-commerce Store with ClickPesa/Snippe Payment Integration  
**Technology Stack**: React + TypeScript (Frontend) | Node.js/Express (Backend)  
**Build System**: Vite | Package Manager: npm  
**Target Market**: Tanzania (Tanzanian Shilling - TZS, M-Pesa/Airtel Money support)

---

## 📋 Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Frontend Structure](#2-frontend-structure)
3. [Backend Structure](#3-backend-structure)
4. [Data Models](#4-data-models)
5. [Service Layer](#5-service-layer)
6. [Payment Integration](#6-payment-integration-clickpesasnippee)
7. [Admin Features](#7-admin-features)
8. [Key Features](#8-key-features)
9. [Configuration & Setup](#9-configuration--setup)
10. [Entry Points & User Flows](#10-entry-points--user-flows)

---

## 1. Architecture Overview

### High-Level System Design

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER (User Client)                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────┐      ┌──────────────────────┐ │
│  │  React + TypeScript  │      │  Admin Dashboard     │ │
│  │  (Vite. SPA)         │      │  (Protected Routes)  │ │
│  │                      │      │                      │ │
│  │ • HomePage (Browse)  │      │ • Login              │ │
│  │ • CartPage           │      │ • Dashboard          │ │
│  │ • Checkout           │      │ • Products Mgmt      │ │
│  │ • Payment Pages      │      │ • Orders Mgmt        │ │
│  │ • Order Status       │      │ • Analytics          │ │
│  └──────────────────────┘      └──────────────────────┘ │
│           ▲                              ▲               │
└───────────┼──────────────────────────────┼───────────────┘
            │HTTP/REST API                 │
            │(http://localhost:5002)       │
┌───────────▼──────────────────────────────▼───────────────┐
│                EXPRESS.JS BACKEND SERVER                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Routes (/api/*) → Controllers → Services → Data        │
│                                                          │
│  ┌──────────────────┐ ┌──────────────────────────────┐  │
│  │ API Endpoints    │ │    Business Logic            │  │
│  ├──────────────────┤ ├──────────────────────────────┤  │
│  │ GET /api/products│ │ productController.js         │  │
│  │ POST /api/cart   │ │ orderController.js           │  │
│  │ POST /api/payment│ │ paymentController.js         │  │
│  │ POST /api/webhok │ │ webhookController.js         │  │
│  │ PATCH /api/order │ │                              │  │
│  └──────────────────┘ │ Services:                    │  │
│                       │ • snippeService.js           │  │
│                       │ • orderService.js            │  │
│                       │ • productController.js       │  │
│                       └──────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Data Persistence (JSON Files)            │  │
│  │                                                   │  │
│  │ • /backend/data/products.json                   │  │
│  │ • /backend/data/orders.json                     │  │
│  │ • /backend/data/payments.json                   │  │
│  │ • /backend/data/pending_orders.json             │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
            ▲                          ▲
            │ HTTPS                    │ HTTPS
            │ (Redirect URLs)          │ (Webhook)
            │                          │
┌───────────▼──────────────────────────▼───────────────┐
│          SNIPPE PAYMENT GATEWAY API                  │
│     (Tanzanian Payment Aggregator)                   │
├──────────────────────────────────────────────────────┤
│                                                      │
│ ┌────────────────────────────────────────────────┐  │
│ │ Payment Methods Supported:                      │  │
│ │ • Visa/Mastercard (Card Payments)              │  │
│ │ • M-Pesa (Mobile Money)                         │  │
│ │ • Airtel Money (Mobile Money)                   │  │
│ │ • USSD Push (Mobile Phone Prompt)               │  │
│ │ • QR Code (Quick Response)                      │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
│ API Endpoints:                                      │
│ • POST /v1/payments (Create Payment)               │  │
│ • GET /v1/payments/{id} (Check Status)             │  │
│ • POST /webhooks (Payment Notifications)           │  │
└──────────────────────────────────────────────────────┘
```

### System Architecture Characteristics

- **Client-Server Model**: SPA (Single Page Application) communicates with REST API
- **Authentication**: Admin dashboard uses localStorage-based token verification
- **Payment Flow**: Direct integration with Snippe Payment Gateway via backend
- **Data Storage**: File-based JSON persistence (no database)
- **CORS Enabled**: Frontend-backend communication with proper CORS headers
- **Webhook Integration**: Async payment confirmation via Snippe webhooks
- **Environment-Based Config**: Sensitive credentials via .env files

---

## 2. Frontend Structure

### Technology Stack
- **Framework**: React 19.2.4
- **Language**: TypeScript 5.9.3
- **Build Tool**: Vite 8.0.1
- **Routing**: React Router DOM 7.13.1
- **Styling**: Tailwind CSS 4.2.2
- **Icons**: lucide-react 0.577.0

### Directory Structure

```
src/
├── App.tsx                          # Main app component with routing
├── main.tsx                         # React DOM entry point
├── types.ts                         # TypeScript interfaces/types
├── index.css                        # Global styles
├── App.css                          # App-specific styles
│
├── pages/                           # Page components
│   ├── HomePage.tsx                 # User: Product browsing
│   ├── CartPage.tsx                 # User: Shopping cart
│   ├── PaymentSuccessPage.tsx       # User: Success after card payment
│   ├── PaymentFailedPage.tsx        # User: Failed payment
│   ├── PaymentQrPage.tsx            # User: QR code display
│   ├── PaymentPendingPage.tsx       # User: USSD push pending
│   ├── AdminLoginPage.tsx           # Admin: Login form
│   ├── AdminDashboardPage.tsx       # Admin: Overview & stats
│   ├── AdminProductsPage.tsx        # Admin: Manage products
│   ├── AdminOrdersPage.tsx          # Admin: View orders
│   └── AdminAnalyticsPage.tsx       # Admin: Analytics & reports
│
├── components/                      # Reusable UI components
│   ├── NavBar.tsx                   # Top navigation (user site)
│   ├── AdminNav.tsx                 # Admin sidebar navigation
│   ├── ProductGrid.tsx              # Grid display of products
│   ├── ProductForm.tsx              # Form to add/edit products
│   ├── CheckoutForm.tsx             # Customer checkout & payment form
│   ├── ImageModal.tsx               # Light box for product images
│   └── searchbar.tsx                # Product search input
│
├── services/                        # API communication & utilities
│   ├── paymentService.ts            # Payment API calls to backend
│   ├── productService.ts            # Product CRUD API calls
│   ├── orderService.ts              # Order fetching & updating
│   └── storage.ts                   # localStorage & state management
│
└── assets/                          # Static assets
```

### Key Files & Their Purposes

#### [App.tsx](src/App.tsx)
- **Purpose**: Root component that sets up routing and application structure
- **Key Features**:
  - Splash screen with SMART Q branding (3-second load animation)
  - Route configuration for user and admin sections
  - Protected admin routes (redirects to login if not verified)
  - Page transitions and navigation management
- **Routes**:
  - User routes: `/`, `/cart`, `/payment-*` pages
  - Admin routes: `/admin/login`, `/admin/dashboard`, `/admin/products`, `/admin/orders`, `/admin/analytics`

#### [main.tsx](src/main.tsx)
- **Purpose**: Webpack entry point and React DOM initialization
- **Renders**: App component into `<div id="root">` element

#### [types.ts](src/types.ts)
- **Purpose**: TypeScript interface definitions for type safety
- **Key Types**:
  - `Product`: Item in inventory (id, name, price, stock, images[])
  - `CartItem`: Product + quantity
  - `Order`: Customer order with items and status
  - `User`: User context (for potential future expansion)

### Frontend Services

#### [paymentService.ts](src/services/paymentService.ts)
```typescript
// Methods:
- initiatePayment(paymentData) → Sends order to backend, gets redirect URL
- checkPaymentStatus(paymentId) → Polls payment status
```
- Communicates with `POST /api/payments/initiate`
- Handles both card and mobile money payment types

#### [productService.ts](src/services/productService.ts)
```typescript
// Methods:
- fetchProductsFromBackend() → GET /api/products
- fetchProductByIdFromBackend(id) → GET /api/products/:id
- addProductToBackend(productData) → POST /api/products
- updateProductOnBackend(id, productData) → PUT /api/products/:id
- deleteProductOnBackend(id) → DELETE /api/products/:id
```
- Admin functions for product management
- Error handling with helpful messages about backend connectivity

#### [orderService.ts](src/services/orderService.ts)
```typescript
// Methods:
- fetchOrdersFromBackend() → GET /api/orders
- updateOrderStatusOnBackend(orderId, status) → PATCH /api/orders/:id/status
```
- Admin-only functions to view and manage orders
- Shows only completed/paid orders in the admin dashboard

#### [storage.ts](src/services/storage.ts)
- **Purpose**: Local state management and localStorage persistence
- **Key Functions**:
  - Product CRUD operations (fallback if backend unavailable)
  - Cart management (add, remove, clear)
  - Order history tracking
  - Admin authentication (login/logout/verification)
- **Storage Keys**:
  - `smartq_products`: Product catalog
  - `smartq_cart`: Current shopping cart
  - `smartq_orders`: Order history
  - `smartq_admin_verified`: Admin session token

### Component Hierarchy

```
App
├── Pages:
│   └── HomePage
│       ├── NavBar
│       ├── SearchBar
│       └── ProductGrid
│           └── ProductCard (displays product images via ImageModal)
│
│   └── CartPage
│       ├── NavBar
│       └── CheckoutForm (collects customer info & initiates payment)
│
│   └── PaymentSuccessPage (shows success confirmation)
│   └── PaymentFailedPage (shows error details)
│   └── PaymentQrPage (displays QR code for payment)
│   └── PaymentPendingPage (waiting for USSD push)
│
│   └── AdminLoginPage (email + simple password)
│       │
│       └── AdminDashboardPage
│           ├── AdminNav (sidebar with navigation)
│           ├── Dashboard cards (stats)
│           │
│           ├── AdminProductsPage (Add/Edit/Delete products)
│           │   └── ProductForm
│           │
│           ├── AdminOrdersPage (View customer orders)
│           │
│           └── AdminAnalyticsPage (Revenue, charts, metrics)
```

---

## 3. Backend Structure

### Technology Stack
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 4.18.2
- **HTTP Client**: axios 1.6.2
- **Configuration**: dotenv 16.3.1
- **CORS**: cors 2.8.5
- **Cryptography**: Built-in crypto module (for webhook verification)

### Directory Structure

```
backend/
├── src/
│   ├── app.js                       # Express server entry point
│   ├── config.js                    # Environment variable loading
│   │
│   ├── routes/                      # API endpoint definitions
│   │   ├── products.js              # GET/POST/PUT/DELETE /api/products
│   │   ├── payments.js              # POST /api/payments/initiate
│   │   ├── webhooks.js              # POST /api/webhooks/payment-webhook
│   │   └── orders.js                # GET/PATCH /api/orders
│   │
│   ├── controllers/                 # Business logic handlers
│   │   ├── productController.js     # Product CRUD logic
│   │   ├── paymentController.js     # Payment initiation logic
│   │   ├── orderController.js       # Order retrieval & updates
│   │   └── webhookController.js     # Snippe webhook handling
│   │
│   ├── services/                    # External API & data services
│   │   ├── snippeService.js         # Snippe Payment API wrapper
│   │   └── orderService.js          # Order persistence (JSON file I/O)
│   │
│   └── middleware/
│       └── validation.js            # Request validation & sanitization
│
├── data/                            # JSON file storage
│   ├── products.json                # Inventory data
│   ├── orders.json                  # Successful orders (paid only)
│   ├── payments.json                # All payment attempts
│   └── pending_orders.json          # Cart data during payment flow
│
├── .env                             # SECRET: Credentials (DO NOT COMMIT)
├── .env.example                     # Template (commit this)
├── .gitignore                       # Exclude .env & node_modules
├── package.json                     # Dependencies
├── README.md                        # Backend setup guide
└── INTEGRATION_SUMMARY.md           # Payment integration overview
```

### Key Files & Their Purposes

#### [app.js](backend/src/app.js)
- **Purpose**: Express server setup and middleware configuration
- **Key Features**:
  - Port: 5002 (configurable via `PORT` env var)
  - Middleware stack:
    - `express.json()`: Parse JSON request bodies
    - `cors()`: Cross-Origin Resource Sharing (allows frontend requests)
  - Routes:
    - `/api/products`: Product CRUD
    - `/api/payments`: Payment initiation
    - `/api/webhooks`: Payment confirmation
  - Endpoints:
    - `GET /api/health`: Server status check
  - Error handling: Global error handler & 404 middleware

#### [config.js](backend/src/config.js)
- **Purpose**: Load environment variables before app initialization
- **Creates**: `__dirname` for ES modules (not available by default)
- **Loads**: `.env` file from `backend/` directory (parent of `src/`)

#### [paymentController.js](backend/src/controllers/paymentController.js)
```javascript
// Key Functions:
export const initiatePayment = async (req, res) => {
  // Accepts: amount, customerName, email, phone, cartItems, orderReference
  // Actions:
  // 1. Normalizes phone number for Tanzania
  // 2. Calls snippeService.createPayment()
  // 3. Saves pending order (cart) for webhook
  // 4. Records payment attempt
  // 5. Returns redirect URL (card) or pays (mobile/USSD/QR)
}
```
- **Phone Normalization**: Converts any format (0712..., +255712...) to international (255712...)
- **Payment Data**: Prepares structured payload for Snippe API

#### [webhookController.js](backend/src/controllers/webhookController.js)
```javascript
// Key Functions:
export const handlePaymentWebhook = async (req, res) => {
  // Receives: Payment status updates from Snippe
  // Validates: Webhook signature (optional, if secret configured)
  // Handles: type === 'payment.completed' → Creates order
  //          type === 'payment.failed' → Updates status
  // Creates: Order entry in orders.json on success
}
```
- **Signature Verification**: Validates webhook authenticity via HMAC
- **Payment Status Updates**: Transitions payment state
- **Order Auto-Creation**: Creates orders.json entry when payment succeeds

#### [orderController.js](backend/src/controllers/orderController.js)
```javascript
// Key Functions:
export const getAllOrders = async (req, res) => { ... }
export const getOrderById = async (req, res) => { ... }
export const createOrder = async (req, res) => { ... }
export const updateOrderStatus = async (req, res) => { ... }
export const deleteOrder = async (req, res) => { ... }
```

#### [productController.js](backend/src/controllers/productController.js)
```javascript
// Key Functions:
export const getAllProducts = async (req, res) => { ... }
export const getProductById = async (req, res) => { ... }
export const addProduct = async (req, res) => { ... }
export const updateProduct = async (req, res) => { ... }
export const deleteProduct = async (req, res) => { ... }
```
- Manages product inventory (CRUD operations)

#### [snippeService.js](backend/src/services/snippeService.js)
- **Purpose**: Snippe Payment Gateway API wrapper
- **Class**: `SnippeService`
- **Environment Variables Required**:
  - `SNIPPE_API_KEY`: Bearer token for API authentication
  - `SNIPPE_BASE_URL`: API base URL (defaults to https://api.snippe.sh)
  - `FRONTEND_URL`: For redirect URLs after payment
  - `WEBHOOK_URL`: For payment status callbacks (requires HTTPS)
- **Key Methods**:
  ```javascript
  createPayment(paymentData) → {
    success: boolean,
    paymentReference: string,
    paymentUrl: string (for card payments),
    paymentQrCode: string (for QR code payment),
    status: string
  }
  
  verifyWebhookSignature(payload, signature, secret) → boolean
  ```
- **Payment Types**:
  - `'card'`: Redirect to Snippe hosted checkout page
  - `'mobile'`: Send USSD push to customer's phone

#### [orderService.js](backend/src/services/orderService.js)
- **Purpose**: Order persistence and payment-order linkage
- **Key Methods**:
  ```javascript
  savePendingOrder(orderReference, {cartItems, customerAddress})
  // Saves cart items before payment (for webhook to use)
  
  getAndRemovePendingOrder(orderReference)
  // Retrieves pending order after payment confirmed (and deletes it)
  
  savePaymentRecord(paymentData)
  // Records all payment attempts (success, failure, pending)
  
  createOrderFromPayment(paymentData, cartItems)
  // Creates order ONLY when payment succeeds (webhook triggered)
  
  getAllOrders()
  updateOrderStatus(orderId, status)
  deleteOrder(orderId)
  ```
- **Data Files**:
  - `payments.json`: All payment records (tracking only)
  - `orders.json`: Only completed/successful orders
  - `pending_orders.json`: Temporary storage for in-flight checkouts

#### [validation.js](backend/src/middleware/validation.js)
- **Purpose**: Request validation middleware
- **Validations**:
  - `validatePaymentRequest`: Checks required payment fields
  - `validateProductRequest`: Validates product data

### API Routes

#### `/api/products` - Product Management
```javascript
GET    /api/products              → Get all products
GET    /api/products/:id          → Get single product
POST   /api/products              → Add new product (admin)
PUT    /api/products/:id          → Update product (admin)
DELETE /api/products/:id          → Delete product (admin)
```

#### `/api/payments` - Payment Processing
```javascript
POST   /api/payments/initiate     → Start payment flow
GET    /api/payments/status/:id   → Check payment status
```

#### `/api/webhooks` - Payment Callbacks
```javascript
POST   /api/webhooks/payment-webhook → Snippe payment notifications
```

#### `/api/orders` - Order Management
```javascript
GET    /api/orders                → List all orders
GET    /api/orders/:id            → Get single order
PATCH  /api/orders/:id/status     → Update order status
```

#### `/api/health` - Server Status
```javascript
GET    /api/health                → Server health check
```

---

## 4. Data Models

### Core Data Structures

#### Product Model
**File**: [types.ts](src/types.ts) | [data/products.json](backend/data/products.json)

```typescript
interface Product {
  id: number;                    // Unique identifier (1, 2, 3, ...)
  name: string;                  // Product name
  description: string;           // Detailed description
  price: number;                 // Price in Tanzanian Shilling (TSH)
  stock: number;                 // Inventory count
  images: string[];              // Array of image URLs (up to 3 recommended)
}
```

**Example**:
```json
{
  "id": 1,
  "name": "Wireless Earbuds Pro",
  "description": "Noise-cancelling Bluetooth 5.3 earbuds with 30h battery",
  "price": 49.99,
  "stock": 142,
  "images": [
    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"
  ]
}
```

#### Cart Item Model
**File**: [types.ts](src/types.ts)

```typescript
interface CartItem {
  productId: number;             // Reference to Product.id
  quantity: number;              // Number of units
  name?: string;                 // Optional product name for display
}
```

**Example**:
```typescript
{
  productId: 1,
  quantity: 2,
  name: "Wireless Earbuds Pro"
}
```

#### Order Model
**File**: [types.ts](src/types.ts) | [data/orders.json](backend/data/orders.json)

```typescript
interface Order {
  id: string;                    // Unique order token (ORD-timestamp-random)
  customerName: string;          // Customer full name
  customerEmail?: string;        // Email address
  customerPhoneNumber?: string;  // Phone number
  location?: string;             // Delivery address
  items: CartItem[];             // Array of purchased items
  totalPrice: number;            // Total amount in TSH
  currency?: string;             // "TZS" (Tanzanian Shilling)
  status: 'pending' | 'completed';
  createdAt: string;             // ISO timestamp
  notes?: string;                // Order notes/metadata
  paymentReference?: string;     // Reference to Payment.id
}
```

**Example**:
```json
{
  "id": "ORD-1774197312040-6DIN7V",
  "customerName": "Gasper Simon",
  "customerEmail": "gaspersimon724@gmail.com",
  "customerPhoneNumber": "255659173024",
  "location": "123 Main Street, Dar es Salaam",
  "items": [
    { "productId": 1, "quantity": 2, "name": "Wireless Earbuds Pro" },
    { "productId": 2, "quantity": 1, "name": "Organic Green Tea" }
  ],
  "totalPrice": 1050,
  "currency": "TZS",
  "status": "completed",
  "createdAt": "2026-03-22T16:35:16.239Z",
  "notes": "Payment received via Snippe"
}
```

#### Payment Model
**File**: [data/payments.json](backend/data/payments.json)

```typescript
interface Payment {
  id: string;                    // Payment reference (from Snippe)
  orderReference: string;        // Link to order reference
  paymentReference: string;      // Snippe payment ID
  amount: number;                // Amount in TSH
  currency: string;              // "TZS"
  status: 'pending' | 'completed' | 'failed';
  customerName: string;
  customerEmail: string;
  customerPhoneNumber: string;
  channel?: string;              // Payment method (card, mobile, etc)
  createdAt: string;             // ISO timestamp
  updatedAt: string;
  rawData: object;               // Full response from Snippe
}
```

**Example**:
```json
{
  "id": "SN17741973134945912",
  "orderReference": "ORD-1774197312040-6DIN7V",
  "paymentReference": "SN17741973134945912",
  "amount": 1050,
  "currency": "TZS",
  "status": "completed",
  "customerName": "Gasper Simon",
  "customerEmail": "gaspersimon724@gmail.com",
  "customerPhoneNumber": "255659173024",
  "channel": "mobile",
  "createdAt": "2026-03-22T16:35:16.239Z",
  "updatedAt": "2026-03-22T16:35:16.239Z"
}
```

#### Pending Order Model
**File**: [data/pending_orders.json](backend/data/pending_orders.json)

```typescript
interface PendingOrder {
  [orderReference: string]: {
    cartItems: CartItem[];       // Customer's shopping cart
    customerAddress: string;     // Delivery address
    savedAt: string;             // Timestamp when saved
  }
}
```

**Purpose**: Temporary storage during checkout/payment flow
- **Created**: When customer initiates payment
- **Used**: When webhook confirms payment (to populate order.json)
- **Deleted**: After order is created or payment times out

---

## 5. Service Layer

### Frontend-Backend Communication

#### API Base URL
- **Development**: `http://localhost:5002`
- **Configured via**: `VITE_API_URL` environment variable
- **Default Fallback**: `http://localhost:5002`

#### Request/Response Flow

```
Frontend (React)
    │
    ├─→ paymentService.ts ─→ POST /api/payments/initiate
    │   └─→ Returns: { paymentUrl, paymentQrCode, status }
    │
    ├─→ productService.ts ─→ GET /api/products
    │   └─→ Returns: Product[] array
    │
    └─→ orderService.ts ─→ GET /api/orders
        └─→ Returns: Order[] array

Backend (Express)
    │
    ├── paymentController.js
    │   ├─→ Validates payment data
    │   ├─→ Calls snippeService.createPayment()
    │   ├─→ Saves pending order data
    │   └─→ Returns redirect URL
    │
    ├── webhookController.js
    │   ├─→ Receives Snippe callback
    │   ├─→ Validates signature
    │   ├─→ Creates order on success
    │   └─→ Updates payment status
    │
    └── productController.js / orderController.js
        └─→ CRUD operations on JSON files
```

### Service Architecture

#### Frontend Services

**[paymentService.ts](src/services/paymentService.ts)**
- Initiates payment with backend
- Sends: amount, customer details, cart items, order reference
- Receives: redirect URL or QR code or mobile prompt
- No direct Snippe API calls (goes through backend)

**[productService.ts](src/services/productService.ts)**
- Fetches products from `/api/products` endpoint
- Admin functions: add, update, delete products
- Error messages include helpful debugging info

**[orderService.ts](src/services/orderService.ts)**
- Fetches completed orders from `/api/orders`
- Allows status updates for admin
- Admin-only data (for dashboard)

**[storage.ts](src/services/storage.ts)**
- localStorage management for offline capability
- Cart persistence across page reloads
- Admin session management
- Fallback product data if backend unavailable

#### Backend Services

**[snippeService.js](backend/src/services/snippeService.js)**
- Direct Snippe Payment Gateway API integration
- Authentication: Bearer token in Authorization header
- Creates payments and receives:
  - `payment_url`: For card payments (redirect to checkout)
  - `payment_qr_code`: For QR-based payments
  - `payment_token`: Session identifier
  - `reference`: Payment ID for webhooks
- Webhook signature verification

**[orderService.js](backend/src/services/orderService.js)**
- File I/O for JSON data persistence
- Methods:
  - `savePendingOrder()`: Cache cart during payment
  - `savePaymentRecord()`: Track all payment attempts
  - `createOrderFromPayment()`: Create order on success
  - `getAllOrders()`: Fetch all orders for admin
  - `updateOrderStatus()`: Change order status
  - `deleteOrder()`: Remove order

### Data Flow Diagrams

#### User Purchase Flow

```
1. USER BROWSING
   HomePage
   └─→ fetchProductsFromBackend() 
       └─→ GET /api/products
           └─→ productController.getAllProducts()
               └─→ Read products.json

2. ADDING TO CART
   CartPage (useState)
   └─→ Cart state in React component
       └─→ localStorage (storage.ts)

3. CHECKOUT
   CheckoutForm
   ├─→ Collect customer info
   ├─→ Generate orderReference
   └─→ PaymentService.initiatePayment()
       └─→ POST /api/payments/initiate (with cartItems)
           └─→ paymentController.initiatePayment()
               ├─→ snippeService.createPayment()
               │   └─→ API call to Snippe
               │       └─→ Returns paymentUrl/QrCode
               ├─→ savePendingOrder() 
               │   └─→ Write cartItems to pending_orders.json
               └─→ savePaymentRecord()
                   └─→ Write payment record to payments.json

4. PAYMENT PROCESSING (Card)
   User's Browser
   └─→ Redirected to Snippe checkout
       └─→ Enter payment details
           └─→ Snippe processes payment
               └─→ Snippe calls webhook:
                   └─→ POST /api/webhooks/payment-webhook
                       └─→ webhookController.handlePaymentWebhook()
                           ├─→ Verify signature
                           ├─→ Get pending order from pending_orders.json
                           ├─→ Create order in orders.json
                           ├─→ Update payment status in payments.json
                           └─→ Return 200 OK to Snippe

5. CONFIRMATION
   User Redirected to /payment-success?orderRef=ORD-xxx
   └─→ PaymentSuccessPage shows confirmation
       └─→ Admin Dashboard shows new order
           └─→ fetchOrdersFromBackend()
               └─→ GET /api/orders
                   └─→ orderController.getAllOrders()
                       └─→ Read orders.json
```

#### Admin Page Flow

```
AdminLoginPage
└─→ Email + Password (simple auth)
    └─→ storage.verifyAdminPassword()
        └─→ localStorage.setItem (smartq_admin_verified)

AdminDashboardPage
├─→ fetchOrdersFromBackend() → GET /api/orders
├─→ fetchProductsFromBackend() → GET /api/products
└─→ Calculate stats (total revenue, pending orders, etc)
    └─→ Display cards with metrics

AdminProductsPage
├─→ List all products
├─→ Add Product → POST /api/products
├─→ Edit Product → PUT /api/products/:id
└─→ Delete Product → DELETE /api/products/:id

AdminOrdersPage
├─→ fetchOrdersFromBackend() → GET /api/orders
├─→ Display order table
└─→ Update Status → PATCH /api/orders/:id/status

AdminAnalyticsPage
└─→ Revenue charts, order metrics
```

---

## 6. Payment Integration (ClickPesa/Snippe)

### Snippe Payment Gateway Overview

**Provider**: Snippe Payment Aggregator (Tanzania-based)  
**Website**: https://api.snippe.sh  
**Supported Methods**:
- Visa/Mastercard (Card Payments)
- M-Pesa (Tanzania's #1 mobile money)
- Airtel Money (Alternative mobile money)
- USSD Push (Feature phones)
- QR Code (Contactless payment)

### Authentication & Credentials

**Required Environment Variables** (in `backend/.env`):
```env
SNIPPE_API_KEY=your_api_key_here            # Bearer token for API
SNIPPE_BASE_URL=https://api.snippe.sh       # API endpoint
SNIPPE_WEBHOOK_SECRET=your_webhook_secret    # For signature verification
FRONTEND_URL=http://localhost:5173          # Frontend address (for redirects)
WEBHOOK_URL=https://your-domain/api/webhooks/payment-webhook
```

### Obtaining Credentials

**Steps**:
1. Visit https://dashboard.clickpesa.com or https://dashboard.snippe.sh
2. Create an account (business registration required)
3. Navigate to Settings → Developers → Create Application
4. Copy: Client ID, API Key, Checksum Key
5. Store in `backend/.env` (never commit!)
6. Configure webhook URL in dashboard (must be HTTPS)

### Payment Flow Details

#### 1. Payment Initiation (Card Payment Example)

**Frontend** → [CheckoutForm.tsx](src/components/CheckoutForm.tsx)
```typescript
// User fills form:
{
  name: "John Doe",
  email: "john@example.com",
  phone: "0712345678",
  address: "123 Main St",
  city: "Dar es Salaam",
  country: "TZ"
}

// Form submits to backend:
await PaymentService.initiatePayment({
  amount: 1050,
  customerName: "John Doe",
  customerEmail: "john@example.com",
  customerPhoneNumber: "0712345678",
  cartItems: [
    { productId: 1, quantity: 2 },
    { productId: 2, quantity: 1 }
  ],
  orderReference: "ORD-1774197312040-6DIN7V",
  paymentType: "card"
})
```

#### 2. Backend Payment Initiation

[paymentController.js](backend/src/controllers/paymentController.js)
```javascript
// Controller actions in order:

1. PHONE NORMALIZATION
   Input: "0712345678"        → 255712345678
   Input: "+255712345678"     → 255712345678
   Input: "255712345678"      → 255712345678 (unchanged)

2. PREPARE PAYMENT DATA
   {
     payment_type: "card",
     details: {
       amount: 1050,
       currency: "TZS",
       redirect_url: "http://localhost:5173/payment-success?orderRef=...",
       cancel_url: "http://localhost:5173/payment-failed?orderRef=..."
     },
     customer: {
       firstname: "John",
       lastname: "Doe",
       email: "john@example.com",
       address: "123 Main St",
       city: "Dar es Salaam",
       country: "TZ"
     },
     metadata: { order_id: "ORD-1774197312040-6DIN7V" }
   }

3. CALL SNIPPE API
   snippeService.createPayment(paymentData)
   └─→ POST https://api.snippe.sh/v1/payments
       with Authorization: Bearer {API_KEY}

4. RECEIVE RESPONSE
   {
     success: true,
     paymentReference: "SN17741973134945912",
     paymentUrl: "https://checkout.snippe.sh/...",
     paymentQrCode: null,
     status: "initiated"
   }

5. SAVE PENDING DATA
   savePendingOrder(orderReference, {
     cartItems: [...],
     customerAddress: "123 Main St"
   })
   └─→ Write to pending_orders.json

6. SAVE PAYMENT RECORD
   savePaymentRecord({
     id: "SN17741973134945912",
     amount: 1050,
     status: "pending",
     customerName: "John Doe",
     ...
   })
   └─→ Write to payments.json

7. RETURN TO FRONTEND
   {
     paymentUrl: "https://checkout.snippe.sh/..."
   }
```

#### 3. Redirect to Snippe Checkout

**Frontend** → User's Browser
```javascript
// After receiving paymentUrl from backend:
window.location.href = paymentUrl;

// User is redirected to Snippe hosted checkout page
// User enters card details:
//   - Card number
//   - Expiry date
//   - CVV
//   - Billing address

// Snippe processes the payment
```

#### 4. Webhook Payment Confirmation

**Snippe** → [Backend Webhook](backend/src/routes/webhooks.js)
```javascript
// After successful payment, Snippe calls:
POST https://your-domain/api/webhooks/payment-webhook

// Payload:
{
  type: "payment.completed",
  data: {
    id: "PAY-12345",
    reference: "SN17741973134945912",
    status: "completed",
    amount: {
      value: 1050,
      currency: "TZS"
    },
    customer: {
      first_name: "John",
      last_name: "Doe"
    },
    metadata: {
      order_id: "ORD-1774197312040-6DIN7V"
    }
  }
}
```

#### 5. Webhook Processing

[webhookController.js](backend/src/controllers/webhookController.js)
```javascript
1. VERIFY SIGNATURE (if configured)
   Snippet sends x-webhook-signature header
   We compute HMAC-SHA256(payload + secret)
   Compare with received signature

2. RETRIEVE PENDING ORDER
   getAndRemovePendingOrder("ORD-1774197312040-6DIN7V")
   └─→ Read from pending_orders.json
   └─→ Delete from pending_orders.json
   └─→ Returns: { cartItems, customerAddress }

3. CREATE ORDER (ONLY ON SUCCESS)
   createOrderFromPayment({
     paymentReference: "SN17741973134945912",
     customerName: "John Doe",
     amount: 1050,
     status: "completed"
   }, cartItems)
   
   Generated order:
   {
     id: "ORD-1774197312040-6DIN7V",
     customerName: "John Doe",
     items: [ { productId: 1, quantity: 2 }, ... ],
     totalPrice: 1050,
     status: "completed",
     paymentReference: "SN17741973134945912",
     createdAt: "2026-03-22T16:35:16.239Z"
   }
   
   └─→ Write to orders.json
   └─→ Delete from pending_orders.json (auto-cleanup)

4. UPDATE PAYMENT STATUS
   updatePaymentStatus("SN17741973134945912", "completed")
   └─→ Update payments.json

5. RETURN 200 OK
   res.json({ success: true })
   // Snippe stops retrying
```

#### 6. User Confirmation

**Frontend** → [PaymentSuccessPage.tsx](src/pages/PaymentSuccessPage.tsx)
```javascript
// User is redirected back to frontend:
// /payment-success?orderRef=ORD-1774197312040-6DIN7V

// Page displays:
// ✓ Payment Successful!
// Order Reference: ORD-1774197312040-6DIN7V
// Items will be delivered to your address

// User can:
// - Click "Continue Shopping" → HomePage
// - Wait for SMS confirmation
// - Check admin dashboard for order
```

### Payment Type Variations

#### Card Payment (Hosted Checkout)
```
Frontend → Backend → Snippe Checkout Page → User pays → Webhook → Create Order
```
- Most secure (PCI-DSS compliant)
- Redirect URL required
- Webhook confirms completion

#### Mobile Money (M-Pesa/Airtel Money)
```
Frontend → Backend → Snippe API → Customer Phone (push) → User approves → Webhook
```
- Customer receives prompt on phone
- USSD or app-based
- Webhook confirms after customer approves

#### Mobile Money (USSD Push)
```
Mobile Phone → Enter PIN → Snippe Processes → Webhook
```
- Feature phone compatible
- No app required
- Customer-initiated confirmation

#### QR Code Payment
```
Phone Camera → Scan QR → Payment App → Pay → Webhook
```
- Contactless
- Quick payment
- M-Pesa/Airtel app required

### Error Handling

**Payment Initiation Failures**:
```javascript
if (!result.success) {
  return res.status(400).json({
    success: false,
    message: 'Payment initiation failed',
    error: result.message  // E.g., "Invalid amount", "Network error"
  });
}
```

**Webhook Failures**:
- Snippe retries webhook delivery for up to 24 hours
- Must return 2xx status code to acknowledge receipt
- Errors are logged but don't prevent order creation (idempotent)

**Network Issues**:
- Timeout handling in axios calls
- Fallback error messages for frontend
- Retry logic with exponential backoff (if implemented)

### Security Measures

1. **API Key Protection**: Stored in `.env`, never exposed to frontend
2. **Webhook Verification**: HMAC-SHA256 signature validation
3. **HTTPS Only**: Webhook URLs must be HTTPS
4. **Idempotency**: Payment creation uses order reference to prevent duplicates
5. **Phone Normalization**: Prevents invalid mobile numbers
6. **Invoice Tracking**: All payments recorded in payments.json
7. **Order Isolation**: Orders only created on webhook confirmation

---

## 7. Admin Features

### Admin Access

**URL**: `http://localhost:5173/admin/login`  
**Authentication**: Simple email + password (localStorage-based)

#### [AdminLoginPage.tsx](src/pages/AdminLoginPage.tsx)
```typescript
// Fields:
- Email: Any email address
- Password: Currently hardcoded or env-based

// On Login:
1. Verify credentials (storage.verifyAdminPassword())
2. Set localStorage token: smartq_admin_verified = true
3. Redirect to /admin/dashboard

// Protected Routes:
- Use <ProtectedAdminRoute> wrapper
- Redirects to login if token missing
```

### Admin Dashboard Features

#### 1. [AdminDashboardPage.tsx](src/pages/AdminDashboardPage.tsx) - Overview & Statistics

**Displays**:
```
┌─────────────────────────────────────────────────┐
│  Admin Dashboard                      [Logout]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────┬──────────────────┐        │
│  │ Total Products  │  Total Orders    │        │
│  │     42          │      127         │        │
│  ├─────────────────┼──────────────────┤        │
│  │ Pending Orders  │  Total Revenue   │        │
│  │      5          │  TSh 2,450,000   │        │
│  └─────────────────┴──────────────────┘        │
│                                                 │
│  Quick Actions:                                 │
│  [Manage Products]  [View Orders]  [Analytics] │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Statistics Calculated**:
- Total Products: Count of all products
- Total Orders: Count of completed orders (status = 'completed')
- Pending Orders: Orders with status = 'pending'
- Total Revenue: Sum of totalPrice from all completed orders

#### 2. [AdminProductsPage.tsx](src/pages/AdminProductsPage.tsx) - Inventory Management

**Features**:
```
┌────────────────────────────────────┐
│ Products Management        [+ Add]  │
├────────────────────────────────────┤
│                                    │
│ Product Name      Price   Stock   │
│ ─────────────────────────────────  │
│ Wireless Earbuds   $49.99   142  [Edit][Delete]
│ Green Tea          $12.50     8  [Edit][Delete]
│ Smart Watch       $199.00     0  [Edit][Delete]
│                                    │
└────────────────────────────────────┘
```

**Functionality**:
- **Add Product**: Opens form with fields:
  - Product Name
  - Description
  - Price (TSH)
  - Stock quantity
  - Image URLs (up to 3)
  - POST /api/products
  
- **Edit Product**: 
  - Pre-fills form with current data
  - PUT /api/products/:id
  
- **Delete Product**: 
  - Confirmation dialog
  - DELETE /api/products/:id

#### 3. [AdminOrdersPage.tsx](src/pages/AdminOrdersPage.tsx) - Order Management

**Features**:
```
┌─────────────────────────────────────────────────────┐
│ Orders Management                                    │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Order ID         Customer      Amount   Status      │
│ ─────────────────────────────────────────────────    │
│ ORD-1774-6DIN7V  Gasper Simon  TSh 1050  Completed │
│ ORD-1774-6ABC9X  John Doe      TSh 500   Pending   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Data Retrieved**:
- GET /api/orders
- Fields displayed:
  - Order ID
  - Customer name
  - Total amount
  - Status (pending/completed)
  - Created date
  - Items list

**Actions**:
- View order details (expand row)
- Update status: pending → completed
- PATCH /api/orders/:id/status

#### 4. [AdminAnalyticsPage.tsx](src/pages/AdminAnalyticsPage.tsx) - Analytics & Reports

**Displays**:
- Revenue trends (over time)
- Top-selling products
- Customer metrics
- Order status distribution
- Charts and graphs (if implemented with library)

### Authentication & Security

#### Current Simple Auth (storage.ts)
```typescript
export const isAdminVerified = (): boolean => {
  const verified = localStorage.getItem(STORAGE_KEYS.ADMIN_VERIFIED);
  return verified === 'true';
};

export const verifyAdminPassword = (email: string, password: string): boolean => {
  // Currently: simple hardcoded check
  // TODO: Better: Use backend API with JWT tokens
  const ADMIN_EMAIL = 'admin@smartq.store';
  const ADMIN_PASSWORD = 'admin123'; // Should be env var
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
};

export const logoutAdmin = () => {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_VERIFIED);
};
```

**Limitations**:
- Password stored in code/frontend (not production-safe)
- No session expiration
- No rate limiting on login attempts

**Recommendations for Production**:
- Move to backend: `/api/auth/login` endpoint
- Use JWT tokens with expiration
- Hash passwords with bcrypt
- Implement 2FA (two-factor authentication)
- Add role-based access control (RBAC)

### Admin Navigation

[AdminNav.tsx](src/components/AdminNav.tsx) - Sidebar menu
```
ADMIN PANEL
└─ Dashboard
└─ Products
└─ Orders
└─ Analytics
└─ Settings (optional)
└─ Logout
```

---

## 8. Key Features

### User-Facing Features

#### 1. Product Browsing
- **Page**: [HomePage.tsx](src/pages/HomePage.tsx)
- **Features**:
  - Grid display of all products
  - Product images (carousel/modal)
  - Price and stock information
  - Search & filter functionality
  - "Add to Cart" button
  - Stock status indicator (in stock / low stock / out of stock)

#### 2. Shopping Cart
- **Page**: [CartPage.tsx](src/pages/CartPage.tsx)
- **Features**:
  - View cart items with quantity
  - Update quantity (↑↓ buttons)
  - Remove items
  - Persistent storage (localStorage)
  - Cart total calculation
  - "Proceed to Checkout" button
  - Empty cart message

#### 3. Checkout & Payment
- **Component**: [CheckoutForm.tsx](src/components/CheckoutForm.tsx)
- **Features**:
  - Customer information form:
    - Full name (required)
    - Email (required, validated)
    - Phone number (required)
    - Delivery address (required)
    - City, state, postcode, country
  - Payment method selection:
    - Card (Visa/Mastercard)
    - Mobile Money (M-Pesa/Airtel)
  - Order summary (items + total)
  - Form validation with error messages
  - Loading state during payment initiation
  - Bilingual UI (English + Swahili)

#### 4. Payment Pages
- **[PaymentSuccessPage.tsx](src/pages/PaymentSuccessPage.tsx)**
  - Confirmation message
  - Order reference display
  - Order details
  - "Continue Shopping" button
  - SMS notification info

- **[PaymentFailedPage.tsx](src/pages/PaymentFailedPage.tsx)**
  - Error message
  - Reason for failure
  - "Try Again" button
  - Support contact info

- **[PaymentQrPage.tsx](src/pages/PaymentQrPage.tsx)**
  - QR code display
  - Instructions to scan
  - Amount and order reference
  - Polling for payment status

- **[PaymentPendingPage.tsx](src/pages/PaymentPendingPage.tsx)**
  - "Check your phone for payment prompt"
  - USSD push confirmation
  - Countdown timer
  - Manual refresh option

#### 5. Search & Filter
- **Component**: [searchbar.tsx](src/components/searchbar.tsx)
- **Features**:
  - Real-time search
  - Search by product name or description
  - Case-insensitive matching
  - Clear search button

#### 6. Product Images
- **Component**: [ImageModal.tsx](src/components/ImageModal.tsx)
- **Features**:
  - Image gallery/carousel
  - Full-screen modal view (lightbox)
  - Navigate through multiple images
  - Close button / click outside to close

### Admin-Only Features

#### 1. Dashboard Metrics
- Product inventory count
- Total orders
- Pending orders
- Revenue calculation
- Key performance indicators (KPIs)

#### 2. Product Management (CRUD)
- **Create**: Add new products with details + images
- **Read**: View all products in list/grid
- **Update**: Edit product information
- **Delete**: Remove products from inventory

#### 3. Order Management
- **View**: List all customer orders
- **Details**: See order items, customer info, addresses
- **Status Update**: Mark orders as completed/pending
- **Order History**: Track all transactions

#### 4. Analytics
- Revenue reports (daily/monthly)
- Top-selling products
- Customer metrics
- Payment method breakdown
- Order status distribution

### Bilingual Support
- **English**: Default language
- **Swahili**: Selected pages (HomePage, CheckoutForm)
- **Translations**:
  - "Bidhaa Zetu" = "Our Products"
  - "Mkoba" = "Cart/Shopping Basket"
  - "Malipo" = "Payment"
  - "Salama" = "Safe/Secure"

---

## 9. Configuration & Setup

### Environment Variables

#### Frontend Configuration
**File**: `.env` (in `product-cart/` root) - Create if needed
```env
# API Configuration
VITE_API_URL=http://localhost:5002

# Build mode
VITE_BUILD_MODE=development
```

#### Backend Configuration
**File**: `backend/.env` - Required for payment integration
```env
# Server
PORT=5002
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Snippe Payment Gateway
SNIPPE_API_KEY=your_api_key_here
SNIPPE_BASE_URL=https://api.snippe.sh
SNIPPE_WEBHOOK_SECRET=your_webhook_secret_here

# Webhook Configuration (for production)
WEBHOOK_URL=https://your-domain.com/api/webhooks/payment-webhook
```

### Build Setup

#### [package.json](package.json) - Frontend
```json
{
  "scripts": {
    "dev": "vite --host",              // Start dev server (port 5173)
    "build": "tsc -b && vite build",   // Build for production
    "lint": "eslint .",                // Lint TS/TSX files
    "preview": "vite preview"          // Preview production build
  }
}
```

#### [backend/package.json](backend/package.json)
```json
{
  "scripts": {
    "start": "node src/app.js",        // Start production server
    "dev": "node --watch src/app.js"   // Watch mode for development
  }
}
```

#### [vite.config.ts](vite.config.ts) - Build Configuration
```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',                     // Import alias
    },
  },
  server: {
    host: true,                        // Listen on all interfaces
    strictPort: true,
    allowedHosts: ["nonfrosted-unexpediently-lorean.ngrok-free.dev"],
  },
})
```

#### [tsconfig.json](tsconfig.json) - TypeScript Configuration
- Configured for React 19 + JSX
- Strict mode enabled
- ES2020+ target

#### [eslint.config.js](eslint.config.js) - Linting Rules
- ESLint with TypeScript support
- React hooks plugin
- React refresh plugin

### Folder Structure & Conventions

**Frontend**:
- `src/pages/` → Full page components
- `src/components/` → Reusable UI components
- `src/services/` → API calls and utilities
- `src/assets/` → Static files (images, fonts)

**Backend**:
- `src/app.js` → Express server entry point
- `src/routes/` → API endpoint definitions
- `src/controllers/` → Business logic handlers
- `src/services/` → External APIs and data persistence
- `src/middleware/` → Express middleware (validation, etc)
- `data/` → JSON file storage

### Running the Project

**Step 1: Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Snippe credentials
npm run dev  # or: npm start
```

**Step 2: Setup Frontend**
```bash
cd product-cart
npm install
npm run dev
```

**Step 3: Access**
- Frontend: http://localhost:5173
- Backend: http://localhost:5002
- Admin: http://localhost:5173/admin/login

### Production Deployment

**Frontend Deployment** (Vercel, Netlify, etc)
```bash
npm run build
# Creates optimized build in dist/
# Deploy dist/ folder
```

**Backend Deployment** (Heroku, Railway, AWS, etc)
```bash
# Set environment variables in hosting platform
# Push code (git push)
# Service runs: node src/app.js
```

**Important**: 
- Change `FRONTEND_URL` to production domain
- Set `WEBHOOK_URL` to HTTPS endpoint
- Use strong admin credentials
- Enable rate limiting
- Set up monitoring/logging

---

## 10. Entry Points & User Flows

### User Journey Maps

#### New Customer Flow (Purchase)
```
1. VISIT SITE
   │
   └─→ http://localhost:5173
       └─→ Splash screen (SMART Q branding)
           └─→ 3-second animation
               └─→ HomePage
                   └─→ Display products grid

2. BROWSE PRODUCTS
   │
   └─→ Click product image → ImageModal (lightbox)
   └─→ Search bar → Filter products
   └─→ Click "Add to Cart" → CartPage

3. REVIEW CART
   │
   └─→ CartPage shows:
       ├─→ Cart items (name, qty, price)
       ├─→ Adjust quantities
       ├─→ Remove items
       └─→ Click "Pay Now" → CheckoutForm

4. PAYMENT INFO
   │
   └─→ CheckoutForm collects:
       ├─→ Name, email, phone number
       ├─→ Delivery address
       ├─→ Payment method (Card or Mobile)
       └─→ Submission → Backend payment API

5. PAYMENT GATEWAY
   │
   ├─→ Card Payment:
   │   └─→ Redirect to Snippe checkout page
   │       └─→ Enter card details
   │           └─→ Payment processed
   │               └─→ Redirect to PaymentSuccessPage
   │
   └─→ Mobile Money:
       └─→ Redirect to PaymentPendingPage
           └─→ Check phone for payment prompt
               └─→ User approves payment on phone
                   └─→ Webhook confirms
                       └─→ Redirect to PaymentSuccessPage

6. CONFIRMATION
   │
   └─→ PaymentSuccessPage
       ├─→ Order reference: ORD-1774197312040-6DIN7V
       ├─→ Items ordered
       ├─→ Delivery address confirmed
       └─→ Click "Continue Shopping" → HomePage
           (or close browser, order is already saved)

BACKEND PROCESSES (Async):
   Webhook from Snippe
   └─→ Verify payment status
   └─→ Create order in orders.json
   └─→ Update payment status in payments.json
   └─→ Clean up pending_orders.json
   └─→ Send order confirmation email (if configured)
```

#### Admin Flow
```
1. LOGIN
   │
   └─→ http://localhost:5173/admin/login
       └─→ Enter email & password
           └─→ "Submit" button
               └─→ Verification (storage.verifyAdminPassword)
                   └─→ localStorage token set
                       └─→ Redirect to /admin/dashboard

2. DASHBOARD OVERVIEW
   │
   └─→ View key metrics:
       ├─→ Total Products
       ├─→ Total Orders
       ├─→ Pending Orders
       └─→ Revenue (sum of all completed orders)

3. MANAGE PRODUCTS
   │
   └─→ Click "Products" in sidebar
       └─→ ProductsPage enables:
           ├─→ Add product: Name, description, price, stock, images
           ├─→ Edit product: Update any field
           └─→ Delete product: Remove from inventory
           
   Backend Operations:
       ├─→ GET /api/products (fetch all)
       ├─→ POST /api/products (create)
       ├─→ PUT /api/products/:id (update)
       └─→ DELETE /api/products/:id (delete)

4. VIEW ORDERS
   │
   └─→ Click "Orders" in sidebar
       └─→ OrdersPage shows all customer orders:
           ├─→ Order ID
           ├─→ Customer name
           ├─→ Items list
           ├─→ Total amount
           ├─→ Status (pending/completed)
           └─→ Actions:
               ├─→ View details
               └─→ Update status

5. ANALYTICS
   │
   └─→ Click "Analytics" in sidebar
       └─→ ViewReports:
           ├─→ Revenue chart (by date)
           ├─→ Top products
           ├─→ Order distribution
           └─→ Customer metrics

6. LOGOUT
   │
   └─→ Click "Logout" button
       └─→ localStorage token cleared
           └─→ Redirect to / (homepage)
               └─→ Admin cannot access protected routes
```

### Entry Points Summary

| **User Type** | **Entry URL** | **Initial Page** | **Key Pages** |
|---|---|---|---|
| **Customer** | `http://localhost:5173/` | HomePage (splash then products) | Cart → Checkout → Payment |
| **Admin** | `http://localhost:5173/admin/login` | AdminLoginPage | Dashboard → Products → Orders |
| **API Client** | `http://localhost:5002/api/*` | REST API endpoints | Products, Payments, Orders, Webhooks |

### Error Scenarios & Handling

#### Payment Errors
```
1. INVALID PAYMENT REQUEST
   └─→ Frontend: Missing fields validation
   └─→ Backend: validatePaymentRequest middleware
   └─→ Response: 400 Bad Request + error message

2. PAYMENT GATEWAY ERROR
   └─→ snippeService.createPayment() fails
   └─→ Response: 400 with Snippe error message
   └─→ Frontend: CheckoutForm shows error, allows retry

3. BACKEND DOWN
   └─→ Frontend can't reach /api/payments/initiate
   └─→ Frontend shows: "Cannot connect to backend. Is it running?"
   └─→ Fallback: Use localStorage (offline mode)

4. WEBHOOK TIMEOUT/FAILURE
   └─→ Snippe retries for 24 hours
   └─→ Payment remains 'pending' in payments.json
   └─→ Order not created until webhook succeeds
   └─→ Admin can manually verify and create order
```

#### Admin Access Errors
```
1. NOT LOGGED IN
   └─→ Try to access /admin/dashboard
   └─→ ProtectedAdminRoute checks isAdminVerified()
   └─→ localStorage token is missing/false
   └─→ Redirect to /admin/login

2. WRONG CREDENTIALS
   └─→ AdminLoginPage: verifyAdminPassword() returns false
   └─→ Show error: "Invalid email or password"
   └─→ Session not created
```

#### Data Errors
```
1. PRODUCT NOT FOUND
   └─→ GET /api/products/:id (missing ID)
   └─→ Response: 404 Not Found

2. ORDER NOT FOUND
   └─→ PATCH /api/orders/:id (invalid order ID)
   └─→ Response: 404 Not Found

3. FILE I/O ERROR
   └─→ orders.json not readable
   └─→ Response: 500 Internal Server Error
   └─→ Error logged to console (development)
```

---

## Summary Table

| **Aspect** | **Details** |
|---|---|
| **Frontend Framework** | React 19 + TypeScript + Tailwind CSS |
| **Backend Framework** | Node.js/Express |
| **Build Tool** | Vite |
| **Payment Provider** | Snippe (Tanzania) |
| **Data Storage** | JSON files (no database) |
| **Authentication** | localStorage (frontend) + token-based |
| **API Style** | RESTful |
| **Deployment Target** | Vercel/Netlify (frontend), Heroku/Railway/AWS (backend) |
| **Supported Payment Methods** | Card, M-Pesa, Airtel Money, USSD, QR Code |
| **Currency** | Tanzanian Shilling (TZS) |
| **Users** | Customers (browsing/purchasing) + Admin (dashboard) |

---

## Key Files Quick Reference

### Frontend Critical Files
- [src/App.tsx](src/App.tsx) - Routing & layout
- [src/types.ts](src/types.ts) - Data models
- [src/pages/HomePage.tsx](src/pages/HomePage.tsx) - Product browsing
- [src/pages/CartPage.tsx](src/pages/CartPage.tsx) - Shopping cart
- [src/components/CheckoutForm.tsx](src/components/CheckoutForm.tsx) - Payment gateway UI
- [src/services/paymentService.ts](src/services/paymentService.ts) - Backend API calls

### Backend Critical Files
- [backend/src/app.js](backend/src/app.js) - Server setup
- [backend/src/controllers/paymentController.js](backend/src/controllers/paymentController.js) - Payment logic
- [backend/src/controllers/webhookController.js](backend/src/controllers/webhookController.js) - Webhook handling
- [backend/src/services/snippeService.js](backend/src/services/snippeService.js) - Snippe API integration
- [backend/src/services/orderService.js](backend/src/services/orderService.js) - Data persistence

### Data Files
- [backend/data/products.json](backend/data/products.json) - Product catalog
- [backend/data/orders.json](backend/data/orders.json) - Completed orders
- [backend/data/payments.json](backend/data/payments.json) - Payment history
- [backend/data/pending_orders.json](backend/data/pending_orders.json) - In-flight checkouts

---

**Document Generated**: March 29, 2026  
**Project Status**: Production-Ready with Full ClickPesa/Snippe Integration  
**Last Updated**: COMPREHENSIVE_TECHNICAL_OVERVIEW.md
