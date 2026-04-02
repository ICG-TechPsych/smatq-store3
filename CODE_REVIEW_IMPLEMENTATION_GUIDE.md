# SMATQ Store - Implementation Guide for Top Fixes

This document provides **code examples and step-by-step instructions** for implementing the top 10 priority improvements.

---

## FIX #1: Backend JWT Authentication ⭐ CRITICAL

**Current Problem**: Admin login stored in localStorage. Anyone can edit it.

### Step 1: Create JWT Auth Middleware

**File**: `backend/src/middleware/auth.js` (NEW)

```javascript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '24h';

/**
 * Generate JWT token
 */
export const generateToken = (adminId) => {
  return jwt.sign({ adminId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

/**
 * Verify JWT token middleware
 */
export const verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminId = decoded.adminId;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

/**
 * Admin required middleware
 */
export const requireAdmin = (req, res, next) => {
  if (!req.adminId) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};
```

### Step 2: Create Auth Controller

**File**: `backend/src/controllers/authController.js` (NEW)

```javascript
import { generateToken } from '../middleware/auth.js';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin'; // Change in production!

/**
 * POST /api/auth/login
 * Admin login endpoint
 */
export const login = (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password required' });
    }

    // Validate password (in production, use bcrypt)
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    // Generate token
    const token = generateToken('admin-user');

    // Send token as httpOnly cookie (secure for production)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      success: true,
      message: 'Login successful',
      token // Also return token for frontend to store (optional)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

/**
 * POST /api/auth/logout
 * Admin logout
 */
export const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out' });
};

/**
 * GET /api/auth/verify
 * Verify if current user is authenticated
 */
export const verify = (req, res) => {
  res.json({ success: true, authenticated: !!req.adminId });
};
```

### Step 3: Update Routes

**File**: `backend/src/routes/auth.js` (NEW)

```javascript
import express from 'express';
import { login, logout, verify } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', verifyToken, logout);
router.get('/verify', verifyToken, verify);

export default router;
```

### Step 4: Update Admin Routes

**File**: `backend/src/routes/products.js`

```javascript
import express from 'express';
import { requireAdmin, verifyToken } from '../middleware/auth.js';
import { addProduct, updateProduct, deleteProduct } from '../controllers/productController.js';

const router = express.Router();

// Public
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin only
router.post('/', verifyToken, requireAdmin, addProduct);
router.put('/:id', verifyToken, requireAdmin, updateProduct);
router.delete('/:id', verifyToken, requireAdmin, deleteProduct);

export default router;
```

### Step 5: Update Frontend

**File**: `src/pages/AdminLoginPage.tsx`

```typescript
import { useState } from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminLoginPage = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Call backend login endpoint
      const response = await fetch('http://localhost:5002/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important: Send cookies!
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      // Store token (optional, if not using httpOnly cookie)
      localStorage.setItem('token', data.token);

      navigate('/admin/dashboard');
    } catch (err) {
      setError('Login failed. Is backend running?');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            SMART<span className="text-blue-600">Q</span> Admin
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-gap gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Enter admin password"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
```

### Step 6: Update Protected Routes

**File**: `src/utils/auth.ts` (NEW)

```typescript
/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const response = await fetch('http://localhost:5002/api/auth/verify', {
      credentials: 'include' // Send cookies!
    });
    if (response.ok) {
      const data = await response.json();
      return data.authenticated;
    }
    return false;
  } catch {
    return false;
  }
};

/**
 * Logout user
 */
export const logout = async () => {
  await fetch('http://localhost:5002/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
  });
  localStorage.removeItem('token');
};
```

### Install Required Package

```bash
cd backend
npm install jsonwebtoken cookie-parser
```

Update `backend/src/app.js`:

```javascript
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';

app.use(cookieParser());
app.use('/api/auth', authRoutes);
```

---

## FIX #2: Mandatory Webhook Signature Verification ⭐ CRITICAL

**Current Problem**: Webhook signature optional - anyone can fake payment confirmations!

### Current Code (VULNERABLE)

```javascript
// ❌ VULNERABLE: Signature check is optional
if (signature && process.env.SNIPPE_WEBHOOK_SECRET) {
  const isValid = snippeService.verifyWebhookSignature(...);
  if (!isValid) return res.status(401).json({ ... });
}
// Webhook accepted even without signature! ❌
```

### Fixed Code

**File**: `backend/src/controllers/webhookController.js`

