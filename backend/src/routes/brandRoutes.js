import express from 'express';
import { getBrands, getBrand, createBrand, updateBrand, deleteBrand, toggleBrandStatus } from '../controllers/brandController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getBrands);
router.get('/:id', getBrand);

// Admin routes
router.post('/', protect, adminOnly, upload.single('logo'), createBrand);
router.put('/:id', protect, adminOnly, upload.single('logo'), updateBrand);
router.delete('/:id', protect, adminOnly, deleteBrand);
router.patch('/:id/toggle', protect, adminOnly, toggleBrandStatus);

export default router;
