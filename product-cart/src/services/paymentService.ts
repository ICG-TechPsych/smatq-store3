import type { CartItem } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

export const PaymentService = {
  /**
   * Initiate payment with backend
   */
  async initiatePayment(paymentData: {
    amount: number;
    customerName: string;
    customerEmail: string;
    customerPhoneNumber: string;
    cartItems: CartItem[];
    orderReference: string;
    paymentType?: 'card' | 'mobile';
  }) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Payment initiation failed');
      }

      return result.paymentData;
    } catch (error) {
      console.error('Payment initiation error:', error);
      throw error;
    }
  },

  /**
   * Check payment status
   */
  async checkPaymentStatus(paymentId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/status/${paymentId}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error('Failed to check payment status');
      }

      return result.payment;
    } catch (error) {
      console.error('Payment status check error:', error);
      throw error;
    }
  }
};

export default PaymentService;