```javascript
import snippeService from '../services/snippeService.js';

/**
 * ✅ FIXED: Signature verification is MANDATORY
 */
export const handlePaymentWebhook = async (req, res) => {
  try {
    const payload = req.body;
    const signature = req.headers['x-webhook-signature'];

    // 1. REQUIRE signature to be present
    if (!signature) {
      console.warn('❌ Webhook rejected: No signature header');
      return res.status(400).json({
        success: false,
        message: 'Signature required'
      });
    }

    // 2. REQUIRE secret to be configured
    if (!process.env.SNIPPE_WEBHOOK_SECRET) {
      console.error('CRITICAL: SNIPPE_WEBHOOK_SECRET not configured!');
      return res.status(500).json({
        success: false,
        message: 'Webhook configuration error'
      });
    }

    // 3. VERIFY signature
    const payloadString = JSON.stringify(payload);
    const isValid = snippeService.verifyWebhookSignature(
      payloadString,
      signature,
      process.env.SNIPPE_WEBHOOK_SECRET
    );

    if (!isValid) {
      console.warn('❌ Webhook rejected: Invalid signature');
      return res.status(401).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    console.log('✅ Webhook signature verified');

    // 4. Process webhook
    const { type, data } = payload;

    if (type === 'payment.completed') {
      return handlePaymentCompleted(data, res);
    }

    if (type === 'payment.failed') {
      return handlePaymentFailed(data, res);
    }

    // Unknown event
    console.log(`Event acknowledged: ${type}`);
    res.json({ success: true, message: 'Event acknowledged' });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(200).json({
      success: false,
      message: 'Webhook processed with error'
    });
  }
};
```

### Verify Your Signature Method

**File**: `backend/src/services/snippeService.js`

```javascript
/**
 * Verify webhook signature using HMAC-SHA256
 * @param {string} payload - JSON payload as string
 * @param {string} signature - Signature from header
 * @param {string} secret - Webhook secret from environment
 * @returns {boolean} True if signature is valid
 */
export const verifyWebhookSignature = (payload, signature, secret) => {
  const crypto = require('crypto');
  
  // Create HMAC-SHA256 hash
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64'); // or 'hex' depending on Snippe format
  
  // Compare with provided signature
  const isValid = hash === signature;
  
  if (isValid) {
    console.log('✅ Webhook signature verified');
  } else {
    console.warn('❌ Webhook signature mismatch');
    console.warn('Expected:', hash);
    console.warn('Received:', signature);
  }
  
  return isValid;
};
```

---

## FIX #3: Comprehensive Input Validation ⭐ CRITICAL

**Current Problem**: Payment accepts negative amounts, weak email validation, no phone validation.

### Create Global Validators

**File**: `backend/src/utils/validators.js` (NEW)

```javascript
/**
 * Validate email using proper regex
 */
export const isValidEmail = (email) => {
  // RFC 5322 simplified
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Validate phone number (Tanzania format)
 * Valid: 0712345678, +255712345678, 255712345678
 */
export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  
  // Remove spaces and dashes
  const normalized = phone.replace(/[\s-]/g, '');
  
  // Should be 10-13 digits
  const digitsOnly = normalized.replace(/\D/g, '');
  if (digitsOnly.length < 10 || digitsOnly.length > 13) return false;
  
  // Tanzania: starts with 0, 255, or +255
  return /^(\+?255|0)[1-9]\d{8}$/.test(normalized);
};

/**
 * Validate customer name
 */
export const isValidName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 100;
};

/**
 * Validate amount (must be positive)
 */
export const isValidAmount = (amount) => {
  const num = Number(amount);
  return !isNaN(num) && num > 0 && num <= 999999999 && Number.isFinite(num);
};

/**
 * Validate product data
 */
export const validateProductInput = (product) => {
  const errors = [];

  if (!product.name || product.name.trim().length < 3) {
    errors.push('Product name must be at least 3 characters');
  }

  if (!product.description || product.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters');
  }

  if (!isValidAmount(product.price)) {
    errors.push('Price must be a positive number');
  }

  if (!Number.isInteger(product.stock) || product.stock < 0) {
    errors.push('Stock must be a non-negative integer');
  }

  if (!Array.isArray(product.images) || product.images.length === 0) {
    errors.push('At least one image is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Sanitize string input (prevent XSS)
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim()
    .substring(0, 500); // Limit length
};
```

### Update Validation Middleware

**File**: `backend/src/middleware/validation.js`

