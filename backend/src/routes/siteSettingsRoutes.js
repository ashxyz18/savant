import express from 'express';
import {
  getSettings,
  updateSettings,
  testSocialPost,
} from '../controllers/siteSettingsController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public route
router.get('/', getSettings);

// Admin routes
router.put('/', protect, adminOnly, updateSettings);
router.post('/test-social-post', protect, adminOnly, testSocialPost);

export default router;
