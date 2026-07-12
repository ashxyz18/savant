import express from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);

// Admin routes
router.post('/', protect, adminOnly, upload.single('image'), createCategory);
router.put('/:id', protect, adminOnly, upload.single('image'), updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

export default router;