```javascript
import {
  isValidEmail,
  isValidPhone,
  isValidName,
  isValidAmount,
  validateProductInput,
  sanitizeString
} from '../utils/validators.js';

/**
 * Validate payment initiation request
 */
export const validatePaymentRequest = (req, res, next) => {
  const {
    amount,
    customerName,
    customerEmail,
    customerPhoneNumber,
    cartItems,
    orderReference
  } = req.body;

  const errors = [];

  // Validate amount
  if (!isValidAmount(amount)) {
    errors.push('Amount must be a positive number');
  }

  // Validate name
  if (!isValidName(customerName)) {
    errors.push('Customer name is required (2-100 characters)');
  }

  // Validate email
  if (!isValidEmail(customerEmail)) {
    errors.push('Valid email is required');
  }

  // Validate phone
  if (!isValidPhone(customerPhoneNumber)) {
    errors.push('Valid phone number is required (Tanzania format)');
  }

  // Validate cart items
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    errors.push('Cart items are required');
  } else {
    cartItems.forEach((item, idx) => {
      if (!Number.isInteger(item.productId) || item.productId <= 0) {
        errors.push(`Cart item ${idx}: Invalid product ID`);
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        errors.push(`Cart item ${idx}: Quantity must be positive`);
      }
    });
  }

  // Validate order reference
  if (!orderReference || typeof orderReference !== 'string' || orderReference.length < 5) {
    errors.push('Valid order reference is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Sanitize inputs
  req.body.customerName = sanitizeString(customerName);
  req.body.customerEmail = customerEmail.trim().toLowerCase();
  req.body.customerPhoneNumber = customerPhoneNumber.trim();

  next();
};

/**
 * Validate product input for POST/PUT
 */
export const validateProductRequest = (req, res, next) => {
  const validation = validateProductInput(req.body);

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }

  // Sanitize
  req.body.name = sanitizeString(req.body.name);
  req.body.description = sanitizeString(req.body.description);

  next();
};

/**
 * Validate order status update
 */
export const validateOrderStatusRequest = (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'completed', 'shipped', 'delivered'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status',
      validStatuses
    });
  }

  next();
};
```

### Update Routes to Use Validators

```javascript
// backend/src/routes/products.js
import { validateProductRequest } from '../middleware/validation.js';

router.post('/', validateProductRequest, addProduct);
router.put('/:id', validateProductRequest, updateProduct);

// backend/src/routes/orders.js
import { validateOrderStatusRequest } from '../middleware/validation.js';

router.patch('/:id/status', validateOrderStatusRequest, patchOrderStatus);
```

---

## FIX #4: Rate Limiting ⭐ CRITICAL

### Install Package

```bash
cd backend
npm install express-rate-limit
```

### Create Rate Limiter

**File**: `backend/src/middleware/rateLimiter.js` (NEW)

```javascript
import rateLimit from 'express-rate-limit';

/**
 * Payment endpoint limiter: 5 requests per 15 minutes per IP
 */
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many payment requests, please try again later',
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  skip: (req) => {
    // Don't rate limit admin users (if authenticated)
    return req.adminId ? true : false;
  }
});

/**
 * Webhook limiter: 20 requests per minute
 */
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: 'Too many webhook requests',
  keyGenerator: (req) => {
    // Rate limit by signature/source IP instead of user IP
    return req.headers['x-webhook-signature'] || req.ip;
  }
});

/**
 * General API limiter: 100 requests per minute per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later'
});

/**
 * Strict limiter for auth endpoints: 5 attempts per 15 minutes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later',
  skipSuccessfulRequests: true // Don't count successful logins
});
```

### Apply Limiters

**File**: `backend/src/app.js`

```javascript
import { paymentLimiter, webhookLimiter, apiLimiter, authLimiter } from './middleware/rateLimiter.js';

// Apply general rate limit to all API routes
app.use('/api/', apiLimiter);

// Apply specific limiters to sensitive endpoints
app.use('/api/payments/initiate', paymentLimiter);
app.use('/api/webhooks/payment-webhook', webhookLimiter);
app.use('/api/auth/login', authLimiter);
```

---

## FIX #5: Constants File ⭐ HIGH

**File**: `src/constants.ts` (NEW)

