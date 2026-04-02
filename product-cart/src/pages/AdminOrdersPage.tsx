// Admin orders management page - fetches from backend

import { useState, useEffect } from 'react';
import { CheckCircle, Clock, Phone, MapPin, Loader } from 'lucide-react';
import AdminNav from '../components/AdminNav';
import {
  fetchOrdersFromBackend,
  updateOrderStatusOnBackend,
  type BackendOrder,
} from '../services/orderService';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const loaded = await fetchOrdersFromBackend();
      setOrders(loaded);
    } catch (err) {
      setError('Failed to load orders. Is the backend running?');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: 'pending' | 'completed') => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatusOnBackend(orderId, newStatus);
      await loadOrders();
    } catch (err) {
      setError('Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  });

  const getStatusColor = (status: 'pending' | 'completed') => {
    return status === 'completed'
      ? 'bg-green-100 text-green-700'
      : 'bg-yellow-100 text-yellow-700';
  };

  const getStatusIcon = (status: 'pending' | 'completed') => {
    return status === 'completed' ? (
      <CheckCircle className="w-4 h-4" />
    ) : (
      <Clock className="w-4 h-4" />
    );
  };

  const phoneNumber = (o: BackendOrder) => o.customerPhoneNumber || o.phoneNumber || '—';
  const location = (o: BackendOrder) => o.location || '—';

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Orders Management</h1>
          <p className="text-slate-600 mt-2">View and manage customer orders from Snippe payments</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-4 mb-8">
          {(['all', 'pending', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {status === 'all' ? 'All Orders' : status === 'pending' ? 'Pending' : 'Completed'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Order {order.id}</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}
                  >
                    {getStatusIcon(order.status)}
                    {order.status === 'completed' ? 'Completed' : 'Pending'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b border-slate-200">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Customer Name</p>
                    <p className="text-slate-900 font-semibold mt-1">{order.customerName}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Phone</p>
                      <p className="text-slate-900 font-semibold mt-1">{phoneNumber(order)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Location</p>
                      <p className="text-slate-900 font-semibold mt-1">{location(order)}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-slate-600 mb-2">Items ({order.items?.length || 0})</p>
                  <ul className="text-sm text-slate-700 space-y-1">
                    {(order.items || []).map((item, idx) => (
                      <li key={idx}>
                        • {item.name || `Product #${item.productId}`} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                  <div>
                    <p className="text-sm text-slate-600">Total Amount</p>
                    <p className="text-2xl font-bold text-blue-600">
                      TSh {Number(order.totalPrice).toFixed(2)}
                    </p>
                  </div>
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'completed')}
                      disabled={updatingId === order.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                      {updatingId === order.id ? 'Updating...' : 'Mark as Completed'}
                    </button>
                  )}
                  {order.status === 'completed' && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'pending')}
                      disabled={updatingId === order.id}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition disabled:opacity-50"
                    >
                      {updatingId === order.id ? 'Updating...' : 'Mark as Pending'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-slate-200">
            <p className="text-slate-600 text-lg">
              {statusFilter === 'all'
                ? 'No orders yet. Orders appear here after customers pay via Snippe.'
                : `No ${statusFilter} orders`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;
