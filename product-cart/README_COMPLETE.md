# 🛍️ SMARTQ Store - Complete E-Commerce Application

## 📋 Application Overview

A full-featured e-commerce platform with dedicated **User Interface** for customers and a **secure Admin Dashboard** for store management. Built with React, TypeScript, Tailwind CSS, and featuring a localStorage-based persistence system.

---

## 🎯 Features Implemented

### 👥 User Side (Customer Interface)

#### 1. **Home Page / Products**
- ✅ Grid layout displaying all products
- ✅ Product information: Name, Description, Price (TZS), Stock Status
- ✅ Image gallery (up to 3 images per product with navigation)
- ✅ Search bar with real-time filtering
- ✅ "Add to Cart" button with visual feedback
- ✅ Dynamic stock status badges (In Stock, Low Stock, Out of Stock)

#### 2. **Navigation Bar**
- ✅ Navigation with two main tabs: **Products** & **Cart**
- ✅ Tab highlights current page
- ✅ Admin link for accessing admin panel

#### 3. **Shopping Cart Page**
- ✅ View all items in cart
- ✅ Product image previews
- ✅ Quantity controls (increase/decrease)
- ✅ Remove item functionality
- ✅ Auto-calculated subtotal per item
- ✅ Cart summary with total price
- ✅ "Proceed to Checkout" button

#### 4. **Checkout Flow**
- ✅ Professional checkout form requesting:
  - Full Name
  - Phone Number
  - Delivery Location
- ✅ Order summary display
- ✅ "Pay Now" button
- ✅ Success popup with:
  - Thank you message
  - **Unique Order Token** (auto-generated)
  - Order summary
  - Confirmation details
- ✅ Continue Shopping & View Orders buttons

#### 5. **Order Management**
- ✅ Order Status: `pending` or `completed`
- ✅ Order token generation for tracking
- ✅ Automatic stock reduction when order placed
- ✅ Customer details stored with order

---

### 👨‍💼 Admin Side (Developer & Store Owner)

#### 1. **Admin Login** (`/admin/login`)
- ✅ Secure password authentication
- ✅ Default password: **`1234`**
- ✅ Protected admin route access
- ✅ Session-based verification via localStorage

#### 2. **Admin Dashboard** (`/admin/dashboard`)
- ✅ Statistics overview:
  - Total Products in catalog
  - Total Orders received
  - Pending Orders count
  - Total Revenue (from completed orders)
- ✅ Quick action cards linking to:
  - Product Management
  - Orders Management
  - Analytics
- ✅ Visual dashboard with icons and metrics

#### 3. **Product Management** (`/admin/products`)
- ✅ **Add new products** with form:
  - Product Name
  - Description
  - Price (in TZS)
  - Stock Quantity
  - Up to 3 product images (URLs)
- ✅ **Edit existing products** - modify all fields
- ✅ **Delete products** - with confirmation
- ✅ Product grid view with:
  - Product image
  - Price display
  - Stock indicator
  - Quick action buttons

#### 4. **Orders Management** (`/admin/orders`)
- ✅ View all customer orders
- ✅ Filter orders by status:
  - All Orders
  - Pending Orders
  - Completed Orders
- ✅ Order details display:
  - Unique Order Token
  - Customer Name
  - Phone Number
  - Delivery Location
  - Items in order (Product ID × Quantity)
  - Total amount
  - Order timestamp
  - Status badge
- ✅ **Mark orders as Completed/Pending** with one-click buttons
- ✅ Orders sorted by creation date (newest first)

#### 5. **Analytics Dashboard** (`/admin/analytics`)
- ✅ Comprehensive statistics:
  - **Total Revenue** (from completed orders)
  - **Completed Orders** count
  - **Pending Orders** count
  - **Average Order Value** (calculated)
  - **Total Products** in inventory
  - **Low Stock** products (≤10 items)
  - **Out of Stock** products
- ✅ Key insights section with:
  - Revenue summary
  - Pending orders alert
  - Stock warnings
  - Product insights
  - Average order metrics

---

## 🏗️ Technical Architecture

### File Structure
```
src/
├── pages/
│   ├── HomePage.tsx              # Main products page
│   ├── CartPage.tsx              # Shopping cart
│   ├── AdminLoginPage.tsx        # Admin login
│   ├── AdminDashboardPage.tsx    # Admin dashboard
│   ├── AdminProductsPage.tsx     # Product management
│   ├── AdminOrdersPage.tsx       # Order management
│   └── AdminAnalyticsPage.tsx    # Analytics
├── components/
│   ├── NavBar.tsx                # Main navigation
│   ├── AdminNav.tsx              # Admin navigation
│   ├── SearchBar.tsx             # Product search
│   ├── ProductGrid.tsx           # Product display grid
│   ├── CheckoutForm.tsx          # Checkout & payment
│   └── ProductForm.tsx           # Product add/edit form
├── services/
│   └── storage.ts                # localStorage management
├── types.ts                       # TypeScript interfaces
└── App.tsx                        # Main app with routing
```

