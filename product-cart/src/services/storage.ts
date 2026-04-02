// localStorage management service for data persistence

import type { Product, CartItem, Order } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'smartq_products',
  CART: 'smartq_cart',
  ORDERS: 'smartq_orders',
  ADMIN_VERIFIED: 'smartq_admin_verified',
};

// ===== PRODUCTS =====

/**
 * Initialize default products on first load
 */
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Wireless Earbuds Pro',
    description: 'Noise-cancelling Bluetooth 5.3 earbuds with 30h battery life and IPX5 water resistance.',
    price: 49.99,
    stock: 142,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop',
    ],
  },
  {
    id: 2,
    name: 'Organic Green Tea',
    description: 'Premium loose-leaf green tea sourced from high-altitude farms. 100% natural, no additives.',
    price: 12.5,
    stock: 8,
    images: [
      'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1598318397876-e5b03cb13271?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    ],
  },
  {
    id: 3,
    name: 'Smart Watch Series X',
    description: 'Health tracking smartwatch with ECG, SpO2, GPS, and a 7-day battery. Aluminum case.',
    price: 199.0,
    stock: 0,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1523288102202-5e614e6b4f68?w=400&h=400&fit=crop',
    ],
  },
  {
    id: 4,
    name: 'Running Shoes Air V2',
    description: 'Lightweight mesh running shoes with responsive foam sole. Breathable upper, all sizes.',
    price: 84.99,
    stock: 56,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=400&fit=crop',
    ],
  },
  {
    id: 5,
    name: 'Stainless Steel Bottle',
    description: '500ml double-wall vacuum insulated bottle. Keeps drinks cold 24h or hot 12h. BPA-free.',
    price: 22.0,
    stock: 5,
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1592372100705-f1d340b3c0c7?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1563152071-c6a8b6a97f5b?w=400&h=400&fit=crop',
    ],
  },
  {
    id: 6,
    name: 'USB-C Hub 7-in-1',
    description:
      'Portable hub with HDMI 4K, 3x USB-A, SD card reader, and 100W PD charging pass-through.',
    price: 37.99,
    stock: 88,
    images: [
      'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1587829191301-4b10db27e1da?w=400&h=400&fit=crop',
    ],
  },
  {
    id: 7,
    name: 'Yoga Mat Premium',
    description:
      '6mm thick non-slip eco-friendly TPE mat. Alignment lines printed, carrying strap included.',
    price: 35.0,
    stock: 23,
    images: [
      'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1609899226317-c52a4bccf9dd?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=400&h=400&fit=crop',
    ],
  },
];

/**
 * Get all products from localStorage
 */
export const getProducts = (): Product[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!stored) {
      // First time: initialize with default products
      saveProducts(DEFAULT_PRODUCTS);
      return DEFAULT_PRODUCTS;
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error getting products:', error);
    return DEFAULT_PRODUCTS;
  }
};

/**
 * Save products to localStorage
 */
export const saveProducts = (products: Product[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (error) {
    console.error('Error saving products:', error);
  }
};

/**
 * Get a single product by ID
 */
export const getProductById = (id: number): Product | undefined => {
  const products = getProducts();
  return products.find((p) => p.id === id);
};

/**
 * Update a single product
 */
export const updateProduct = (id: number, updates: Partial<Product>): Product | null => {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...updates };
    saveProducts(products);
    return products[index];
  }
  return null;
};

/**
 * Add a new product
 */
export const addProduct = (product: Omit<Product, 'id'>): Product => {
  const products = getProducts();
  const newProduct: Product = {
    ...product,
    id: Math.max(...products.map((p) => p.id), 0) + 1,
  };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
};

/**
 * Delete a product
 */
export const deleteProduct = (id: number): boolean => {
  const products = getProducts().filter((p) => p.id !== id);
  saveProducts(products);
  return true;
};

// ===== CART =====

/**
 * Get cart items
 */
export const getCart = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CART);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting cart:', error);
    return [];
  }
};

/**
 * Add or update item in cart
 */
export const addToCart = (productId: number, quantity: number = 1): CartItem[] => {
  const cart = getCart();
  const existing = cart.find((item) => item.productId === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }

  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  return cart;
};

/**
 * Remove item from cart
 */
export const removeFromCart = (productId: number): CartItem[] => {
  const cart = getCart().filter((item) => item.productId !== productId);
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  return cart;
};

/**
 * Update item quantity in cart
 */
export const updateCartQuantity = (productId: number, quantity: number): CartItem[] => {
  const cart = getCart();
  const item = cart.find((item) => item.productId === productId);
  if (item) {
    if (quantity > 0) {
      item.quantity = quantity;
    } else {
      return removeFromCart(productId);
    }
  }
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  return cart;
};

/**
 * Clear the entire cart
 */
export const clearCart = (): void => {
  localStorage.removeItem(STORAGE_KEYS.CART);
};

// ===== ORDERS =====

/**
 * Generate unique token for order
 */
export const generateOrderToken = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

/**
 * Get all orders
 */
export const getOrders = (): Order[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting orders:', error);
    return [];
  }
};

/**
 * Create a new order
 */
export const createOrder = (
  customerName: string,
  phoneNumber: string,
  location: string,
  items: CartItem[],
  totalPrice: number
): Order => {
  const orders = getOrders();
  const newOrder: Order = {
    id: generateOrderToken(),
    customerName,
    phoneNumber,
    location,
    items,
    totalPrice,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  orders.push(newOrder);
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  return newOrder;
};

/**
 * Update order status
 */
export const updateOrderStatus = (orderId: string, status: 'pending' | 'completed'): Order | null => {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    order.status = status;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    return order;
  }
  return null;
};

/**
 * Get total revenue from all completed orders
 */
export const getTotalRevenue = (): number => {
  const orders = getOrders();
  return orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, order) => sum + order.totalPrice, 0);
};

// ===== ADMIN =====

/**
 * Check if user is verified admin
 */
export const isAdminVerified = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_VERIFIED) === 'true';
};

/**
 * Verify admin (simple password: 1234)
 */
export const verifyAdmin = (password: string): boolean => {
  const isValid = password === '1234';
  if (isValid) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_VERIFIED, 'true');
  }
  return isValid;
};

/**
 * Logout admin
 */
export const logoutAdmin = (): void => {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_VERIFIED);
};
