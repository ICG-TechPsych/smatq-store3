import { readFile, writeFile } from 'fs/promises';
import { mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../data');
const PRODUCTS_DB_PATH = path.join(DATA_DIR, 'products.json');

/**
 * Ensure data directory and products file exist
 */
const ensureProductsFile = async () => {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await readFile(PRODUCTS_DB_PATH);
  } catch {
    // File doesn't exist, create it with default products
    await mkdir(DATA_DIR, { recursive: true });
    const defaultProducts = [
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
        description: 'Portable hub with HDMI 4K, 3x USB-A, SD card reader, and 100W PD charging pass-through.',
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
        description: '6mm thick non-slip eco-friendly TPE mat. Alignment lines printed, carrying strap included.',
        price: 35.0,
        stock: 23,
        images: [
          'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1609899226317-c52a4bccf9dd?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=400&h=400&fit=crop',
        ],
      },
    ];
    await writeFile(PRODUCTS_DB_PATH, JSON.stringify(defaultProducts, null, 2));
  }
};

/**
 * GET /api/products
 * Get all products
 */
export const getAllProducts = async (req, res) => {
  try {
    await ensureProductsFile();
    const data = await readFile(PRODUCTS_DB_PATH, 'utf-8');
    const products = JSON.parse(data);
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Error reading products:', error);
    res.status(500).json({ success: false, message: 'Error fetching products' });
  }
};

/**
 * GET /api/products/:id
 * Get a single product by ID
 */
export const getProductById = async (req, res) => {
  try {
    await ensureProductsFile();
    const data = await readFile(PRODUCTS_DB_PATH, 'utf-8');
    const products = JSON.parse(data);
    const product = products.find((p) => p.id === parseInt(req.params.id));

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Error reading products:', error);
    res.status(500).json({ success: false, message: 'Error fetching product' });
  }
};

/**
 * POST /api/products
 * Add a new product
 */
export const addProduct = async (req, res) => {
  try {
    const { name, description, price, stock, images } = req.body;

    // Validate required fields
    if (!name || !description || price === undefined || stock === undefined || !images || images.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    await ensureProductsFile();
    const data = await readFile(PRODUCTS_DB_PATH, 'utf-8');
    const products = JSON.parse(data);

    // Generate new ID (max ID + 1)
    const newId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;

    const newProduct = {
      id: newId,
      name: String(name).trim(),
      description: String(description).trim(),
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      images: Array.isArray(images) ? images : [images],
    };

    products.push(newProduct);
    await writeFile(PRODUCTS_DB_PATH, JSON.stringify(products, null, 2));

    console.log(`✓ Product added: ${newProduct.name} (ID: ${newId})`);
    res.status(201).json({ success: true, message: 'Product added successfully', data: newProduct });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ success: false, message: 'Error adding product' });
  }
};

/**
 * PUT /api/products/:id
 * Update a product
 */
export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, stock, images } = req.body;
    const productId = parseInt(req.params.id);

    await ensureProductsFile();
    const data = await readFile(PRODUCTS_DB_PATH, 'utf-8');
    const products = JSON.parse(data);

    const productIndex = products.findIndex((p) => p.id === productId);
    if (productIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Update only provided fields
    if (name !== undefined) products[productIndex].name = String(name).trim();
    if (description !== undefined) products[productIndex].description = String(description).trim();
    if (price !== undefined) products[productIndex].price = parseFloat(price);
    if (stock !== undefined) products[productIndex].stock = parseInt(stock, 10);
    if (images !== undefined) products[productIndex].images = Array.isArray(images) ? images : [images];

    await writeFile(PRODUCTS_DB_PATH, JSON.stringify(products, null, 2));

    console.log(`✓ Product updated: ${products[productIndex].name} (ID: ${productId})`);
    res.json({ success: true, message: 'Product updated successfully', data: products[productIndex] });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Error updating product' });
  }
};

/**
 * DELETE /api/products/:id
 * Delete a product
 */
export const deleteProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);

    await ensureProductsFile();
    const data = await readFile(PRODUCTS_DB_PATH, 'utf-8');
    const products = JSON.parse(data);

    const productIndex = products.findIndex((p) => p.id === productId);
    if (productIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const deletedProduct = products.splice(productIndex, 1)[0];
    await writeFile(PRODUCTS_DB_PATH, JSON.stringify(products, null, 2));

    console.log(`✓ Product deleted: ${deletedProduct.name} (ID: ${productId})`);
    res.json({ success: true, message: 'Product deleted successfully', data: deletedProduct });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Error deleting product' });
  }
};
