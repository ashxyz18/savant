import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getLowStockProducts,
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload, uploadMultiple } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/low-stock', getLowStockProducts);
router.get('/:id', getProduct);

// Admin routes
router.post('/', protect, adminOnly, uploadMultiple, createProduct);
router.put('/:id', protect, adminOnly, uploadMultiple, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.patch('/:id/toggle-status', protect, adminOnly, toggleProductStatus);

export default router;
