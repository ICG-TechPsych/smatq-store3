// Admin products management page

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import AdminNav from '../components/AdminNav';
import ProductForm from '../components/ProductForm';
import {
  fetchProductsFromBackend,
  addProductToBackend,
  updateProductOnBackend,
  deleteProductOnBackend,
} from '../services/productService';
import type { Product } from '../types';

const AdminProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const loaded = await fetchProductsFromBackend();
      setProducts(loaded);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (productData: Omit<Product, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      if (editingProduct) {
        // Update existing product
        const result = await updateProductOnBackend(editingProduct.id, productData);
        if (!result) {
          throw new Error('Failed to update product');
        }
      } else {
        // Add new product
        const result = await addProductToBackend(productData);
        if (!result) {
          throw new Error('Failed to add product');
        }
      }
      
      // Reload products after successful save
      await loadProducts();
      setShowForm(false);
      setEditingProduct(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save product';
      setError(errorMessage);
      throw err; // Re-throw so ProductForm knows there was an error
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setLoading(true);
      setError(null);
      try {
        await deleteProductOnBackend(id);
        await loadProducts();
      } catch (err) {
        setError('Failed to delete product');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
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
            <h1 className="text-3xl font-bold text-slate-900">Products Management</h1>
            <p className="text-slate-600 mt-2">Add, edit, or delete products from your store</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Product Form */}
        {showForm && (
          <div className="mb-8 bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={handleCloseForm}
                className="p-1 text-slate-500 hover:bg-slate-100 rounded transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ProductForm product={editingProduct || undefined} onSave={handleSaveProduct} />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="text-slate-600">Loading products...</div>
          </div>
        )}

        {/* Products List */}
        {!loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg border border-slate-200 p-4">
                  {/* Product Image */}
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />

                  {/* Product Info */}
                  <h3 className="font-bold text-slate-900 truncate">{product.name}</h3>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">{product.description}</p>

                  {/* Price and Stock */}
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-lg font-bold text-blue-600">TSh {product.price.toFixed(2)}</span>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                      product.stock > 0
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {product.stock} in stock
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded transition"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {products.length === 0 && !showForm && (
              <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-slate-200">
                <p className="text-slate-600 text-lg mb-4">No products yet</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Add First Product
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminProductsPage;
