// Product form component for admin to add/edit products

import { useState, useEffect } from 'react';
import type { Product } from '../types';

interface ProductFormProps {
  product?: Product;
  onSave: (product: Omit<Product, 'id'>) => Promise<void>;
  isLoading?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    images: Array(7).fill(''),
  });

  const [imageInputMode, setImageInputMode] = useState<'url' | 'file'>('file'); // Default to file upload
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const MAX_IMAGES = 7;

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: String(product.price),
        stock: String(product.stock),
        images: [...product.images, ...Array(MAX_IMAGES - product.images.length).fill('')],
      });
    }
  }, [product]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const filesToProcess = Array.from(files);
    let processedCount = 0;

    filesToProcess.forEach((file) => {
      // Find first empty slot
      const emptyIndex = formData.images.findIndex((img) => !img.trim());
      
      if (emptyIndex === -1) {
        // No empty slots, skip this file
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large (max 5MB)`);
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not a valid image file`);
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result as string;
        setFormData((prev) => {
          const newImages = [...prev.images];
          const availableIndex = newImages.findIndex((img) => !img.trim());
          if (availableIndex !== -1) {
            newImages[availableIndex] = base64String;
          }
          return { ...prev, images: newImages };
        });
        processedCount++;
      };

      reader.onerror = () => {
        alert(`Error reading ${file.name}. Please try again.`);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.price ||
      !formData.stock ||
      !formData.images[0].trim()
    ) {
      alert('Please fill in all required fields (at least 1 image required)');
      return;
    }

    // Filter empty images
    const images = formData.images.filter((img) => img.trim());

    const productData: Omit<Product, 'id'> = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      images,
    };

    setSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Wait for the async save operation to complete
      await onSave(productData);
      
      // Only reset form after successful save
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        images: Array(MAX_IMAGES).fill(''),
      });
      
      setSuccessMessage(`Product "${productData.name}" saved successfully!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('Error saving product:', error);
      setErrorMessage(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Field */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Product Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="e.g., Wireless Earbuds"
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Description Field */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe your product..."
          rows={3}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          required
        />
      </div>

      {/* Price and Stock */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Price (TZS) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-600 font-semibold">TZ</span>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full pl-7 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Stock Quantity *
          </label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleInputChange}
            placeholder="0"
            min="0"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Image Input Mode Toggle */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Product Images * (up to {MAX_IMAGES}, at least 1 required)
        </label>
        <div className="flex gap-3 mb-3">
          <button
            type="button"
            onClick={() => setImageInputMode('file')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
              imageInputMode === 'file'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            📁 Upload Local Images
          </button>
          <button
            type="button"
            onClick={() => setImageInputMode('url')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
              imageInputMode === 'url'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            🔗 Enter Image URLs
          </button>
        </div>

        {imageInputMode === 'file' ? (
          <>
            {/* Single Upload Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                handleFileUpload(e.dataTransfer.files);
              }}
              className="relative border-2 border-dashed border-slate-300 rounded-lg p-8 hover:border-blue-500 transition cursor-pointer bg-slate-50 mb-4"
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
              />
              <div className="text-center pointer-events-none">
                <div className="text-4xl mb-2">📸</div>
                <p className="text-base font-medium text-slate-700 mb-1">Click or drag images here</p>
                <p className="text-sm text-slate-600">PNG, JPG, GIF up to 5MB each</p>
                <p className="text-xs text-slate-500 mt-2">
                  Select up to {MAX_IMAGES - formData.images.filter((img) => img.trim()).length} more {MAX_IMAGES - formData.images.filter((img) => img.trim()).length === 1 ? 'image' : 'images'}
                </p>
              </div>
            </div>

            {/* Image Grid Preview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group">
                  {image ? (
                    <>
                      <img
                        src={image}
                        alt={`preview-${index}`}
                        className="w-full h-32 object-cover rounded border border-slate-300"
                        onError={(e) =>
                          (e.currentTarget.src = 'https://via.placeholder.com/128x128?text=Error')
                        }
                      />
                      <button
                        type="button"
                        onClick={() => handleImageChange(index, '')}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-32 border-2 border-dashed border-slate-300 rounded flex items-center justify-center bg-slate-50">
                      <span className="text-slate-400 text-2xl">+</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* URL Input Section */}
            <div className="space-y-3 mb-4">
              {formData.images.map((image, index) => (
                <div key={index}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Image {index + 1} {index === 0 ? '(Required)' : '(Optional)'}
                  </label>
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required={index === 0}
                  />
                </div>
              ))}
            </div>

            {/* URL Preview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group">
                  {image ? (
                    <>
                      <img
                        src={image}
                        alt={`preview-${index}`}
                        className="w-full h-32 object-cover rounded border border-slate-300"
                        onError={(e) =>
                          (e.currentTarget.src = 'https://via.placeholder.com/128x128?text=Error')
                        }
                      />
                      <button
                        type="button"
                        onClick={() => handleImageChange(index, '')}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-32 border-2 border-dashed border-slate-300 rounded flex items-center justify-center bg-slate-50">
                      <span className="text-slate-400 text-2xl">+</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-4">
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">❌ Error</p>
            <p className="text-red-600 text-sm mt-1 whitespace-pre-wrap">{errorMessage}</p>
          </div>
        )}
        {successMessage && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm font-medium">✓ {successMessage}</p>
          </div>
        )}
        <button
          type="submit"
          disabled={submitting || isLoading}
          className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            product ? 'Update Product' : 'Add Product'
          )}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
