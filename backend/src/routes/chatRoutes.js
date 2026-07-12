import express from 'express';
import { createChat, getMyChat, getAllChats, getChatById, adminReply, closeChat } from '../controllers/chatController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createChat);
router.get('/mine', protect, getMyChat);

router.get('/', protect, adminOnly, getAllChats);
router.get('/:id', protect, adminOnly, getChatById);
router.post('/:id/reply', protect, adminOnly, adminReply);
router.patch('/:id/close', protect, adminOnly, closeChat);

export default router;
