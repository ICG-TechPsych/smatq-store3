import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json');
const PENDING_ORDERS_FILE = path.join(DATA_DIR, 'pending_orders.json');

// Ensure data directory exists
const ensureDataDir = async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error creating data directory:', error);
    }
  }
};

/**
 * Save pending order (cart + customer) before payment - for webhook to use
 */
export const savePendingOrder = async (orderReference, { cartItems, customerAddress }) => {
  try {
    await ensureDataDir();
    let pending = {};
    try {
      const data = await fs.readFile(PENDING_ORDERS_FILE, 'utf-8');
      pending = JSON.parse(data);
    } catch {
      pending = {};
    }
    pending[orderReference] = { cartItems: cartItems || [], customerAddress: customerAddress || '', savedAt: new Date().toISOString() };
    await fs.writeFile(PENDING_ORDERS_FILE, JSON.stringify(pending, null, 2));
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error saving pending order:', error);
    }
  }
};

/**
 * Get and remove pending order (used by webhook after payment)
 */
export const getAndRemovePendingOrder = async (orderReference) => {
  try {
    const data = await fs.readFile(PENDING_ORDERS_FILE, 'utf-8');
    const pending = JSON.parse(data);
    const entry = pending[orderReference];
    delete pending[orderReference];
    await fs.writeFile(PENDING_ORDERS_FILE, JSON.stringify(pending, null, 2));
    return entry;
  } catch {
    return null;
  }
};

/**
 * Save payment record with Snippe response
 */
export const savePaymentRecord = async (paymentData) => {
  try {
    await ensureDataDir();
    let payments = [];
    
    try {
      const data = await fs.readFile(PAYMENTS_FILE, 'utf-8');
      payments = JSON.parse(data);
    } catch (error) {
      payments = [];
    }

    const payment = {
      id: paymentData.id || paymentData.orderReference,
      orderReference: paymentData.orderReference,
      paymentReference: paymentData.paymentReference,
      amount: paymentData.amount,
      currency: paymentData.currency || 'TZS',
      status: paymentData.status,
      customerName: paymentData.customerName,
      customerEmail: paymentData.customerEmail,
      customerPhoneNumber: paymentData.customerPhoneNumber,
      channel: paymentData.channel,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rawData: paymentData
    };

    payments.push(payment);
    await fs.writeFile(PAYMENTS_FILE, JSON.stringify(payments, null, 2));
    return payment;
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
    await ensureDataDir();
    let orders = [];
    
    try {
      const data = await fs.readFile(ORDERS_FILE, 'utf-8');
      orders = JSON.parse(data);
    } catch (error) {
      orders = [];
    }

    // Generate unique order token
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderToken = `ORD-${timestamp}-${random}`;

    const order = {
      id: orderToken,
      orderReference: paymentData.orderReference,
      paymentReference: paymentData.paymentReference,
      customerName: paymentData.customerName,
      customerEmail: paymentData.customerEmail,
      customerPhoneNumber: paymentData.customerPhoneNumber,
      location: paymentData.customerAddress || '',
      items: cartItems,
      totalPrice: paymentData.amount,
      currency: paymentData.currency || 'TZS',
      status: 'completed',
      paymentStatus: paymentData.status,
      channel: paymentData.channel,
      createdAt: new Date().toISOString(),
      notes: `Payment received via ${paymentData.channel || 'Snippe'}`
    };

    orders.push(order);
    await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2));
    
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
    await ensureDataDir();
    const data = await fs.readFile(ORDERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    // File may not exist yet
    try {
      await fs.writeFile(ORDERS_FILE, '[]');
    } catch (e) { /* ignore */ }
    return [];
  }
};

/**
 * Update order status (for admin)
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    await ensureDataDir();
    const data = await fs.readFile(ORDERS_FILE, 'utf-8');
    const orders = JSON.parse(data);
    const order = orders.find((o) => o.id === orderId || o.orderReference === orderId);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
      await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2));
      return order;
    }
    return null;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error updating order:', error);
    }
    throw error;
  }
};

/**
 * Get payment records
 */
export const getPaymentRecords = async () => {
  try {
    await ensureDataDir();
    const data = await fs.readFile(PAYMENTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
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
