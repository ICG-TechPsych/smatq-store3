// Home page for users displaying products

import { useState, useEffect } from 'react';
import { ShoppingCart, Package } from 'lucide-react';
import SearchBar from '../components/searchbar';
import ProductGrid from '../components/ProductGrid';
import NavBar from '../components/NavBar';
import { fetchProductsFromBackend } from '../services/productService';
import type { Product } from '../types';

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load products from backend on component mount
    const loadProducts = async () => {
      try {
        const loadedProducts = await fetchProductsFromBackend();
        setProducts(loadedProducts);
        setFilteredProducts(loadedProducts);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Handle search filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Bar */}
      <NavBar activeTab="products" />

      {/* Main Content */}
      <div className="flex-1 overflow-auto pt-6 pb-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Bidhaa Zetu</h1>
            </div>
            <p className="text-slate-600 text-sm sm:text-base mb-2">Browse and add items to your cart. <span className="text-slate-500 italic">(Tafuta na ongeza kwenye mkoba wako)</span></p>

            {/* How it works - for first-time e-commerce users */}
            <div className="mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs sm:text-sm font-medium text-green-800 mb-2">📱 Jinsi ya kununua (How to buy):</p>
              <ol className="text-xs sm:text-sm text-green-700 space-y-1 list-decimal list-inside">
                <li>Chagua bidhaa unayotaka — Add to Cart</li>
                <li>Enda kwenye Cart (Mkoba)</li>
                <li>Jaza taarifa zako na kulipa kwa M-Pesa, Airtel Money au kadi</li>
              </ol>
            </div>

            {/* Search Bar */}
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="text-slate-600 text-sm sm:text-base">Loading products...</div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <ProductGrid products={filteredProducts} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mb-4" />
              <p className="text-slate-600 text-base sm:text-lg mb-6">No products found matching "{searchQuery}"</p>
              <button
                onClick={() => searchQuery ? setSearchQuery('') : window.location.reload()}
                className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
              >
                {searchQuery ? 'Clear Search' : 'Retry'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
