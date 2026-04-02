// Product type for inventory management
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[]; // Array of up to 3 images per product
}

// Cart item type (product + quantity)
export interface CartItem {
  productId: number;
  quantity: number;
  name?: string; // Optional, for order display in admin
}

// Order type for storing customer orders
export interface Order {
  id: string; // Unique token/ID
  customerName: string;
  phoneNumber: string;
  location: string;
  items: CartItem[];
  totalPrice: number;
  status: 'pending' | 'completed';
  createdAt: string;
}

// User context for tracking current user (can be extended)
export interface User {
  id?: string;
  isAdmin?: boolean;
}
