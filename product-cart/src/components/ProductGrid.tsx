// Product grid component displaying products

import { useState } from 'react';
import { ShoppingCart, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { addToCart } from '../services/storage';
import ImageModal from './ImageModal';
import type { Product } from '../types';

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<Record<number, number>>({});
  const [addedToCart, setAddedToCart] = useState<Set<number>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [modalProductName, setModalProductName] = useState('');

  const getStockBadge = (stock: number) => {
    if (stock === 0) return { label: 'Out of stock', style: 'bg-red-50 text-red-700' };
    if (stock <= 10) return { label: `Only ${stock} left`, style: 'bg-amber-50 text-amber-700' };
    return { label: `${stock} in stock`, style: 'bg-green-50 text-green-800' };
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product.id, 1);
    setAddedToCart((prev) => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedToCart((prev) => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }, 2000);
  };

  const openImageModal = (product: Product, imageIndex: number) => {
    setModalImages(product.images);
    setModalProductName(product.name);
    setSelectedImageIndex((prev) => ({ ...prev, [product.id]: imageIndex }));
    setModalOpen(true);
  };

  const closeImageModal = () => {
    setModalOpen(false);
  };

  const handlePrevImage = (productId: number, imageCount: number) => {
    setSelectedImageIndex((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) === 0 ? imageCount - 1 : (prev[productId] || 0) - 1,
    }));
  };

  const handleNextImage = (productId: number, imageCount: number) => {
    setSelectedImageIndex((prev) => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % imageCount,
    }));
  };

  return (
    <>
      <ImageModal
        isOpen={modalOpen}
        images={modalImages}
        productName={modalProductName}
        onClose={closeImageModal}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {products.map((product) => {
          const selectedImage = selectedImageIndex[product.id] || 0;
          const badge = getStockBadge(product.stock);
          const cartStatus = addedToCart.has(product.id);

          return (
            <div
              key={product.id}
              className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition flex flex-col h-full"
            >
              {/* Image Gallery */}
              <div className="relative bg-slate-100 aspect-square group overflow-hidden">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />

                {/* View Image Button - Centered overlay */}
                <button
                  onClick={() => openImageModal(product, selectedImage)}
                  className="absolute inset-0 bg-black/0 hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100"
                >
                  <div className="bg-white/90 hover:bg-white rounded-full p-3 transition shadow-lg backdrop-blur-sm">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                </button>

                {product.images.length > 1 && (
                  <>
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePrevImage(product.id, product.images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-md"
                    >
                      <ChevronLeft className="w-4 h-4 text-slate-700" />
                    </button>

                    {/* Next Button */}
                    <button
                      onClick={() => handleNextImage(product.id, product.images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-md"
                    >
                      <ChevronRight className="w-4 h-4 text-slate-700" />
                    </button>

                    {/* Image Indicators */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {product.images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() =>
                            setSelectedImageIndex((prev) => ({ ...prev, [product.id]: idx }))
                          }
                          className={`w-2 h-2 rounded-full transition ${
                            idx === selectedImage
                              ? 'bg-white'
                              : 'bg-white/50 hover:bg-white/75'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Product Info */}
              <div className="p-3 sm:p-4 flex flex-col flex-1">
                <h3 className="font-bold text-slate-900 text-base sm:text-lg truncate">{product.name}</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 line-clamp-2">{product.description}</p>

                {/* Price and Stock */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 sm:mt-4 mb-3 sm:mb-4 gap-2">
                  <span className="text-xl sm:text-2xl font-bold text-blue-600">TSh {product.price.toFixed(2)}</span>
                  <span className={`text-xs px-2 sm:px-3 py-1 rounded-full font-semibold ${badge.style}`}>
                    {badge.label}
                  </span>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                  className={`w-full py-2 sm:py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition text-sm sm:text-base mt-auto ${
                    product.stock === 0
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : cartStatus
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {cartStatus ? 'Added!' : 'Add to Cart'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ProductGrid;
