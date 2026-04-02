import axios from 'axios';
import crypto from 'crypto';

/**
 * Snippe Payment Service
 * Handles all interactions with Snippe payment gateway
 */
class SnippeService {
  constructor() {
    this.apiKey = process.env.SNIPPE_API_KEY;
    this.baseUrl = process.env.SNIPPE_BASE_URL || 'https://api.snippe.sh';
    
    if (!this.apiKey) {
      console.warn('⚠️ WARNING: SNIPPE_API_KEY is not configured in environment variables');
      console.warn('Make sure your .env file is properly configured with SNIPPE_API_KEY');
    }

    // Initialize axios instance with default headers
    // Snippe API: Base URL + /v1 (docs: https://api.snippe.sh/v1/payments)
    const finalBaseUrl = this.baseUrl.includes('/v1') 
      ? this.baseUrl.replace(/\/$/, '')
      : this.baseUrl.replace(/\/$/, '') + '/v1';
    
    this.client = axios.create({
      baseURL: finalBaseUrl,
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      }
    });
  }

  /**
   * Create a payment with Snippe
   * @param {Object} paymentData - Payment details
   * @returns {Promise<Object>} Payment response with redirect URL
   */
  async createPayment(paymentData) {
    let payload = null; // Define outside try-catch for error logging
    
    try {
      const {
        amount,
        orderReference,
        customerFirstName = 'Customer',
        customerLastName = 'Name',
        customerEmail,
        customerPhoneNumber,
        customerAddress = '123 Main Street',
        customerCity = 'Dar es Salaam',
        customerState = 'DSM',
        customerPostcode = '14101',
        customerCountry = 'TZ',
        currency = 'TZS',
        paymentType = 'card'  // 'card' | 'mobile' (USSD push)
      } = paymentData;

      console.log(`💳 Creating Snippe ${paymentType} payment for order: ${orderReference}`);
      console.log(`Amount: ${currency} ${amount}`);

      // Validate required fields
      if (!amount || !orderReference || !customerEmail) {
        throw new Error('Missing required payment data: amount, orderReference, customerEmail');
      }

      // Phone number is REQUIRED for mobile money
      let phoneNumber = customerPhoneNumber || '255000000000';
      if (paymentType === 'mobile' && !customerPhoneNumber) {
        throw new Error('Phone number is required for mobile money (USSD) payments');
      }

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const webhookUrl = process.env.WEBHOOK_URL;

      if (paymentType === 'mobile') {
        // Mobile Money / USSD Push: customer receives push on phone
        payload = {
          payment_type: 'mobile',
          details: {
            amount: Math.round(amount),
            currency: currency || 'TZS'
          },
          phone_number: phoneNumber,
          customer: {
            firstname: customerFirstName || 'Customer',
            lastname: customerLastName || 'Name',
            email: customerEmail
          },
          metadata: { order_id: orderReference }
        };
      } else {
        // Card: redirect to Snippe hosted checkout
        const redirectUrl = `${frontendUrl}/payment-success?orderRef=${orderReference}`;
        const cancelUrl = `${frontendUrl}/payment-failed?orderRef=${orderReference}`;
        payload = {
          payment_type: 'card',
          details: {
            amount: Math.round(amount),
            currency: currency || 'TZS',
            redirect_url: redirectUrl,
            cancel_url: cancelUrl
          },
          phone_number: phoneNumber,
          customer: {
            firstname: customerFirstName || 'Customer',
            lastname: customerLastName || 'Name',
            email: customerEmail,
            address: customerAddress,
            city: customerCity,
            state: customerState,
            postcode: customerPostcode,
            country: customerCountry
          },
          metadata: { order_id: orderReference }
        };
      }

      if (webhookUrl && webhookUrl.startsWith('https://')) {
        payload.webhook_url = webhookUrl;
        console.log('✅ Webhook URL configured:', webhookUrl);
      } else {
        console.log('⚠️  Webhook URL not configured with HTTPS - skipping webhooks for development');
      }

      // Log the payload for debugging
      console.log('📤 Sending to Snippe API:', JSON.stringify(payload, null, 2));
      console.log('📋 Payload keys:', Object.keys(payload).join(', '));
      console.log('👤 Customer object keys:', Object.keys(payload.customer).join(', '));

      // Prepare request headers with idempotency key
      const requestConfig = {
        headers: {
          'Idempotency-Key': orderReference
        }
      };

      // Call Snippe API to create payment
      // Endpoint: POST /payments (base URL already includes /api/v1)
      const response = await this.client.post('/payments', payload, requestConfig);

      console.log(`✅ Payment created successfully: ${response.data.data?.reference}`);

      const d = response.data.data;
      return {
        success: true,
        paymentReference: d.reference,
        paymentUrl: d.payment_url,
        paymentQrCode: d.payment_qr_code || d.qr_code,
        paymentToken: d.payment_token || d.token,
        status: d.status || 'initiated',
        data: d
      };
    } catch (error) {
      console.error('❌ Snippe payment creation failed');
      console.error('Status:', error.response?.status);
      console.error('Error Code:', error.response?.data?.error_code);
      console.error('Message:', error.response?.data?.message);
      console.error('Full Response:', JSON.stringify(error.response?.data, null, 2));
      if (payload) {
        console.error('Request body:', JSON.stringify(payload, null, 2));
      }
      
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        error: error.response?.data
      };
    }
  }

  /**
   * Get payment status from Snippe
   * @param {string} paymentReference - Snippe payment reference
   * @returns {Promise<Object>} Payment status details
   */
  async getPaymentStatus(paymentReference) {
    try {
      console.log(`🔍 Checking payment status: ${paymentReference}`);

      const response = await this.client.get(`/payments/${paymentReference}`);

      const status = response.data.data.status;
      console.log(`Payment status: ${status}`);

      return {
        success: true,
        paymentReference,
        status,
        amount: response.data.data.amount.value,
        currency: response.data.data.amount.currency,
        customerEmail: response.data.data.customer?.email,
        customerPhone: response.data.data.customer?.phone_number,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ Error fetching payment status:', error.response?.data || error.message);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        error: error.response?.data
      };
    }
  }

  /**
   * Verify webhook signature from Snippe
   * @param {Object} payload - Webhook payload
   * @param {string} signature - Signature from header
   * @param {string} secret - Webhook secret
   * @returns {boolean} Whether signature is valid
   */
  verifyWebhookSignature(payload, signature, secret) {
    try {
      const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
      
      // Calculate HMAC-SHA256
      const hash = crypto
        .createHmac('sha256', secret)
        .update(payloadString)
        .digest('hex');

      // Compare signatures
      const isValid = hash === signature;
      
      if (!isValid) {
        console.warn('⚠️ Webhook signature verification failed');
      } else {
        console.log('✅ Webhook signature verified');
      }

      return isValid;
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }
}

// Create and export singleton instance
const snippeService = new SnippeService();
export default snippeService;
