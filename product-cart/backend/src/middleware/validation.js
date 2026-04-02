/**
 * Validate payment initiation request
 */
export const validatePaymentRequest = (req, res, next) => {
  const { amount, customerName, customerEmail, customerPhoneNumber, cartItems, orderReference } = req.body;

  const errors = [];

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    errors.push('Valid amount is required and must be greater than 0');
  }

  if (!customerName || typeof customerName !== 'string' || customerName.trim().length === 0) {
    errors.push('Customer name is required');
  }

  if (!customerEmail || typeof customerEmail !== 'string' || !isValidEmail(customerEmail)) {
    errors.push('Valid customer email is required');
  }

  if (!customerPhoneNumber || typeof customerPhoneNumber !== 'string' || customerPhoneNumber.trim().length === 0) {
    errors.push('Customer phone number is required');
  }

  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    errors.push('Cart items are required');
  }

  if (!orderReference || typeof orderReference !== 'string') {
    errors.push('Order reference is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

/**
 * Validate webhook payload
 */
export const validateWebhookPayload = (req, res, next) => {
  const { event, data } = req.body;

  if (!event || !data) {
    return res.status(400).json({
      success: false,
      message: 'Invalid webhook payload'
    });
  }

  next();
};

/**
 * Simple email validation
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
