import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Smartphone, Loader, CheckCircle, XCircle } from 'lucide-react';
import PaymentService from '../services/paymentService';

export default function PaymentPendingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderRef = searchParams.get('orderRef') || '';
  const amount = searchParams.get('amount') || '0';
  const paymentId = searchParams.get('paymentId') || '';
  const [status, setStatus] = useState<'pending' | 'completed' | 'failed' | null>(null);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    if (!paymentId) {
      setStatus('pending');
      return;
    }

    const checkStatus = async () => {
      try {
        const result = await PaymentService.checkPaymentStatus(paymentId);
        if (result.status === 'completed') {
          setStatus('completed');
          setTimeout(() => {
            navigate(`/payment-success?orderRef=${encodeURIComponent(orderRef)}&amount=${encodeURIComponent(amount)}`);
          }, 1500);
        } else if (result.status === 'failed') {
          setStatus('failed');
        }
      } catch {
        // Keep polling
      }
      setPollCount((c) => c + 1);
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [paymentId, orderRef, amount, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-100 rounded-full animate-pulse" />
            <Smartphone className="w-20 h-20 text-amber-600 relative" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Check Your Phone</h1>
        <p className="text-slate-600 mb-6">
          A USSD push notification has been sent to your mobile number. Please check your phone and enter your PIN to authorize the payment.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-amber-900 font-medium">Supported: M-Pesa, Airtel Money, Mixx, Halotel</p>
          <p className="text-sm text-amber-800 mt-1">Order: <strong>{orderRef}</strong></p>
          <p className="text-sm text-amber-800">Amount: <strong>TSh {parseFloat(amount).toFixed(2)}</strong></p>
        </div>

        {status === 'completed' && (
          <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
            <CheckCircle className="w-6 h-6" />
            <span>Payment received! Redirecting...</span>
          </div>
        )}

        {status === 'failed' && (
          <div className="flex items-center justify-center gap-2 text-red-600 mb-4">
            <XCircle className="w-6 h-6" />
            <span>Payment failed. Please try again.</span>
          </div>
        )}

        {(status === 'pending' || status === null) && (
          <div className="flex items-center justify-center gap-2 text-amber-600 mb-4">
            <Loader className="w-5 h-5 animate-spin" />
            <span>Waiting for authorization...</span>
          </div>
        )}

        <button
          onClick={() => navigate('/cart')}
          className="w-full px-4 py-3 bg-slate-200 text-slate-800 rounded-lg font-semibold hover:bg-slate-300 transition"
        >
          Back to Cart
        </button>
      </div>
    </div>
  );
}
