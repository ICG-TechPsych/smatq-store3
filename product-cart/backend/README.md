# SMATQ Store - Backend Server

Node.js/Express backend for e-commerce store with ClickPesa payment integration.

## 📋 Features

- ✅ ClickPesa Payment API Integration
- ✅ JWT Token Authentication
- ✅ Webhook Handler for Payment Status Updates
- ✅ Checksum Validation (Security)
- ✅ Order Management (Auto-create on successful payment)
- ✅ Payment Status Tracking
- ✅ Error Handling & Logging
- ✅ Rate Limiting Support
- ✅ CORS Support

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Copy the example and fill in your credentials
cp .env.example .env

# Edit .env with your ClickPesa credentials
# CLICKPESA_CLIENT_ID=...
# CLICKPESA_API_KEY=...
```

### 3. Start Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server will start on `http://localhost:5001`

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.js                      # Express app setup
│   ├── controllers/
│   │   ├── paymentController.js    # Payment endpoint logic
│   │   └── webhookController.js    # Webhook handling logic
│   ├── services/
│   │   ├── clickpesaService.js     # ClickPesa API client
│   │   └── orderService.js         # Order persistence logic
│   ├── routes/
│   │   ├── payments.js             # Payment routes
│   │   └── webhooks.js             # Webhook routes
│   └── middleware/
│       └── validation.js           # Input validation
├── data/
│   ├── orders.json                 # Successful orders (auto-created)
│   └── payments.json               # All payment records
├── .env                            # ⚠️ Local config (never commit)
├── .env.example                    # Template for .env
└── package.json
```

## 🔌 API Endpoints

### Payment Endpoints

#### POST `/api/payments/initiate`
Initiate a payment with ClickPesa

**Request:**
```json
{
  "amount": 50000,
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhoneNumber": "+255700000000",
  "cartItems": [
    { "productId": "1", "quantity": 2 }
  ],
  "orderReference": "ORD-1234567-ABC"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Payment initiated successfully",
  "paymentData": {
    "paymentId": "PAY123...",
    "orderReference": "ORD-1234567-ABC",
    "redirectUrl": "https://checkout.clickpesa.com/...",
    "status": "PENDING"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid amount",
  "errors": ["Valid amount is required"]
}
```

#### GET `/api/payments/status/:paymentId`
Check payment status

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "PAY123...",
    "status": "SUCCESS",
    "isSuccessful": true,
    "amount": 50000,
    "currency": "TZS"
  }
}
```

### Webhook Endpoints

#### POST `/api/webhooks/payment-webhook`
Receive payment status updates from ClickPesa

**Events Handled:**
- `PAYMENT RECEIVED` - Creates order, updates payment status
- `PAYMENT FAILED` - Logs failed payment
- Other events - Acknowledged only

#### GET `/api/webhooks/status`
Check webhook endpoint health

**Response:**
```json
{
  "success": true,
  "message": "Webhook endpoint is active",
  "timestamp": "2024-03-21T10:30:00Z"
}
```

### Utility Endpoints

#### GET `/api/health`
Check server health

**Response:**
```json
{
  "status": "Server is running",
  "timestamp": "2024-03-21T10:30:00Z"
}
```

## 🔐 Security

### 1. Checksum Validation
Every webhook payload is validated:
```javascript
// Automatically validates checksum
if (!clickpesaService.validateChecksum(payload, receivedChecksum)) {
  return reject('Checksum validation failed');
}
```

### 2. JWT Authentication
All API requests use JWT tokens:
- Tokens obtained using Client ID + API Key
- Valid for 1 hour (3600 seconds)
- Automatically refreshed

### 3. Input Validation
All user inputs are validated:
```javascript
- Amount must be > 0
- Email must be valid
- Phone must be non-empty
- Cart items must be provided
```

### 4. Environment Variables
All sensitive data stored in `.env`:
- Never hardcoded
- Never committed to git
- Only backend can read

### 5. CORS Protection
Only allowed origins can access API:
```javascript
cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
})
```

## 📊 Data Storage

### orders.json
Only contains successful payments:
```json
[
  {
    "id": "ORD-1234567-ABC",
    "orderReference": "ORD-1234567-ABC",
    "paymentReference": "pay_abc123...",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhoneNumber": "+255700000000",
    "items": [
      { "productId": "1", "quantity": 2 }
    ],
    "totalPrice": 50000,
    "currency": "TZS",
    "status": "completed",
    "paymentStatus": "SUCCESS",
    "createdAt": "2024-03-21T10:30:00Z"
  }
]
```

### payments.json
All payment attempts (success & failure):
```json
[
  {
    "id": "PAY123...",
    "orderReference": "ORD-1234567-ABC",
    "paymentReference": "pay_abc123...",
    "amount": 50000,
    "currency": "TZS",
    "status": "SUCCESS",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "createdAt": "2024-03-21T10:30:00Z",
    "updatedAt": "2024-03-21T10:31:00Z"
  }
]
```

## 🔄 Payment Flow

```
Frontend (POST /api/payments/initiate)
    ↓
Validation Middleware
    ↓
Payment Controller
    ↓
ClickPesa Service (Get JWT Token)
    ↓
ClickPesa API (Payment Request)
    ↓
Response with Redirect URL
    ↓
Save Payment Record
    ↓
Return to Frontend
    ↓
Frontend Redirects Customer to ClickPesa
    ↓
Customer Completes Payment
    ↓
ClickPesa Sends Webhook (POST /api/webhooks/payment-webhook)
    ↓
Webhook Controller
    ↓
Validate Checksum
    ↓
If SUCCESS: Create Order
    ↓
Update Payment Status
    ↓
Order appears in Admin Dashboard
```

## 🛠️ Development

### Enable Debug Logging
Add to `.env`:
```env
DEBUG=*
```

### Run Tests
```bash
# (Create test file for your implementation)
npm test
```

### Check Logs
Backend logs all operations:
```
💳 Processing payment for order: ORD-1234567-ABC
✅ Payment initiated successfully
🔔 Webhook received: PAYMENT RECEIVED
✅ Checksum validated
🎉 Order created: ORD-1234567-ABC
```

## 🚨 Error Handling

All errors are caught and returned properly:

```javascript
try {
  // Payment processing
} catch (error) {
  return res.status(500).json({
    success: false,
    message: 'Server error...',
    error: process.env.NODE_ENV === 'development' ? error : {}
  });
}
```

## 📈 Scaling Considerations

Current implementation uses JSON files for storage. For production, consider:

1. **Database Integration**
   - PostgreSQL / MongoDB
   - Persistent storage
   - Better querying

2. **Caching**
   - Redis for token caching
   - Reduce API calls

3. **Load Balancing**
   - Multiple server instances
   - Distributed payment handling

4. **Monitoring**
   - Error tracking (Sentry)
   - Performance monitoring
   - Webhook auditing

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 5001
netstat -ano | findstr :5001

# Kill it
taskkill /PID <pid> /F

# Restart
npm run dev
```

### ClickPesa Auth Fails
- ✅ Check Client ID in ClickPesa Dashboard
- ✅ Check API Key (regenerate if needed)
- ✅ Verify credentials in `.env`
- ✅ Check internet connection

### Webhook Not Received
- ✅ Configure webhook URL in ClickPesa Dashboard
- ✅ Use public URL (not localhost)
- ✅ Ensure server is running
- ✅ Check firewall rules

### Checksum Validation Fails
- ✅ Verify `CLICKPESA_CHECKSUM_KEY`
- ✅ Check payload structure
- ✅ Review webhook logs

## 📞 Support

- **ClickPesa Docs:** https://docs.clickpesa.com
- **ClickPesa Support:** support@clickpesa.com
- **General Issues:** Check backend logs and error messages

## 📝 License

Part of SMATQ Store Project

---

**Made with ❤️ for secure e-commerce payments**
