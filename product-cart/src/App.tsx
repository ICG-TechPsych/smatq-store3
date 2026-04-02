import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

// Pages - User
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailedPage from './pages/PaymentFailedPage';
import PaymentQrPage from './pages/PaymentQrPage';
import PaymentPendingPage from './pages/PaymentPendingPage';

// Pages - Admin
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';

// Utils
import { isAdminVerified } from './services/storage';

// --- Splash Screen Component ---
const SplashScreen = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 z-50">
      <div className="flex flex-col items-center space-y-6 px-4">
        {/* Animated Cart Icon */}
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full opacity-5 animate-pulse" />
          <ShoppingCart className="w-full h-full text-blue-600" strokeWidth={1.5} />
        </div>

        {/* Text Branding */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            SMART <span className="text-blue-600">Q</span>
          </h1>
          <p className="text-xl font-medium tracking-[0.2em] text-blue-500 uppercase mt-2">Store</p>
        </div>

        {/* Loading indicator */}
        <div className="flex gap-2 mt-6">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
};

// --- Protected Admin Route ---
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAdminVerified()) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

// --- Main App Component ---
function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Router>
      <Routes>
        {/* User Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/payment-failed" element={<PaymentFailedPage />} />
        <Route path="/payment-qr" element={<PaymentQrPage />} />
        <Route path="/payment-pending" element={<PaymentPendingPage />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedAdminRoute>
              <AdminProductsPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedAdminRoute>
              <AdminOrdersPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedAdminRoute>
              <AdminAnalyticsPage />
            </ProtectedAdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;