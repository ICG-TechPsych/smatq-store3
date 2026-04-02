import snippeService from '../services/snippeService.js';
import { 
  savePaymentRecord, 
  createOrderFromPayment, 
  updatePaymentStatus,
  getAndRemovePendingOrder 
} from '../services/orderService.js';

/**
 * Handle Snippe webhook callbacks
 */
export const handlePaymentWebhook = async (req, res) => {
  try {
    const payload = req.body;
    const signature = req.headers['x-webhook-signature'];

    console.log(`\n🔔 Webhook received from Snippe`);
    console.log(`Event Type: ${payload.type}`);

    // Verify webhook signature if available
    if (signature && process.env.SNIPPE_WEBHOOK_SECRET) {
      const payloadString = JSON.stringify(payload);
      const isValid = snippeService.verifyWebhookSignature(
        payloadString,
        signature,
        process.env.SNIPPE_WEBHOOK_SECRET
      );
      
      if (!isValid) {
        console.warn('⚠️ Webhook signature validation failed');
        return res.status(401).json({
          success: false,
          message: 'Signature validation failed'
        });
      }
    }

    const { type, data } = payload;

    // Handle payment.completed event
    if (type === 'payment.completed') {
      return handlePaymentCompleted(data, res);
    }

    // Handle payment.failed event
    if (type === 'payment.failed') {
      return handlePaymentFailed(data, res);
    }

    // Handle other events
    console.log(`ℹ️ Unhandled event type: ${type}`);
    
    // Always return 2xx to acknowledge receipt
    res.json({
      success: true,
      message: `Event ${type} received and acknowledged`
    });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    // Return 2xx even on error to prevent retries
    res.status(200).json({
      success: false,
      message: 'Webhook processed with error'
    });
  }
};

/**
 * Handle successful payment
 */
async function handlePaymentCompleted(data, res) {
  try {
    console.log(`✅ Payment completed: ${data.reference}`);
    console.log(`   Amount: TSh ${data.amount.value}`);
    console.log(`   Customer: ${data.customer?.first_name}`);

    // Get order reference from metadata (order_id) or use payment reference
    const orderReference = data.metadata?.order_id || data.metadata?.order_reference || data.reference;

    // Fetch cart items from pending order (saved at payment initiation)
    const pendingOrder = await getAndRemovePendingOrder(orderReference);
    const cartItems = pendingOrder?.cartItems || [];
    const customerAddress = pendingOrder?.customerAddress || '';

    // Update payment status
    await updatePaymentStatus(data.reference, 'completed');

    // Create order only on successful payment
    if (data.status === 'completed') {
      try {
        const order = await createOrderFromPayment(
          {
            id: data.id,
            orderReference: orderReference,
            paymentReference: data.reference,
            amount: data.amount?.value ?? data.amount,
            currency: data.amount?.currency || 'TZS',
            status: data.status,
            customerName: `${data.customer?.first_name || 'Unknown'} ${data.customer?.last_name || ''}`.trim(),
            customerEmail: data.customer?.email || '',
            customerPhoneNumber: data.customer?.phone_number || data.customer?.phone || '',
            customerAddress: customerAddress,
            channel: 'Snippe',
            externalReference: data.external_reference
          },
          cartItems
        );

        console.log(`🎉 Order created: ${order.id}`);
      } catch (orderError) {
        console.error('Error creating order:', orderError);
      }
    }

    res.json({
      success: true,
      message: 'Payment received and processed'
    });
  } catch (error) {
    console.error('Error handling payment completed:', error);
    res.status(200).json({
      success: false,
      message: 'Payment processed with error'
    });
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(data, res) {
  try {
    console.log(`❌ Payment failed: ${data.reference}`);
    console.log(`   Reason: ${data.failure_reason || 'Unknown'}`);

    const orderReference = data.metadata?.order_reference || data.reference;

    // Update payment status to failed
    await updatePaymentStatus(data.reference, 'failed');

    // Save payment record for tracking
    await savePaymentRecord({
      id: data.id,
      orderReference: orderReference,
      paymentReference: data.reference,
      amount: data.amount.value,
      currency: data.amount.currency,
      status: 'failed',
      customerName: `${data.customer?.first_name || 'Unknown'} ${data.customer?.last_name || ''}`.trim(),
      customerEmail: data.customer?.email || '',
      customerPhoneNumber: data.customer?.phone_number || '',
      failureReason: data.failure_reason || 'Payment declined'
    });

    res.json({
      success: true,
      message: 'Payment failure recorded'
    });
  } catch (error) {
    console.error('Error handling payment failed:', error);
    res.status(200).json({
      success: false,
      message: 'Error recorded payment failure'
    });
  }
}

/**
 * Get webhook status (for testing)
 */
export const getWebhookStatus = (req, res) => {
  res.json({
    success: true,
    message: 'Webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
};
