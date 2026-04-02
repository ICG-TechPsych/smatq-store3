import { getOrders, updateOrderStatus } from '../services/orderService.js';

/**
 * GET /api/orders - Get all orders (for admin)
 */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await getOrders();
    const sorted = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, data: sorted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

/**
 * PATCH /api/orders/:id/status - Update order status (for admin)
 */
export const patchOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const order = await updateOrderStatus(id, status);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update order' });
  }
};
