// Cart page for users to manage their shopping cart and checkout

import { useState, useEffect } from 'react';
import { ShoppingBag, Trash2, Package, ArrowLeft, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import CheckoutForm from '../components/CheckoutForm';
import { getCart, removeFromCart, updateCartQuantity } from '../services/storage';
import { fetchProductByIdFromBackend } from '../services/productService';
import type { CartItem, Product } from '../types';

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Record<number, Product>>({});
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCartWithProducts = async () => {
      const cart = getCart();
      setCartItems(cart);

      const productMap: Record<number, Product> = {};
      await Promise.all(
        cart.map(async (item) => {
          const product = await fetchProductByIdFromBackend(item.productId);
          if (product) productMap[item.productId] = product;
        })
      );
      setProducts(productMap);
      setLoading(false);
    };
    loadCartWithProducts();
  }, []);

  // Calculate total price
  const totalPrice = cartItems.reduce((sum, item) => {
    const product = products[item.productId];
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  // Handle quantity change
  const handleQuantityChange = (productId: number, quantity: number) => {
    if (quantity > 0) {
      const updated = updateCartQuantity(productId, quantity);
      setCartItems(updated);
    }
  };

  // Handle item removal
  const handleRemoveItem = (productId: number) => {
    const updated = removeFromCart(productId);
    setCartItems(updated);
    // Remove from products map
    const newProducts = { ...products };
    delete newProducts[productId];
    setProducts(newProducts);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Bar */}
      <NavBar activeTab="orders" />

      {/* Main Content */}
      <div className="flex-1 overflow-auto pt-6 pb-24">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Mkoba Wako / Your Cart</h1>
            </div>

            {loading && cartItems.length > 0 ? (
              <div className="flex items-center gap-2 text-slate-600 text-sm sm:text-base">
                <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> Loading...
              </div>
            ) : cartItems.length === 0 && (
              <p className="text-slate-600 text-sm sm:text-base">Your cart is empty. Start shopping!</p>
            )}
          </div>

          {/* Show checkout form if requested */}
          {showCheckout && cartItems.length > 0 ? (
            <CheckoutForm
              cartItems={cartItems.map((i) => ({ ...i, name: products[i.productId]?.name }))}
              totalPrice={totalPrice}
              onBack={() => setShowCheckout(false)}
            />
          ) : (
            <>
              {/* Cart Items */}
              {cartItems.length > 0 && (
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  {cartItems.map((item) => {
                    const product = products[item.productId];
                    if (!product) return (
                      <div key={item.productId} className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 flex items-center gap-3">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-200 rounded-lg flex-shrink-0 animate-pulse" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-amber-800">Product #{item.productId} (loading...)</p>
                          <p className="text-slate-600 text-sm">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    );

                    return (
                      <div
                        key={item.productId}
                        className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4"
                      >
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full sm:w-24 sm:h-24 h-40 sm:h-auto object-cover rounded-lg"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0 flex flex-col">
                          <h3 className="font-semibold text-slate-900 text-sm sm:text-base truncate">{product.name}</h3>
                          <p className="text-xs sm:text-sm text-slate-600 mt-1 line-clamp-2">{product.description}</p>

                          {/* Price and Controls */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3 sm:mt-4">
                            <span className="text-base sm:text-lg font-bold text-blue-600">
                              TSh {product.price.toFixed(2)}
                            </span>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleQuantityChange(item.productId, item.quantity - 1)
                                }
                                className="w-8 h-8 flex items-center justify-center bg-slate-200 rounded hover:bg-slate-300 text-xs sm:text-base"
                              >
                                −
                              </button>
                              <span className="w-8 text-center font-medium text-sm sm:text-base">{item.quantity}</span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(item.productId, item.quantity + 1)
                                }
                                className="w-8 h-8 flex items-center justify-center bg-slate-200 rounded hover:bg-slate-300 text-xs sm:text-base"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Subtotal */}
                          <p className="text-xs sm:text-sm text-slate-700 mt-2">
                            Subtotal: <span className="font-semibold">TSh {(product.price * item.quantity).toFixed(2)}</span>
                          </p>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.productId)}
                          className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition self-end sm:self-start"
                          title="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Empty State */}
              {cartItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Package className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mb-4" />
                  <p className="text-slate-600 text-base sm:text-lg mb-6">Your cart is empty</p>
                  <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Continue Shopping
                  </button>
                </div>
              )}

              {/* Cart Summary */}
              {cartItems.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-slate-700 text-sm sm:text-base">
                      <span>Subtotal</span>
                      <span>TSh {totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-700 text-sm sm:text-base">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between text-lg font-bold text-slate-900">
                      <span>Total</span>
                      <span className="text-blue-600">TSh {totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => setShowCheckout(true)}
                      className="w-full bg-blue-600 text-white font-semibold py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
                    >
                      Lipa Sasa / Proceed to Checkout
                    </button>
                    <button
                      onClick={() => navigate('/')}
                      className="w-full border border-slate-300 text-slate-700 font-semibold py-2.5 sm:py-3 rounded-lg hover:bg-slate-50 transition text-sm sm:text-base"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;
