// Order service for admin - fetches from backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

export interface BackendOrder {
  id: string;
  orderReference?: string;
  paymentReference?: string;
  customerName: string;
  customerEmail?: string;
  customerPhoneNumber?: string;
  phoneNumber?: string;
  location?: string;
  items: { productId: number; quantity: number; name?: string }[];
  totalPrice: number;
  currency?: string;
  status: 'pending' | 'completed';
  createdAt: string;
  updatedAt?: string;
}

export const fetchOrdersFromBackend = async (): Promise<BackendOrder[]> => {
  const response = await fetch(`${API_BASE_URL}/api/orders`);
  if (!response.ok) throw new Error('Failed to fetch orders');
  const result = await response.json();
  return result.data || [];
};

export const updateOrderStatusOnBackend = async (
  orderId: string,
  status: 'pending' | 'completed'
): Promise<BackendOrder | null> => {
  const response = await fetch(`${API_BASE_URL}/api/orders/${encodeURIComponent(orderId)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('Failed to update order');
  const result = await response.json();
  return result.data || null;
};
