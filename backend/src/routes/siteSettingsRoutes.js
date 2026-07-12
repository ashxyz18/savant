import express from 'express';
import {
  getSettings,
  updateSettings,
} from '../controllers/siteSettingsController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public route
router.get('/', getSettings);

// Admin routes
router.put('/', protect, adminOnly, updateSettings);

export default router;
