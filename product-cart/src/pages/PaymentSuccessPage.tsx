import { CheckCircle, Home, Copy } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearCart } from '../services/storage';

export default function PaymentSuccessPage() {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    clearCart();
  }, []);

  // Get order reference from URL params
  const searchParams = new URLSearchParams(window.location.search);
  const orderRef = searchParams.get('orderRef') || 'N/A';
  const amount = searchParams.get('amount') || '0';

  const handleCopyOrder = () => {
    navigator.clipboard.writeText(orderRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse"></div>
            <CheckCircle className="w-20 h-20 text-green-600 relative" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Payment Successful! 🎉
        </h1>
        <p className="text-slate-600 mb-6">
          Thank you for your purchase. Your order has been confirmed and will be processed shortly.
        </p>

        {/* Order Details */}
        <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-600 font-medium">Order Reference</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-lg font-bold text-blue-600 break-all">{orderRef}</p>
                <button
                  onClick={handleCopyOrder}
                  className="ml-2 p-1 hover:bg-slate-200 rounded transition"
                  title="Copy order reference"
                >
                  <Copy className="w-4 h-4 text-slate-600" />
                </button>
              </div>
              {copied && <p className="text-xs text-green-600 mt-1">✓ Copied!</p>}
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Amount Paid</p>
              <p className="text-lg font-bold text-slate-900 mt-1">TSh {parseFloat(amount).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Status</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <p className="text-sm font-semibold text-green-600">Confirmed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-blue-900">
            <strong>📧 Confirmation:</strong> A detailed receipt has been sent to your email address.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
          <button
            onClick={() => navigate('/cart')}
            className="w-full px-4 py-3 bg-slate-200 text-slate-900 rounded-lg font-semibold hover:bg-slate-300 transition"
          >
            View Cart
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-slate-500 mt-6">
          Order reference ID: <strong>{orderRef}</strong>
        </p>
      </div>
    </div>
  );
}
