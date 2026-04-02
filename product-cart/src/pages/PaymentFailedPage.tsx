import { useNavigate } from 'react-router-dom';
import { AlertCircle, Home, RotateCcw } from 'lucide-react';

export default function PaymentFailedPage() {
  const navigate = useNavigate();

  const handleRetry = () => {
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse"></div>
            <AlertCircle className="w-20 h-20 text-red-600 relative" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Payment Failed ❌
        </h1>
        <p className="text-slate-600 mb-6">
          Unfortunately, your payment could not be processed. Please check your details and try again.
        </p>

        {/* Error Details */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-red-900 font-medium mb-2">Possible reasons:</p>
          <ul className="text-sm text-red-800 list-disc list-inside space-y-1">
            <li>Insufficient funds</li>
            <li>Card/account temporarily locked</li>
            <li>Invalid payment details</li>
            <li>Transaction timeout</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition"
          >
            <RotateCcw className="w-5 h-5" />
            Try Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-200 text-slate-900 rounded-lg font-semibold hover:bg-slate-300 transition"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </div>

        {/* Support Message */}
        <p className="text-xs text-slate-500 mt-6">
          Need help? Please contact our support team at support@smatq.com
        </p>
      </div>
    </div>
  );
}
