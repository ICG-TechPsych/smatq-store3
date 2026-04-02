// Service for communicating with backend product API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
const isDev = import.meta.env.DEV;

export interface ProductResponse {
  success: boolean;
  data?: any;
  message?: string;
}

/**
 * Get all products from backend
 */
export const fetchProductsFromBackend = async (): Promise<any[]> => {
  try {
    if (isDev) console.log('[ProductService] Fetching products');
    const response = await fetch(`${API_BASE_URL}/api/products`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result: ProductResponse = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('[ProductService] Error fetching products:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch products: ${errorMsg}. Make sure backend is running on ${API_BASE_URL}`);
  }
};

/**
 * Get a single product from backend by ID
 */
export const fetchProductByIdFromBackend = async (id: number): Promise<any | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result: ProductResponse = await response.json();
    return result.data || null;
  } catch (error) {
    console.error(`Error fetching product ${id} from backend:`, error);
    return null;
  }
};

/**
 * Add a new product to backend
 */
export const addProductToBackend = async (productData: any): Promise<any | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    let result: ProductResponse | null = null;
    try {
      result = await response.json();
    } catch {
      result = { success: false, message: `HTTP error! status: ${response.status}` };
    }

    if (!response.ok) {
      if (response.status === 413) {
        throw new Error('Image is too large. Please upload a smaller image (under 5MB total request size).');
      }
      throw new Error(result?.message || `HTTP error! status: ${response.status}`);
    }

    return result?.data || null;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[ProductService] Error adding product:', errorMsg);
    
    // Provide helpful error messages
    if (errorMsg.includes('Failed to fetch')) {
      throw new Error(`⚠️ Cannot connect to backend at ${API_BASE_URL}. Make sure:\n1. Backend is running: cd backend && npm start\n2. Backend is on port 5002\n3. Check .env file has correct VITE_API_URL`);
    }
    
    throw new Error(`Failed to add product: ${errorMsg}`);
  }
};

/**
 * Update a product on backend
 */
export const updateProductOnBackend = async (id: number, productData: any): Promise<any | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    const result: ProductResponse = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }

    return result.data || null;
  } catch (error) {
    console.error(`Error updating product ${id} on backend:`, error);
    throw error;
  }
};

/**
 * Delete a product on backend
 */
export const deleteProductOnBackend = async (id: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'DELETE',
    });

    const result: ProductResponse = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error(`Error deleting product ${id} on backend:`, error);
    throw error;
  }
};
