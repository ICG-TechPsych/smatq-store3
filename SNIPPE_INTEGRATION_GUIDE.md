# Snippe Payment Gateway Integration Guide
## For SMATQ Store E-Commerce Platform

**Last Updated:** March 2026  
**Snippe API Version:** v1  
**Base URL:** `https://api.snippe.sh/v1`  
**Tanzania Payment Gateway:** ✅ Covers M-Pesa, Card, Airtel Money, USSD, QR Code

---

## Table of Contents
1. [Overview](#overview)
2. [Setup & Configuration](#setup--configuration)
3. [Authentication](#authentication)
4. [Core Endpoints](#core-endpoints)
5. [Payment Flow](#payment-flow)
6. [Webhook Handling](#webhook-handling)
7. [Error Handling](#error-handling)
8. [Testing & Debugging](#testing--debugging)

---

## Overview

**Snippe** is a Tanzania-based payment gateway that aggregates multiple payment methods into a single integration point.

### Supported Payment Methods
1. **Card** - Visa, Mastercard (redirects to hosted checkout)
2. **M-Pesa** - Mobile money via USSD push
3. **Airtel Money** - Airtel's mobile wallet
4. **USSD** - Unstructured Supplementary Service Data
5. **QR Code** - Scan-to-pay via dynamic QR codes

### Key Features in Your Implementation
- ✅ JWT token authentication
- ✅ Webhook signature verification (HMAC-SHA256)
- ✅ Automatic order creation on payment success
- ✅ Phone number normalization for Tanzania
- ✅ Metadata tracking with order references
- ✅ Idempotency keys to prevent duplicate payments

---

## Setup & Configuration

### 1. Get Snippe Credentials

Visit **Snippe Dashboard**: (Contact Snippe support for access)

You'll receive:
- **Client ID** (Optional - used in some integrations)
- **API Key** (Bearer token for authentication)
- **Webhook Secret** (HMAC-SHA256 key for signature verification)
- **Base URL** (Usually: `https://api.snippe.sh`)

### 2. Configure Environment Variables

Create `.env` file in `backend/` folder:

```env
# Snippe Payment Gateway Configuration
SNIPPE_API_KEY=your_api_key_here
SNIPPE_BASE_URL=https://api.snippe.sh
SNIPPE_WEBHOOK_SECRET=your_webhook_secret_here

# Application URLs
FRONTEND_URL=http://localhost:5173        # For development
WEBHOOK_URL=https://yourdomain.com/api/webhooks/payment-webhook  # For production

# Server Configuration
PORT=5002
NODE_ENV=development
```

### 3. Verify Configuration

The backend logs warnings if configuration is missing:

```
⚠️ WARNING: SNIPPE_API_KEY is not configured in environment variables
Make sure your .env file is properly configured with SNIPPE_API_KEY
```

---

## Authentication

### Bearer Token Authentication

All Snippe API requests require a Bearer token in the Authorization header:

```javascript
// Example from snippeService.js
const client = axios.create({
  baseURL: 'https://api.snippe.sh/v1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  }
});
```

### Token Lifecycle in Your System

No token refresh needed - your API key is used directly for all requests. The key can be rotated in the Snippe Dashboard if compromised.

---

## Core Endpoints

### 1. Create Payment - `POST /payments`

**Description:** Initiates a new payment transaction

**Request Headers:**
```http
Content-Type: application/json
Authorization: Bearer <YOUR_API_KEY>
Idempotency-Key: <UNIQUE_ORDER_REFERENCE>
```

**Request Body (Card Payment):**

```json
{
  "payment_type": "card",
  "details": {
    "amount": 50000,
    "currency": "TZS",
    "redirect_url": "http://localhost:5173/payment-success?orderRef=ORD-12345",
    "cancel_url": "http://localhost:5173/payment-failed?orderRef=ORD-12345"
  },
  "phone_number": "255712345678",
  "customer": {
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "address": "123 Main Street",
    "city": "Dar es Salaam",
    "state": "DSM",
    "postcode": "14101",
    "country": "TZ"
  },
  "metadata": {
    "order_id": "ORD-12345"
  },
  "webhook_url": "https://yourdomain.com/api/webhooks/payment-webhook"
}
```

**Request Body (Mobile Money/USSD):**

```json
{
  "payment_type": "mobile",
  "details": {
    "amount": 50000,
    "currency": "TZS"
  },
  "phone_number": "255712345678",
  "customer": {
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com"
  },
  "metadata": {
    "order_id": "ORD-12345"
  },
  "webhook_url": "https://yourdomain.com/api/webhooks/payment-webhook"
}
```

**Response (Success - 200/201):**

```json
{
  "success": true,
  "data": {
    "reference": "SNP-ABC123XYZ789",
    "payment_url": "https://checkout.snippe.com/pay/SNP-ABC123XYZ789",
    "payment_qr_code": "data:image/png;base64,iVBORw0KGg...",
    "status": "initiated",
    "amount": {
      "value": 50000,
      "currency": "TZS"
    }
  }
}
```

**Response (Error - 400+):**

```json
{
  "success": false,
  "error_code": "INVALID_AMOUNT",
  "message": "Amount must be greater than 0"
}
```

**Your Implementation in paymentController.js:**

```javascript
// Create payment request
const result = await snippeService.createPayment({
  amount: 50000,
  orderReference: "ORD-12345",
  paymentType: 'card',  // or 'mobile'
  customerFirstName: "John",
  customerLastName: "Doe",
  customerEmail: "john@example.com",
  customerPhoneNumber: "255712345678",
  customerAddress: "123 Main Street",
  // ...
});

// Returns { success, paymentUrl, paymentQrCode, paymentReference, status }
```

---

### 2. Get Payment Status - `GET /payments/{reference}`

**Description:** Check the status of a payment

**Request:**
```http
GET https://api.snippe.sh/v1/payments/SNP-ABC123XYZ789
Authorization: Bearer <YOUR_API_KEY>
Content-Type: application/json
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "pay_123456",
    "reference": "SNP-ABC123XYZ789",
    "status": "completed",
    "amount": {
      "value": 50000,
      "currency": "TZS"
    },
    "customer": {
      "email": "john@example.com",
      "phone_number": "255712345678"
    },
    "metadata": {
      "order_id": "ORD-12345"
    },
    "completed_at": "2026-03-31T14:30:00Z"
  }
}
```

**Possible Status Values:**
- `initiated` - Payment created, awaiting completion
- `pending` - Payment in progress
- `completed` - Payment successful ✅
- `failed` - Payment failed ❌
- `cancelled` - Customer cancelled payment
- `expired` - Payment link expired

**Your Implementation in snippeService.js:**

```javascript
const result = await snippeService.getPaymentStatus("SNP-ABC123XYZ789");
// Returns { success, status, amount, currency, customerEmail, customerPhone }
```

---

## Payment Flow

### Complete User Journey with Snippe

```
┌─────────────────────────────────────────────────────┐
│ 1. CUSTOMER JOURNEY                                  │
└─────────────────────────────────────────────────────┘

Customer                    Frontend                    Backend                    Snippe
   │                           │                          │                         │
   ├─ Add items to cart ────────>                        │                         │
   │                           │                          │                         │
   ├─ Click "Pay Now" ─────────>                        │                         │
   │                           │                          │                         │
   ├─ Enter Details ──────────>                         │                         │
   │                           │                          │                         │
   ├─ Click "Checkout" ───────────────> POST /api/payments/initiate               │
   │                           │          │               │                        │
   │                           │          ├─ Validate ────────────────────────>   │
   │                           │          │                                  │    │
   │                           │          │<─── CREATE /payments ──────────────>  │
   │                           │          │                                  │    │
   │                           │          │<─ { paymentUrl, reference } ───────<  │
   │                           │          │                                       │
   │                           │<─ Response with payment URL ────────────────────│
   │                           │                          │                       │
   ├─ Redirected to Snippe ───────────────────────────────────────────────────> │
   │                                                     │                       │
   ├─ Select payment method (Card/M-Pesa) ───────────────────────────────────> │
   │                                                     │                       │
   ├─ Complete payment ───────────────────────────────────────────────────────> │
   │                                                     │                       │
   │                        Snippe processes payment...   │                       │
   │                                                     │                       │
   │                             Webhook Callback        │                       │
   │                                                     │<─────────────────────<
   │                             POST /webhooks/payment-webhook
   │                             { type: 'payment.completed', data: {...} }
   │                                                     │
   │                             Verify signature (HMAC-SHA256)
   │                                                     │
   │                             Create Order from Payment
   │                                                     │
   │<──── Redirected to Success Page ────────────────────│
   │     (payment-success?orderRef=ORD-12345)           │
```

### Step-by-Step Implementation

**Step 1: Customer Submits Payment (FRONTEND)**
```typescript
// CheckoutForm.tsx
const handleSubmit = async (e: React.FormEvent) => {
  const response = await paymentService.initiatePayment({
    amount: totalPrice,
    customerName: formData.name,
    customerEmail: formData.email,
    customerPhoneNumber: formData.phone,
    customerAddress: formData.address,
    cartItems: cart,
    orderReference: `ORD-${Date.now()}`
  });
  
  if (response.paymentUrl) {
    window.location.href = response.paymentUrl; // Redirect to Snippe
  }
};
```

**Step 2: Backend Initiates Payment (BACKEND)**
```javascript
// paymentController.js - initiatePayment endpoint
export const initiatePayment = async (req, res) => {
  const { amount, customerName, customerEmail, cartItems, orderReference } = req.body;
  
  // Normalize phone number for Tanzania
  let phoneNumber = customerPhoneNumber.replace(/^\+/, '');
  if (phoneNumber.startsWith('0')) {
    phoneNumber = '255' + phoneNumber.substring(1);
  }
  
  // Call Snippe API
  const result = await snippeService.createPayment({
    amount: Math.round(amount),
    orderReference,
    customerEmail,
    customerPhoneNumber: phoneNumber,
    // ...
  });
  
  // Save pending order (cart) for webhook to use
  await savePendingOrder(orderReference, { cartItems, customerAddress });
  
  // Save payment record for tracking
  await savePaymentRecord({...});
  
  // Return payment URL to frontend
  res.json({
    success: true,
    paymentData: {
      paymentUrl: result.paymentUrl,
      paymentQrCode: result.paymentQrCode
    }
  });
};
```

**Step 3: Customer Completes Payment at Snippe**
- Customer fills payment details on Snippe's hosted checkout
- Payment gateway processes the transaction
- Customer sees confirmation or rejection

**Step 4: Snippe Sends Webhook (BACKEND)**
```javascript
// webhookController.js - handlePaymentWebhook
POST /api/webhooks/payment-webhook
{
  "type": "payment.completed",
  "data": {
    "reference": "SNP-ABC123XYZ789",
    "status": "completed",
    "amount": { "value": 50000, "currency": "TZS" },
    "customer": { "email": "john@example.com", "phone_number": "255712345678" },
    "metadata": { "order_id": "ORD-12345" }
  }
}
```

**Step 5: Backend Verifies & Creates Order**
```javascript
// Verify webhook signature (HMAC-SHA256)
const isValid = snippeService.verifyWebhookSignature(
  JSON.stringify(payload),
  signature,
  process.env.SNIPPE_WEBHOOK_SECRET
);

if (isValid && payload.type === 'payment.completed') {
  // Create order in backend/data/orders.json
  const order = await createOrderFromPayment(paymentData, cartItems);
  
  // Return success to Snippe (always 2xx)
  res.json({ success: true, message: 'Payment received' });
}
```

**Step 6: Customer Sees Confirmation**
- Frontend redirects to success page
- Order appears in Admin Dashboard
- Customer receives confirmation email (optional)

---

## Webhook Handling

### What Are Webhooks?

Webhooks are **server-to-server HTTP callbacks** that Snippe sends to your backend when a payment event occurs.

**Why Important:**
- Confirms payment success reliably (not dependent on customer returning)
- Happens asynchronously in the background
- If customer closes browser after payment, webhook still processes order

### Webhook Events Your System Handles

#### 1. `payment.completed` Event

**When Sent:** Payment successful and cleared

**Webhook Payload:**
```json
{
  "type": "payment.completed",
  "data": {
    "id": "pay_123456",
    "reference": "SNP-ABC123XYZ789",
    "status": "completed",
    "amount": {
      "value": 50000,
      "currency": "TZS"
    },
    "customer": {
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone_number": "255712345678"
    },
    "metadata": {
      "order_id": "ORD-12345"
    },
    "external_reference": "ext_ref_123",
    "completed_at": "2026-03-31T14:30:00Z"
  }
}
```

**Your Handler (webhookController.js):**
```javascript
async function handlePaymentCompleted(data, res) {
  // Extract order reference
  const orderReference = data.metadata?.order_id || data.reference;
  
  // Get pending cart items
  const pendingOrder = await getAndRemovePendingOrder(orderReference);
  
  // Update payment status
  await updatePaymentStatus(data.reference, 'completed');
  
  // Create order (ONLY on success!)
  const order = await createOrderFromPayment({
    paymentReference: data.reference,
    amount: data.amount.value,
    status: 'PAID',  // Mark as paid
    customerName: `${data.customer.first_name} ${data.customer.last_name}`,
    customerEmail: data.customer.email,
    // ...
  }, pendingOrder.cartItems);
  
  console.log(`🎉 Order created: ${order.id}`);
  
  // IMPORTANT: Always return 2xx to acknowledge receipt
  res.json({ success: true, message: 'Payment received and processed' });
}
```

#### 2. `payment.failed` Event

**When Sent:** Payment was rejected or customer cancelled

**Webhook Payload:**
```json
{
  "type": "payment.failed",
  "data": {
    "reference": "SNP-ABC123XYZ789",
    "status": "failed",
    "amount": {
      "value": 50000,
      "currency": "TZS"
    },
    "customer": { "email": "john@example.com" },
    "metadata": { "order_id": "ORD-12345" },
    "failure_reason": "Card declined",
    "failed_at": "2026-03-31T14:25:00Z"
  }
}
```

**Your Handler:**
```javascript
async function handlePaymentFailed(data, res) {
  const orderReference = data.metadata?.order_reference || data.reference;
  
  // Update payment status only (DO NOT create order)
  await updatePaymentStatus(data.reference, 'failed');
  
  console.log(`❌ Payment failed: ${data.failure_reason}`);
  
  // IMPORTANT: Always return 2xx
  res.json({ success: true, message: 'Payment failure received' });
}
```

### Webhook Signature Verification (HMAC-SHA256)

**Why:** Ensure webhook came from Snippe, not a malicious third party

**How It Works:**

1. Snippe creates a signature:
```
signature = HMAC-SHA256(webhook_payload, webhook_secret)
```

2. Snippe sends signature in header:
```http
X-Webhook-Signature: abc123def456...
```

3. Your backend verifies:
```javascript
// snippeService.js
verifyWebhookSignature(payload, signature, secret) {
  // Recreate signature with your secret
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  // Compare signatures
  return hash === signature;  // Must match!
}
```

**Implementation in Your System (webhookController.js):**
```javascript
const payload = req.body;
const signature = req.headers['x-webhook-signature'];

// Verify if signature is provided
if (signature && process.env.SNIPPE_WEBHOOK_SECRET) {
  const isValid = snippeService.verifyWebhookSignature(
    JSON.stringify(payload),
    signature,
    process.env.SNIPPE_WEBHOOK_SECRET
  );
  
  if (!isValid) {
    return res.status(401).json({
      success: false,
      message: 'Signature validation failed'
    });
  }
}
```

### Setting Up Webhook URL in Snippe Dashboard

1. Log in to Snippe Dashboard
2. Go to **Settings → Webhooks** (or **Integration**)
3. Add webhook endpoint: `https://yourdomain.com/api/webhooks/payment-webhook`
4. Select events to subscribe to:
   - ✅ `payment.completed`
   - ✅ `payment.failed`
5. Save webhook secret (use in `.env` as `SNIPPE_WEBHOOK_SECRET`)

**For Development (Local Testing):**
Use ngrok to create public tunnel to localhost:
```bash
ngrok http 5002
# Webhook URL: https://abc123.ngrok.io/api/webhooks/payment-webhook
```

### Webhook Response Requirements

**⚠️ IMPORTANT:** Always respond with 2xx status code, even if handling fails!

```javascript
// ✅ CORRECT: Always 2xx
res.status(200).json({ success: true, message: '...' });

// ❌ WRONG: Don't return 4xx or 5xx for webhook handling issues
// This causes Snippe to retry endlessly
res.status(500).json({ error: '...' });  // ❌ BAD
```

If error occurs, Snippe retries with exponential backoff:
- Attempt 1: Immediately
- Attempt 2: 30 seconds
- Attempt 3: 5 minutes
- Attempt 4: 30 minutes
- Attempt 5: 1 hour
- Attempt 6: 6 hours
- Attempt 7: 24 hours

---

## Error Handling

### Common Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `INVALID_AMOUNT` | Amount is 0 or negative | Ensure amount > 0 |
| `INVALID_CURRENCY` | Invalid currency code | Use 'TZS' for Tanzania |
| `INVALID_EMAIL` | Email format invalid | Validate email format |
| `INVALID_PHONE` | Phone number format invalid | Use format: 255712345678 |
| `INSUFFICIENT_FUNDS` | Card/wallet has insufficient funds | Customer needs more funds |
| `CARD_DECLINED` | Card was declined | Try different payment method |
| `AUTHENTICATION_FAILED` | Invalid API key | Check SNIPPE_API_KEY in .env |
| `NETWORK_ERROR` | Connection to Snippe failed | Retry after delay |
| `DUPLICATE_REQUEST` | Idempotency key already used | Use unique orderReference |

### Error Handling in Your Implementation

**Backend Error Handling (snippeService.js):**
```javascript
async createPayment(paymentData) {
  try {
    const response = await this.client.post('/payments', payload);
    return {
      success: true,
      paymentUrl: response.data.data.payment_url,
      // ...
    };
  } catch (error) {
    console.error('❌ Snippe payment creation failed');
    console.error('Status:', error.response?.status);
    console.error('Error Code:', error.response?.data?.error_code);
    console.error('Message:', error.response?.data?.message);
    
    return {
      success: false,
      message: error.response?.data?.message || error.message
    };
  }
}
```

**Frontend Error Handling (paymentService.ts):**
```typescript
public async initiatePayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
  try {
    const response = await axios.post('/api/payments/initiate', paymentData);
    
    if (response.data.success) {
      return {
        success: true,
        paymentUrl: response.data.paymentData.paymentUrl,
        // ...
      };
    } else {
      throw new Error(response.data.message || 'Payment initiation failed');
    }
  } catch (error) {
    console.error('Payment initiation error:', error);
    return {
      success: false,
      message: 'Failed to initiate payment. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

### User-Friendly Error Messages

**DO:**
```typescript
// ✅ Clear to user
"Your card was declined. Please try another payment method."
"Payment failed. Please check your phone number and try again."
```

**DON'T:**
```typescript
// ❌ Technical jargon
"INVALID_PHONE: Phone number does not match regex pattern"
"AUTHENTICATION_FAILED: Bearer token expired"
```

---

## Testing & Debugging

### 1. Testing Payment Flow Locally

**Prerequisites:**
- Backend running: `cd backend && npm run dev` (port 5002)
- Frontend running: `npm run dev` (port 5173)
- `.env` file configured with Snippe credentials

**Steps:**
1. Browse to frontend: `http://localhost:5173`
2. Add products to cart
3. Click "Proceed to Checkout"
4. Enter test payment details
5. Click "Pay Now"
6. You'll be redirected to Snippe checkout

**Using Snippe Test Credentials:**
Contact Snippe support for **test API key** and **test webhook secret**.

Test cards provided by Snippe:
- **Visa Success:** 4111 1111 1111 1111 (any future date, any CVV)
- **Mastercard Success:** 5555 5555 5555 4444
- **Card Decline:** 4000 0000 0000 0002

### 2. Debugging Webhook Issues

**Check webhook logs:**
```bash
# Terminal where backend is running
# Look for lines like:
# 🔔 Webhook received from Snippe
# Event Type: payment.completed
```

**Verify webhook signature manually:**
```javascript
// Node.js console
const crypto = require('crypto');
const payload = { /* webhook payload */ };
const secret = 'your_webhook_secret';

const hash = crypto
  .createHmac('sha256', secret)
  .update(JSON.stringify(payload))
  .digest('hex');

console.log('Calculated:', hash);
console.log('Received:', '<signature_from_header>');
console.log('Match:', hash === '<signature_from_header>');
```

**Test webhook locally with ngrok:**
```bash
# Terminal 1: Start ngrok tunnel
ngrok http 5002

# Terminal 2: Your backend
cd backend && npm run dev

# Terminal 3: Send test webhook
curl -X POST https://abc123.ngrok.io/api/webhooks/payment-webhook \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: abc123..." \
  -d '{
    "type": "payment.completed",
    "data": {
      "reference": "SNP-TEST123",
      "status": "completed",
      "amount": { "value": 50000, "currency": "TZS" },
      "customer": { "email": "test@example.com", "phone_number": "255712345678" },
      "metadata": { "order_id": "ORD-TEST" }
    }
  }'
```

### 3. Checking Payment Status Manually

**Via Terminal:**
```bash
curl -X GET https://api.snippe.sh/v1/payments/SNP-ABC123XYZ789 \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

**Via Frontend:**
```typescript
// In browser console
const response = await fetch('/api/payments/status/SNP-ABC123XYZ789');
const data = await response.json();
console.log(data);
```

### 4. Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| `AUTHENTICATION_FAILED` on payment initiation | Invalid API key | Check `SNIPPE_API_KEY` in .env |
| Webhook returns 401 | Signature verification failed | Verify `SNIPPE_WEBHOOK_SECRET` is correct |
| Payment redirects to error page | Phone number format wrong | Ensure format: 255712345678 (not 0712...) |
| No order appears after payment | Webhook not received | Check webhook URL in Snippe Dashboard, test with ngrok |
| Payment marked as pending forever | No webhook handling | Ensure middleware and routes configured |
| `INVALID_AMOUNT` error | Amount sent as decimal | Ensure amount is integer `Math.round(amount)` |
| Duplicate `DUPLICATE_REQUEST` errors | Same orderReference used | Generate unique orderRef: `ORD-${Date.now()}` |

### 5. Monitoring & Logging

**What to Log in Production:**
```javascript
console.log(`[PAYMENT] Initiated - OrderRef: ${orderRef}, Amount: ${amount}, Phone: ${phone}`);
console.log(`[PAYMENT] Success - Reference: ${paymentRef}, Status: ${status}`);
console.error(`[PAYMENT] Failed - OrderRef: ${orderRef}, Reason: ${reason}`);
console.log(`[WEBHOOK] Received - Event: ${eventType}, PaymentRef: ${paymentRef}`);
console.log(`[WEBHOOK] Verified - Signature valid for reference: ${paymentRef}`);
```

**Monitoring Questions to Answer:**
- How many payments initiated per day?
- What's the success rate?
- Which payment methods are most used?
- How long does average payment take?
- What are most common failure reasons?

---

## Production Checklist

Before going live:

- [ ] Get **LIVE** Snippe credentials (different from test)
- [ ] Update `SNIPPE_API_KEY` with live key
- [ ] Update `SNIPPE_WEBHOOK_SECRET` with live secret
- [ ] Set `FRONTEND_URL` to production domain
- [ ] Set `WEBHOOK_URL` to production endpoint (HTTPS required!)
- [ ] Deploy backend to production server
- [ ] Configure webhook in Snippe Dashboard to point to production URL
- [ ] Test complete payment flow on live
- [ ] Enable HTTPS on all endpoints
- [ ] Set `NODE_ENV=production` in backend .env
- [ ] Set up error monitoring/alerting (New Relic, Sentry, etc.)
- [ ] Move console.log to proper logging framework (Winston, Pino)
- [ ] Implement rate limiting
- [ ] Implement admin JWT authentication (replace localStorage)
- [ ] Backup payment records regularly
- [ ] Set up order tracking page for customers
- [ ] Create payment status API for order queries

---

## Contact & Support

**Snippe Support:**
- Dashboard: (Request access from Snippe)
- Email: support@snippe.com (or from your onboarding)
- Webhook Logs: Available in Snippe Dashboard under "Logs" or "Webhooks"

**Your System Issues:**
- Backend logs: Terminal where backend is running
- Frontend errors: Browser DevTools Console
- Payment records: `backend/data/payments.json`
- Order records: `backend/data/orders.json`

---

## Version History

| Date | Changes |
|------|---------|
| Mar 31, 2026 | Initial documentation based on current implementation |
| | Added all error codes and webhook event types |
| | Added local testing guide with ngrok |

---

*This documentation reflects your current SMATQ Store implementation with Snippe v1 API integration.*