### Data Models (TypeScript)

```typescript
// Product in inventory
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[]; // Array of URLs (up to 3)
}

// Item in shopping cart
interface CartItem {
  productId: number;
  quantity: number;
}

// Customer order
interface Order {
  id: string;              // Unique token
  customerName: string;
  phoneNumber: string;
  location: string;
  items: CartItem[];       // Products ordered
  totalPrice: number;
  status: 'pending' | 'completed';
  createdAt: string;       // ISO timestamp
}
```

### Storage System (localStorage)

All data persists in browser localStorage using these keys:
- `smartq_products` - Product catalog (JSON)
- `smartq_cart` - Current shopping cart (JSON)
- `smartq_orders` - All customer orders (JSON)
- `smartq_admin_verified` - Admin session (boolean)

**Automatic Features:**
- First load initializes with 7 sample products
- Cart data clears after successful checkout
- Stock automatically reduces when orders are placed
- Order tokens generated with timestamp + random string format

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation & Running

```bash
# Navigate to project
cd product-cart

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm preview
```

The app will be available at: **http://localhost:5173**

---

## 📱 User Navigation Flow

1. **Browse Products** → `/` (Home)
   - See all products in grid
   - Search/filter products
   - Add items to cart

2. **View Cart** → `/cart`
   - Adjust quantities
   - Remove items
   - Proceed to checkout

3. **Checkout** → In-page form
   - Enter delivery details
   - Review order
   - Confirm payment
   - Get unique order token

---

## 🔐 Admin Access Flow

1. **Login** → `/admin/login`
   - Enter password: `1234`
   - Redirects to dashboard

2. **Dashboard** → `/admin/dashboard`
   - View key metrics
   - Quick access to management pages

3. **Manage Products** → `/admin/products`
   - Add/Edit/Delete products
   - Upload product images

4. **Manage Orders** → `/admin/orders`
   - View customer orders
   - Change order status

5. **View Analytics** → `/admin/analytics`
   - Revenue metrics
   - Inventory insights
   - Performance summaries

---

## 📊 Sample Products

Pre-loaded test products:
1. **Wireless Earbuds Pro** - TSh 49.99 (142 in stock)
2. **Organic Green Tea** - TSh 12.50 (8 in stock)
3. **Smart Watch Series X** - TSh 199.00 (0 stock - out)
4. **Running Shoes Air V2** - TSh 84.99 (56 in stock)
5. **Stainless Steel Bottle** - TSh 22.00 (5 in stock)
6. **USB-C Hub 7-in-1** - TSh 37.99 (88 in stock)
7. **Yoga Mat Premium** - TSh 35.00 (23 in stock)

---

## 🎨 Design & UI

- **Modern CSS** with Tailwind framework
- **Responsive Design** - Works on desktop, tablet, mobile
- **Icons** - From lucide-react (professional icon set)
- **Color Scheme**:
  - Primary: Blue (#0EA5E9)
  - Success: Green (#22C55E)
  - Warning: Amber (#F59E0B)
  - Error: Red (#EF4444)

---

## 💡 Key Features Highlighted

✨ **Smart Cart Management**
- Real-time quantity updates
- Price auto-calculation
- Visual feedback on add to cart

✨ **Order Processing**
- Unique token generation
- Auto stock deduction
- Timestamp tracking
- Status management

✨ **Search & Filter**
- Real-time product search
- Filter by name or description
- Clear search button

✨ **Image Gallery**
- Up to 3 images per product
- Navigation arrows
- Dot indicators
- Image preview on upload

✨ **Analytics**
- Revenue tracking
- Inventory insights
- Order metrics
- Stock warnings

---

## 🔒 Security Notes

- Admin password stored in localStorage (for demo - use backend auth in production)
- Session-based access control
- Protected routes prevent unauthorized access
- Data persists across browser sessions

---

## 📝 Testing Checklist

- [ ] Browse products on home page
- [ ] Search for products
- [ ] Add multiple items to cart
- [ ] Adjust item quantities
- [ ] Remove items from cart
- [ ] Proceed to checkout
- [ ] Complete payment form
- [ ] See thank you popup with order token
- [ ] Login to admin panel (password: 1234)
- [ ] View dashboard metrics
- [ ] Add a new product
- [ ] Edit existing product
- [ ] Delete a product
- [ ] View orders in admin
- [ ] Change order status
- [ ] Check analytics page
- [ ] Verify stock reduced after purchase

---

## 🚀 Future Enhancements

- Real payment gateway integration
- Email notifications
- User accounts & login
- Wishlist functionality
- Product reviews & ratings
- Discount codes
- Shipping integration
- SMS notifications
- Better image upload (no URL requirement)

---

## 📞 Support

For issues or questions, check:
1. Browser console for errors
2. localStorage data integrity
3. Admin password (default: 1234)
4. Ensure images load from valid URLs

---

**Built with ❤️ using React, TypeScript, Tailwind CSS, and lucide-react**
