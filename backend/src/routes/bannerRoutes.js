import express from 'express';
import {
  getBanners,
  getBanner,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
} from '../controllers/bannerController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getBanners);
router.get('/:id', getBanner);

// Admin routes
router.post('/', protect, adminOnly, upload.single('image'), createBanner);
router.put('/:id', protect, adminOnly, upload.single('image'), updateBanner);
router.delete('/:id', protect, adminOnly, deleteBanner);
router.patch('/:id/toggle-status', protect, adminOnly, toggleBannerStatus);

export default router;
