// Admin analytics - fetches from backend

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, ShoppingCart, Package, Loader } from 'lucide-react';
import AdminNav from '../components/AdminNav';
import { fetchOrdersFromBackend } from '../services/orderService';
import { fetchProductsFromBackend } from '../services/productService';

const AdminAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    averageOrderValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const [orders, products] = await Promise.all([
          fetchOrdersFromBackend(),
          fetchProductsFromBackend(),
        ]);
        const completed = orders.filter((o) => o.status === 'completed');
        const totalRevenue = completed.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
        const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
        const outOfStock = products.filter((p) => p.stock === 0).length;

        setAnalytics({
          totalRevenue,
          totalOrders: orders.length,
          completedOrders: completed.length,
          pendingOrders: orders.filter((o) => o.status === 'pending').length,
          totalProducts: products.length,
          lowStockProducts: lowStock,
          outOfStockProducts: outOfStock,
          averageOrderValue: completed.length > 0 ? totalRevenue / completed.length : 0,
        });
      } catch (err) {
        setError('Failed to load analytics. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
          </div>
          <p className="text-slate-600">Store performance and insights</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Total Revenue</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-2">
                      TSh {analytics.totalRevenue.toLocaleString()}
                    </h3>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Completed Orders</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-2">
                      {analytics.completedOrders}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2">of {analytics.totalOrders} total</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Pending Orders</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-2">
                      {analytics.pendingOrders}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2">Need attention</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Avg Order Value</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-2">
                      TSh {analytics.averageOrderValue.toLocaleString()}
                    </h3>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Total Products</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-2">
                      {analytics.totalProducts}
                    </h3>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Low Stock</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-2">
                      {analytics.lowStockProducts}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2">≤ 10 items</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Out of Stock</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-2">
                      {analytics.outOfStockProducts}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2">Need restocking</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Key Insights</h2>
              <ul className="space-y-3">
                {analytics.completedOrders > 0 && (
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 mt-1.5 bg-green-600 rounded-full flex-shrink-0" />
                    <span className="text-slate-700">
                      You have completed <strong>{analytics.completedOrders}</strong> orders with a
                      revenue of <strong>TSh {analytics.totalRevenue.toLocaleString()}</strong>
                    </span>
                  </li>
                )}
                {analytics.pendingOrders > 0 && (
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 mt-1.5 bg-yellow-600 rounded-full flex-shrink-0" />
                    <span className="text-slate-700">
                      You have <strong>{analytics.pendingOrders}</strong> pending order(s) awaiting
                      confirmation
                    </span>
                  </li>
                )}
                {analytics.outOfStockProducts > 0 && (
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 mt-1.5 bg-red-600 rounded-full flex-shrink-0" />
                    <span className="text-slate-700">
                      <strong>{analytics.outOfStockProducts}</strong> product(s) are out of stock
                    </span>
                  </li>
                )}
                {analytics.lowStockProducts > 0 && (
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 mt-1.5 bg-yellow-600 rounded-full flex-shrink-0" />
                    <span className="text-slate-700">
                      <strong>{analytics.lowStockProducts}</strong> product(s) have low stock levels
                    </span>
                  </li>
                )}
                {analytics.averageOrderValue > 0 && (
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 mt-1.5 bg-blue-600 rounded-full flex-shrink-0" />
                    <span className="text-slate-700">
                      Average order value is{' '}
                      <strong>TSh {analytics.averageOrderValue.toLocaleString()}</strong>
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
