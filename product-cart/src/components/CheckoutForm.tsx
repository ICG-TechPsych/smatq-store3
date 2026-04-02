// Checkout form component for users to complete their purchase

import { useState } from 'react';
import { ArrowLeft, Loader, CreditCard, Smartphone } from 'lucide-react';
import PaymentService from '../services/paymentService';
import type { CartItem } from '../types';

type PaymentMethod = 'card' | 'mobile';

interface CheckoutFormProps {
  cartItems: CartItem[];
  totalPrice: number;
  onBack: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ cartItems, totalPrice, onBack }) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Dar es Salaam',
    state: 'DSM',
    postcode: '14101',
    country: 'TZ', // ISO country code, not the full name
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsProcessing(true);

    try {
      // Generate order reference
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      const orderReference = `ORD-${timestamp}-${random}`;

      // Prepare payment data
      // Normalize country to 2-letter ISO code
      let countryCode = formData.country.trim().toUpperCase();
      if (countryCode === 'TANZANIA' || countryCode === 'TZ' || countryCode.length > 2) {
        countryCode = 'TZ';
      }

      const paymentData = {
        amount: Math.round(totalPrice),
        customerName: formData.name.trim(),
        customerEmail: formData.email.trim(),
        customerPhoneNumber: formData.phone.trim(),
        customerAddress: formData.address.trim(),
        customerCity: formData.city.trim(),
        customerState: formData.state.trim(),
        customerPostcode: formData.postcode.trim(),
        customerCountry: countryCode,
        cartItems: cartItems,
        orderReference: orderReference,
        paymentType: paymentMethod,
      };

      // Call backend payment API
      const paymentResponse = await PaymentService.initiatePayment(paymentData);

      // paymentResponse IS the paymentData object (PaymentService returns result.paymentData)
      const paymentUrl = paymentResponse?.paymentUrl;
      const paymentQrCode = paymentResponse?.paymentQrCode;
      const paymentToken = paymentResponse?.paymentToken;

      // Redirect based on payment type
      if (paymentUrl) {
        // Card: redirect to Snippe hosted checkout
        window.location.href = paymentUrl;
      } else if (paymentQrCode) {
        // QR: show QR code page
        sessionStorage.setItem('paymentQrCode', paymentQrCode);
        sessionStorage.setItem('orderReference', orderReference);
        sessionStorage.setItem('paymentToken', paymentToken || '');
        window.location.href = `/payment-qr?orderRef=${encodeURIComponent(orderReference)}&amount=${encodeURIComponent(totalPrice.toFixed(2))}`;
      } else {
        // Mobile money: redirect to pending page (USSD push sent to phone)
        const paymentId = paymentResponse?.paymentReference;
        window.location.href = `/payment-pending?orderRef=${encodeURIComponent(orderReference)}&amount=${encodeURIComponent(totalPrice.toFixed(2))}${paymentId ? `&paymentId=${encodeURIComponent(paymentId)}` : ''}`;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment initiation failed. Please try again.';
      setError(errorMessage);
      console.error('Payment error:', err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <button
          onClick={onBack}
          className="p-1 hover:bg-slate-100 rounded transition flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Checkout - Secure Payment</h2>
      </div>

      {/* Security Notice - Tanzanian-friendly */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <p className="text-xs sm:text-sm text-blue-900">
          <strong>🔒 Salama:</strong> Malipo yatafanyika kwa usalama kupitia Snippe (M-Pesa, Airtel Money, kadi). Hati kamili inatengenezwa tu baada ya malipo kufanikiwa.
        </p>
        <p className="text-xs text-blue-700 mt-2 italic">Secure payment via M-Pesa, Airtel Money or card. Order confirmed only after successful payment.</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <p className="text-xs sm:text-sm text-red-900">❌ {error}</p>
        </div>
      )}

      {/* Checkout Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Name Field */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="John Doe"
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            required
            disabled={isProcessing}
          />
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="john@example.com"
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            required
            disabled={isProcessing}
          />
        </div>

        {/* Phone Field */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
            Nambari ya Simu / Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="0712 345 678 au 255712345678"
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            required
            disabled={isProcessing}
          />
        </div>

        {/* Address Field */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
            Street Address *
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="123 Main Street"
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            required
            disabled={isProcessing}
          />
        </div>

        {/* City Field */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
            City
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="Dar es Salaam"
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={isProcessing}
          />
        </div>

        {/* State Field */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
              State
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              placeholder="DSM"
              className="w-full px-2 sm:px-4 py-2 sm:py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
              disabled={isProcessing}
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
              Postcode
            </label>
            <input
              type="text"
              name="postcode"
              value={formData.postcode}
              onChange={handleInputChange}
              placeholder="14101"
              className="w-full px-2 sm:px-4 py-2 sm:py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
              disabled={isProcessing}
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-2">
              Country
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              placeholder="TZ"
              className="w-full px-2 sm:px-4 py-2 sm:py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
              disabled={isProcessing}
            />
          </div>
        </div>

        {/* Payment Method Selector */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2 sm:mb-3">
            Payment Method *
          </label>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-4 rounded-lg border-2 transition text-xs sm:text-sm ${
                paymentMethod === 'card'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
              <div className="text-left">
                <p className="font-semibold text-slate-900 text-xs sm:text-sm">Card</p>
                <p className="text-xs text-slate-500 hidden sm:block">Visa, Mastercard</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('mobile')}
              className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-4 rounded-lg border-2 transition text-xs sm:text-sm ${
                paymentMethod === 'mobile'
                  ? 'border-green-600 bg-green-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
              <div className="text-left">
                <p className="font-semibold text-slate-900 text-xs sm:text-sm">Mobile Money</p>
                <p className="text-xs text-slate-500 hidden sm:block">M-Pesa, Airtel Money</p>
              </div>
            </button>
          </div>
          {paymentMethod === 'mobile' && (
            <p className="text-xs text-green-700 mt-2">
              📱 A USSD push will be sent to your phone. Enter your PIN to authorize.
            </p>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-slate-50 rounded-lg p-3 sm:p-4 border border-slate-200">
          <p className="text-xs sm:text-sm text-slate-600 mb-3">Order Summary</p>
          <div className="space-y-2 mb-4">
            <p className="text-xs sm:text-sm text-slate-700">Items: {cartItems.length}</p>
            <div className="border-t pt-2 flex justify-between text-base sm:text-lg font-bold text-slate-900">
              <span>Total Amount:</span>
              <span className="text-blue-600">TSh {totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Terms checkbox */}
        <div className="flex items-start gap-2 sm:gap-3">
          <input
            type="checkbox"
            id="terms"
            required
            disabled={isProcessing}
            className="mt-1 h-4 w-4 flex-shrink-0"
          />
          <label htmlFor="terms" className="text-xs sm:text-sm text-slate-700">
            I agree to the <a href="#" className="text-blue-600 hover:underline">terms and conditions</a> and understand that payment will be processed securely.
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            disabled={isProcessing}
            className="px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base order-2 sm:order-1"
          >
            Back to Cart
          </button>
          <button
            type="submit"
            disabled={isProcessing}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base order-1 sm:order-2 flex-1 sm:flex-none sm:flex-1"
          >
            {isProcessing ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Processing Payment...</span>
                <span className="sm:hidden">Processing...</span>
              </>
            ) : (
              <>
                💳 <span className="hidden sm:inline">Pay Now (TSh {totalPrice.toFixed(2)})</span>
                <span className="sm:hidden">Pay TSh {totalPrice.toFixed(2)}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;
