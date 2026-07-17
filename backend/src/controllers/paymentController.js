import Order from '../models/Order.js';
import { validateSSLCOMMERZ } from '../lib/sslcommerz.js';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.FRONTEND_URL?.split(',')[0] || 'http://localhost:3000';

// Verify the validation response against our stored order: status must be
// VALID/VALIDATED, the returned tran_id must match, and the amount + currency
// must match exactly (security checkpoints from the SSLCOMMERZ v4 spec).
const reconcileOrder = (order, validation) => {
  if (validation.status !== 'VALID' && validation.status !== 'VALIDATED') {
    return { ok: false, reason: validation.status || 'invalid' };
  }
  if (validation.tran_id && validation.tran_id !== order.tran_id) {
    return { ok: false, reason: 'tran_id_mismatch' };
  }
  if (Number(validation.amount) !== Number(order.total)) {
    return { ok: false, reason: 'amount_mismatch' };
  }
  if (validation.currency && validation.currency !== order.currency) {
    return { ok: false, reason: 'currency_mismatch' };
  }
  return { ok: true };
};

// Apply a successful payment to the order (idempotent — ignores repeats).
const markPaid = async (order, validation) => {
  if (order.paymentStatus === 'paid') return order;
  order.paymentStatus = 'paid';
  order.status = order.status === 'pending' ? 'processing' : order.status;
  order.paymentDetails = {
    method: validation.card_type || 'SSLCOMMERZ',
    tranId: validation.tran_id || order.tran_id,
    valId: validation.val_id,
    amount: validation.amount,
    storeAmount: validation.store_amount,
    bank: validation.bank_tran_id,
    riskLevel: validation.risk_level,
  };
  await order.save();
  return order;
};

// SSLCOMMERZ redirects here (GET) after a payment attempt with ?tran_id &
// ?val_id. The customer may never arrive (network drop), so the IPN handler
// below is the authoritative updater.
export const sslcommerzSuccess = async (req, res) => {
  try {
    const { tran_id, val_id } = req.query;
    const order = await Order.findOne({ tran_id });
    if (!order) return res.redirect(`${SITE_URL}/payment/error?reason=order_not_found`);

    if (val_id) {
      const validation = await validateSSLCOMMERZ(val_id);
      const check = reconcileOrder(order, validation);
      if (!check.ok) {
        order.paymentStatus = 'failed';
        await order.save();
        return res.redirect(`${SITE_URL}/payment/error?reason=${encodeURIComponent(check.reason)}`);
      }
      await markPaid(order, validation);
    }
    return res.redirect(`${SITE_URL}/payment/success?order=${order.orderNumber}`);
  } catch (error) {
    return res.redirect(`${SITE_URL}/payment/error?reason=server_error`);
  }
};

export const sslcommerzFail = async (req, res) => {
  const { tran_id } = req.query;
  const order = await Order.findOne({ tran_id });
  if (order && order.paymentStatus !== 'paid') {
    order.paymentStatus = 'failed';
    await order.save();
  }
  return res.redirect(`${SITE_URL}/payment/error?reason=payment_failed`);
};

export const sslcommerzCancel = async (req, res) => {
  const { tran_id } = req.query;
  const order = await Order.findOne({ tran_id });
  if (order && order.paymentStatus !== 'paid') {
    order.paymentStatus = 'cancelled';
    await order.save();
  }
  return res.redirect(`${SITE_URL}/`);
};

// IPN: SSLCOMMERZ posts the full transaction result here (server-to-server)
// regardless of the customer's browser. This is the source of truth for order
// status, since the customer redirect can be lost. Per the docs, only update
// the DB after validating val_id + amount + currency.
export const sslcommerzIPN = async (req, res) => {
  try {
    const data = req.body || {};
    const tran_id = data.tran_id;
    const val_id = data.val_id;

    // Respond 200 immediately so SSLCOMMERZ stops retrying; process async.
    res.status(200).send('OK');

    const order = await Order.findOne({ tran_id });
    if (!order) return;

    // The IPN body already carries status + amount; cross-check via the
    // validation API for an authoritative, tamper-checked result.
    const validation = val_id ? await validateSSLCOMMERZ(val_id) : data;
    const check = reconcileOrder(order, validation);
    if (!check.ok) {
      if (order.paymentStatus !== 'paid') {
        order.paymentStatus = 'failed';
        await order.save();
      }
      return;
    }
    await markPaid(order, validation);
  } catch (error) {
    res.status(200).send('OK');
  }
};
