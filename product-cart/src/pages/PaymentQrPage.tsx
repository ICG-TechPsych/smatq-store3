import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { QrCode, Loader } from 'lucide-react';

export default function PaymentQrPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderRef = searchParams.get('orderRef') || '';
  const amount = searchParams.get('amount') || '0';
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('paymentQrCode');
    if (stored) {
      setQrCode(stored);
    }
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <QrCode className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Scan to Pay</h1>
        <p className="text-slate-600 mb-6">
          Scan the QR code with your mobile money app to complete payment
        </p>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-12 h-12 text-blue-600 animate-spin" />
          </div>
        ) : qrCode ? (
          <div className="bg-white p-4 rounded-lg border border-slate-200 mb-6">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`}
              alt="Payment QR Code"
              className="mx-auto"
            />
            <p className="text-xs text-slate-500 mt-4">Open your mobile money app and scan</p>
          </div>
        ) : (
          <p className="text-amber-600 py-6">QR code data not found. Please try checkout again.</p>
        )}

        <div className="space-y-2 text-sm text-slate-600">
          <p><strong>Order:</strong> {orderRef}</p>
          <p><strong>Amount:</strong> TSh {parseFloat(amount).toFixed(2)}</p>
        </div>

        <button
          onClick={() => navigate('/cart')}
          className="mt-6 w-full px-4 py-3 bg-slate-200 text-slate-800 rounded-lg font-semibold hover:bg-slate-300 transition"
        >
          Back to Cart
        </button>
      </div>
    </div>
  );
}