```typescript
// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

// Product Constants
export const PRODUCT_STOCK_LEVELS = {
  LOW_THRESHOLD: 10,
  OUT_OF_STOCK: 0,
} as const;

export const PRODUCT_CONSTRAINTS = {
  NAME_MIN_LENGTH: 3,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MIN_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 1000,
  PRICE_MIN: 0.01,
  PRICE_MAX: 999999,
} as const;

// Cart Constants
export const CART_LIMITS = {
  MAX_ITEMS_PER_PRODUCT: 999,
  ADDED_TO_CART_TIMEOUT_MS: 2000,
} as const;

// Payment Constants
export const PAYMENT_TYPES = {
  CARD: 'card',
  MOBILE: 'mobile',
  USSD: 'ussd',
  QR: 'qr',
} as const;

export const PAYMENT_CONSTRAINTS = {
  AMOUNT_MIN: 100, // TSh
  AMOUNT_MAX: 999999999,
  PHONE_PATTERN: /^(\+?255|0)[1-9]\d{8}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
} as const;

// Timing
export const TIMEOUTS = {
  SPLASH_SCREEN_MS: 3000,
  ADDED_TO_CART_MS: 2000,
  PAYMENT_POLL_INTERVAL_MS: 5000,
  PAYMENT_POLL_TIMEOUT_MS: 5 * 60 * 1000, // 5 minutes
} as const;

// Pagination
export const PAGINATION = {
  PRODUCTS_PER_PAGE: 20,
  ORDERS_PER_PAGE: 50,
} as const;

// Status Constants
export const ORDER_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
} as const;

export const PAYMENT_STATUS = {
  INITIATED: 'initiated',
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

// Country
export const DEFAULT_COUNTRY_CODE = 'TZ';
export const DEFAULT_CITY = 'Dar es Salaam';

// Messages
export const MESSAGES = {
  PAYMENT_SUCCESS: 'Payment completed successfully',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  PAYMENT_PENDING: 'Payment is pending. Please wait.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  BACKEND_ERROR: 'Backend is not running. Please contact support.',
  VALIDATION_ERROR: 'Please fill all required fields correctly.',
} as const;
```

**File**: `backend/src/constants.js` (NEW)

```javascript
// Payment Constants
export const PAYMENT_STATUS = {
  INITIATED: 'initiated',
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
};

// Phone Number Normalization (Tanzania)
export const PHONE_CONFIG = {
  COUNTRY_CODE: '255',
  MIN_LENGTH: 10,
  MAX_LENGTH: 13,
};

// Validation Constraints
export const VALIDATION_CONSTRAINTS = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 254,
  DESCRIPTION_MIN_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 1000,
  PRODUCT_NAME_MIN_LENGTH: 3,
  STOCK_MIN: 0,
  PRICE_MIN: 0.01,
  PRICE_MAX: 999999,
};

// Webhook Configuration
export const WEBHOOK_CONFIG = {
  TIMEOUT_MS: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 5000,
};

// Pagination
export const PAGINATION = {
  PRODUCTS_PER_PAGE: 20,
  ORDERS_PER_PAGE: 50,
};

// JWT Configuration
export const JWT_CONFIG = {
  EXPIRY: '24h',
  ALGORITHM: 'HS256',
};

// Rate Limiting
export const RATE_LIMITS = {
  PAYMENT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
  },
  WEBHOOK: {
    windowMs: 60 * 1000, // 1 minute
    max: 20,
  },
  AUTH: {
    windowMs: 15 * 60 * 1000,
    max: 5,
  },
  GENERAL: {
    windowMs: 60 * 1000,
    max: 100,
  },
};
```

---

## Quick Implementation Checklist

- [ ] **Fix #1**: Backend JWT auth (2-3 days)
  - [ ] Create `backend/src/middleware/auth.js`
  - [ ] Create `backend/src/controllers/authController.js`
  - [ ] Create `backend/src/routes/auth.js`
  - [ ] Update `src/pages/AdminLoginPage.tsx`
  - [ ] Install `jsonwebtoken`, `cookie-parser`

- [ ] **Fix #2**: Mandatory webhook signatures (2 hours)
  - [ ] Update `backend/src/controllers/webhookController.js`
  - [ ] Verify signature logic in `backend/src/services/snippeService.js`

- [ ] **Fix #3**: Input validation (1-2 days)
  - [ ] Create `backend/src/utils/validators.js`
  - [ ] Update `backend/src/middleware/validation.js`
  - [ ] Add validators to all routes

- [ ] **Fix #4**: Rate limiting (4 hours)
  - [ ] Install `express-rate-limit`
  - [ ] Create `backend/src/middleware/rateLimiter.js`
  - [ ] Apply to sensitive endpoints

- [ ] **Fix #5**: Constants files (2 hours)
  - [ ] Create `src/constants.ts`
  - [ ] Create `backend/src/constants.js`
  - [ ] Replace hardcoded values

---

**Testing Each Fix**:

```bash
# Test JWT auth
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password": "admin"}'

# Test rate limiting (should fail after 5 requests)
for i in {1..10}; do
  curl http://localhost:5002/api/products
done

# Test webhook with missing signature (should fail)
curl -X POST http://localhost:5002/api/webhooks/payment-webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"payment.completed","data":{}}'
```

These implementations fix the **critical issues** that prevent production deployment. Complete all 5 fixes before going live!
