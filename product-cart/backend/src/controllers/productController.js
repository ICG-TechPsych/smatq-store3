import pool from '../db/database.js';

/**
 * GET /api/products
 * Get all products
 */
export const getAllProducts = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, description, price, stock, images, created_at, updated_at FROM products ORDER BY id ASC'
    );
    const products = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      stock: row.stock,
      images: row.images || [],
    }));
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
/**
 * GET /api/products/:id
 * Get a single product by ID
 */
export const getProductById = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, description, price, stock, images FROM products WHERE id = $1',
      [parseInt(req.params.id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const row = result.rows[0];
    const product = {
      id: row.id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      stock: row.stock,
      images: row.images || [],
    };

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Error reading product:', error);
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

    const result = await pool.query(
      'INSERT INTO products (name, description, price, stock, images) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, description, price, stock, images',
      [
        String(name).trim(),
        String(description).trim(),
        parseFloat(price),
        parseInt(stock, 10),
        Array.isArray(images) ? images : [images],
      ]
    );

    const row = result.rows[0];
    const newProduct = {
      id: row.id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      stock: row.stock,
      images: row.images || [],
    };

    console.log(`✓ Product added: ${newProduct.name} (ID: ${newProduct.id})`);
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

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(String(name).trim());
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(String(description).trim());
    }
    if (price !== undefined) {
      updates.push(`price = $${paramCount++}`);
      values.push(parseFloat(price));
    }
    if (stock !== undefined) {
      updates.push(`stock = $${paramCount++}`);
      values.push(parseInt(stock, 10));
    }
    if (images !== undefined) {
      updates.push(`images = $${paramCount++}`);
      values.push(Array.isArray(images) ? images : [images]);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(productId);

    const query = `UPDATE products SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, name, description, price, stock, images`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const row = result.rows[0];
    const updatedProduct = {
      id: row.id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      stock: row.stock,
      images: row.images || [],
    };

    console.log(`✓ Product updated: ${updatedProduct.name} (ID: ${productId})`);
    res.json({ success: true, message: 'Product updated successfully', data: updatedProduct });
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

    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING id, name',
      [productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const deletedProduct = result.rows[0];
    console.log(`✓ Product deleted: ${deletedProduct.name} (ID: ${productId})`);
    res.json({ success: true, message: 'Product deleted successfully', data: deletedProduct });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Error deleting product' });
  }
};
