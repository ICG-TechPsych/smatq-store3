// Admin dashboard page

import { useState, useEffect } from 'react';
import { BarChart3, Package, ShoppingCart, LogOut, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminNav from '../components/AdminNav';
import { logoutAdmin } from '../services/storage';
import { fetchOrdersFromBackend } from '../services/orderService';
import { fetchProductsFromBackend } from '../services/productService';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const [orders, products] = await Promise.all([
          fetchOrdersFromBackend(),
          fetchProductsFromBackend(),
        ]);
        const completed = orders.filter((o) => o.status === 'completed');
        const revenue = completed.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
        setStats({
          totalProducts: products.length,
          totalOrders: orders.length,
          totalRevenue: revenue,
          pendingOrders: orders.filter((o) => o.status === 'pending').length,
        });
      } catch {
        setError('Failed to load dashboard. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Navigation */}
      <AdminNav />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600 mt-2">Manage your store and view analytics</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        ) : (
        <>
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Products */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Products</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.totalProducts}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Orders</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.totalOrders}</h3>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Pending Orders</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.pendingOrders}</h3>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Revenue</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">
                  TSh {stats.totalRevenue.toLocaleString()}
                </h3>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/admin/products')}
              className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition text-left"
            >
              <Package className="w-6 h-6 text-blue-600 mb-2" />
              <p className="font-semibold text-slate-900">Manage Products</p>
              <p className="text-sm text-slate-600 mt-1">Add, edit, or delete products</p>
            </button>

            <button
              onClick={() => navigate('/admin/orders')}
              className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition text-left"
            >
              <ShoppingCart className="w-6 h-6 text-green-600 mb-2" />
              <p className="font-semibold text-slate-900">View Orders</p>
              <p className="text-sm text-slate-600 mt-1">See all customer orders</p>
            </button>

            <button
              onClick={() => navigate('/admin/analytics')}
              className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition text-left"
            >
              <BarChart3 className="w-6 h-6 text-purple-600 mb-2" />
              <p className="font-semibold text-slate-900">Analytics</p>
              <p className="text-sm text-slate-600 mt-1">View detailed analytics</p>
            </button>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
