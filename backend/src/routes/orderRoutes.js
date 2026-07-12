import express from 'express';
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  updatePaymentStatus,
  addTrackingNumber,
  deleteOrder,
  getMyOrders,
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public route for creating orders
router.post('/', createOrder);

// User's own orders (must be before /:id to avoid route conflict)
router.get('/my-orders', protect, getMyOrders);

// Admin routes
router.get('/', protect, adminOnly, getOrders);
router.get('/:id', protect, adminOnly, getOrder);
router.patch('/:id/status', protect, adminOnly, updateOrderStatus);
router.patch('/:id/payment', protect, adminOnly, updatePaymentStatus);
router.patch('/:id/tracking', protect, adminOnly, addTrackingNumber);
router.delete('/:id', protect, adminOnly, deleteOrder);

export default router;
