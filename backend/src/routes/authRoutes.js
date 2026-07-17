import express from 'express';
import { register, login, getProfile, updateProfile, forgotPassword, resetPassword, verifyEmail, resendVerification, socialLogin } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-email', verifyEmail);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/social', socialLogin);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;
