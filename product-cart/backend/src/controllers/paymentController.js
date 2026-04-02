import snippeService from '../services/snippeService.js';
import { savePaymentRecord, createOrderFromPayment, savePendingOrder } from '../services/orderService.js';

/**
 * Initiate payment
 */
export const initiatePayment = async (req, res) => {
  try {
    const { 
      amount, 
      customerName, 
      customerEmail, 
      customerPhoneNumber, 
      customerAddress,
      customerCity,
      customerState,
      customerPostcode,
      customerCountry,
      cartItems,
      orderReference,
      paymentType = 'card',  // 'card' | 'mobile' (USSD push)
    } = req.body;

    console.log(`💳 Processing payment for order: ${orderReference}`);
    console.log(`Amount: TSh ${amount}`);

    // Normalize phone number for Tanzania
    // Valid formats: 0712345678, +255712345678, 255712345678
    // All should become: 255712345678
    let phoneNumber = customerPhoneNumber?.trim();
    if (phoneNumber) {
      // Remove + if present
      phoneNumber = phoneNumber.replace(/^\+/, '');
      // If starts with 0, replace with 255
      if (phoneNumber.startsWith('0')) {
        phoneNumber = '255' + phoneNumber.substring(1);
      }
      // If doesn't start with 255, add it (fallback for edge cases)
      if (!phoneNumber.startsWith('255')) {
        phoneNumber = '255' + phoneNumber;
      }
    } else {
      // Default fallback
      phoneNumber = '255000000000';
    }
    
    console.log(`📱 Normalized phone: ${phoneNumber}`);

    // Prepare payment data for Snippe
    const paymentData = {
      amount: Math.round(amount), // Ensure amount is integer
      orderReference,
      paymentType: paymentType === 'mobile' ? 'mobile' : 'card',
      customerFirstName: customerName?.split(' ')[0] || 'Customer',
      customerLastName: customerName?.split(' ')[1] || 'Name',
      customerEmail,
      customerPhoneNumber: phoneNumber,
      customerAddress: customerAddress || '123 Main Street',
      customerCity: customerCity || 'Dar es Salaam',
      customerState: customerState || 'DSM',
      customerPostcode: customerPostcode || '14101',
      customerCountry: customerCountry || 'TZ',
      currency: 'TZS'
    };

    // Call Snippe API
    const result = await snippeService.createPayment(paymentData);

    if (!result.success) {
      console.error('❌ Payment initiation failed:', result.message);
      return res.status(400).json({
        success: false,
        message: 'Payment initiation failed',
        error: result.message
      });
    }

    // Save pending order (cart items) for webhook to use when payment completes
    await savePendingOrder(orderReference, { cartItems: cartItems || [], customerAddress: customerAddress || '' });

    // Save payment record for tracking
    await savePaymentRecord({
      id: result.paymentReference,
      orderReference,
      paymentReference: result.paymentReference,
      amount,
      currency: 'TZS',
      status: result.status || 'pending',
      customerName,
      customerEmail,
      customerPhoneNumber
    });

    console.log(`✅ Payment initiated successfully with reference: ${result.paymentReference}`);

    // Return redirect URL for Snippe checkout
    const responseData = {
      success: true,
      message: 'Payment initiated successfully',
      paymentData: {
        paymentId: result.paymentReference,
        orderReference,
        paymentReference: result.paymentReference,
        paymentUrl: result.paymentUrl,
        paymentQrCode: result.paymentQrCode,
        paymentToken: result.paymentToken,
        status: result.status,
        amount,
      }
    };

    res.json(responseData);
  } catch (error) {
    console.error('❌ Error in initiatePayment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing payment',
      error: error.message
    });
  }
};

/**
 * Check payment status
 */
export const checkPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

    // paymentId is the payment reference from Snippe
    const result = await snippeService.getPaymentStatus(paymentId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to retrieve payment status',
        error: result.message
      });
    }

    res.json({
      success: true,
      payment: {
        id: paymentId,
        status: result.status,
        amount: result.amount,
        currency: result.currency
      }
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking payment status',
      error: error.message
    });
  }
};
