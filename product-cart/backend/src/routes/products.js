import express from 'express';
import {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';

const router = express.Router();

/**
 * GET /api/products
 * Get all products
 */
router.get('/', getAllProducts);

/**
 * GET /api/products/:id
 * Get a product by ID
 */
router.get('/:id', getProductById);

/**
 * POST /api/products
 * Add a new product
 */
router.post('/', addProduct);

/**
 * PUT /api/products/:id
 * Update a product
 */
router.put('/:id', updateProduct);

/**
 * DELETE /api/products/:id
 * Delete a product
 */
router.delete('/:id', deleteProduct);

export default router;
