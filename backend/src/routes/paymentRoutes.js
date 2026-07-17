import express from 'express';
import { sslcommerzSuccess, sslcommerzFail, sslcommerzCancel, sslcommerzIPN } from '../controllers/paymentController.js';

const router = express.Router();

// SSLCOMMERZ redirects the customer here (GET) after a payment attempt.
// Validated via the validation API using val_id + tran_id.
router.get('/success', sslcommerzSuccess);
router.get('/fail', sslcommerzFail);
router.get('/cancel', sslcommerzCancel);

// SSLCOMMERZ posts IPN (Instant Payment Notification) here as a server-to-
// server call — fires before the customer redirect and is the authoritative
// source for updating order status. Must be registered in the merchant panel.
router.post('/ipn', sslcommerzIPN);

export default router;
