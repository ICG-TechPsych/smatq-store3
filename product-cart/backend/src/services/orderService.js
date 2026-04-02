import pool from '../db/database.js';

/**
 * Save pending order (cart + customer) before payment - for webhook to use
 */
export const savePendingOrder = async (orderReference, { cartItems, customerAddress }) => {
  try {
    await pool.query(
      'INSERT INTO pending_orders (order_reference, cart_items, customer_address) VALUES ($1, $2, $3) ON CONFLICT (order_reference) DO UPDATE SET cart_items = $2, customer_address = $3',
      [orderReference, JSON.stringify(cartItems), customerAddress || '']
    );
  } catch (error) {
    console.error('Error saving pending order:', error);
    throw error;
  }
};

/**
 * Get and remove pending order (used by webhook after payment)
 */
export const getAndRemovePendingOrder = async (orderReference) => {
  try {
    const result = await pool.query(
      'SELECT cart_items, customer_address FROM pending_orders WHERE order_reference = $1',
      [orderReference]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const entry = result.rows[0];
    const pendingOrder = {
      cartItems: entry.cart_items || [],
      customerAddress: entry.customer_address || '',
    };

    // Delete after retrieval
    await pool.query('DELETE FROM pending_orders WHERE order_reference = $1', [orderReference]);

    return pendingOrder;
  } catch (error) {
    console.error('Error getting pending order:', error);
    return null;
  }
};

/**
 * Save payment record with Snippe response
 */
export const savePaymentRecord = async (paymentData) => {
  try {
    const paymentId = paymentData.id || paymentData.orderReference;

    const result = await pool.query(
      `INSERT INTO payments (id, order_reference, payment_reference, amount, currency, status, customer_name, customer_email, customer_phone, channel, raw_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO UPDATE SET status = $6, updated_at = CURRENT_TIMESTAMP
       RETURNING id, order_reference, payment_reference, amount, currency, status, customer_name, customer_email, customer_phone, channel`,
      [
        paymentId,
        paymentData.orderReference,
        paymentData.paymentReference,
        paymentData.amount,
        paymentData.currency || 'TZS',
        paymentData.status,
        paymentData.customerName,
        paymentData.customerEmail,
        paymentData.customerPhoneNumber,
        paymentData.channel,
        JSON.stringify(paymentData),
      ]
    );

    const row = result.rows[0];
    return {
      id: row.id,
      orderReference: row.order_reference,
      paymentReference: row.payment_reference,
      amount: row.amount,
      currency: row.currency,
      status: row.status,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhoneNumber: row.customer_phone,
      channel: row.channel,
    };
  } catch (error) {
    console.error('Error saving payment record:', error);
    throw error;
  }
};

/**
 * Save order only if payment is successful
 */
export const createOrderFromPayment = async (paymentData, cartItems) => {
  try {
    // Generate unique order token
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderToken = `ORD-${timestamp}-${random}`;

    const result = await pool.query(
      `INSERT INTO orders (id, customer_name, customer_email, customer_phone, location, items, total_price, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, customer_name, customer_email, customer_phone, location, items, total_price, status, created_at`,
      [
        orderToken,
        paymentData.customerName,
        paymentData.customerEmail,
        paymentData.customerPhoneNumber,
        paymentData.customerAddress || '',
        JSON.stringify(cartItems),
        paymentData.amount,
        'completed',
      ]
    );

    const row = result.rows[0];
    const order = {
      id: row.id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhoneNumber: row.customer_phone,
      location: row.location,
      items: row.items,
      totalPrice: parseFloat(row.total_price),
      status: row.status,
      createdAt: row.created_at,
    };

    console.log(`✅ Order created: ${orderToken}`);
    return order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Get all orders (for admin API)
 */
export const getOrders = async () => {
  try {
    const result = await pool.query(
      'SELECT id, customer_name, customer_email, customer_phone, location, items, total_price, status, created_at, updated_at FROM orders ORDER BY created_at DESC'
    );

    return result.rows.map(row => ({
      id: row.id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhoneNumber: row.customer_phone,
      location: row.location,
      items: row.items,
      totalPrice: parseFloat(row.total_price),
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (error) {
    console.error('Error getting orders:', error);
    return [];
  }
};

/**
 * Update order status (for admin)
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    const result = await pool.query(
      `UPDATE orders SET status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 OR customer_name = $1
       RETURNING id, customer_name, customer_email, customer_phone, location, items, total_price, status, created_at, updated_at`,
      [orderId, status]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhoneNumber: row.customer_phone,
      location: row.location,
      items: row.items,
      totalPrice: parseFloat(row.total_price),
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

/**
 * Get payment records
 */
export const getPaymentRecords = async () => {
  try {
    const result = await pool.query(
      'SELECT id, order_reference, payment_reference, amount, currency, status, customer_name, created_at FROM payments ORDER BY created_at DESC'
    );

    return result.rows.map(row => ({
      id: row.id,
      orderReference: row.order_reference,
      paymentReference: row.payment_reference,
      amount: parseFloat(row.amount),
      currency: row.currency,
      status: row.status,
      customerName: row.customer_name,
      createdAt: row.created_at,
    }));
  } catch (error) {
    console.error('Error getting payment records:', error);
    return [];
  }
};
};

/**
 * Update payment status from webhook
 */
export const updatePaymentStatus = async (paymentReference, status) => {
  try {
    await ensureDataDir();
    const data = await fs.readFile(PAYMENTS_FILE, 'utf-8');
    let payments = JSON.parse(data);
    
    const payment = payments.find(p => p.paymentReference === paymentReference);
    if (payment) {
      payment.status = status;
      payment.updatedAt = new Date().toISOString();
      await fs.writeFile(PAYMENTS_FILE, JSON.stringify(payments, null, 2));
    }
    
    return payment;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};
