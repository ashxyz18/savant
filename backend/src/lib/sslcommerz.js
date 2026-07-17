// SSLCOMMERZ integration (Hosted Checkout, API v4).
// Supports cards + bKash + Nagad + bank via SSLCOMMERZ's hosted GatewayPageURL.
// Uses the sandbox endpoint by default; set SSLCOMMERZ_LIVE=1 + live
// credentials to switch to production.

const STORE_ID = process.env.SSLCOMMERZ_STORE_ID || 'testbox';
const STORE_PASSWORD = process.env.SSLCOMMERZ_STORE_PASSWORD || 'qwerty';
const IS_LIVE = process.env.SSLCOMMERZ_LIVE === '1';

const BASE = IS_LIVE
  ? 'https://securepay.sslcommerz.com'
  : 'https://sandbox.sslcommerz.com';

// ISO-3166 alpha-2 country code — SSLCOMMERZ requires a 2-letter code.
const toCountryCode = (country) => {
  if (!country) return 'BD';
  const c = String(country).trim().toUpperCase();
  if (c.length === 2) return c;
  if (c === 'BANGLADESH') return 'BD';
  if (c === 'BANGLADESH.') return 'BD';
  return c.slice(0, 2);
};

// Initiate a transaction. Returns the GatewayPageURL to redirect the user to.
// Per the v4 spec: store_id, store_passwd, total_amount, currency, tran_id,
// product_category, success/fail/cancel urls and cus_* are mandatory.
// product_profile and ipn_url are also required/recommended.
export const initiateSSLCOMMERZ = async ({
  tran_id,
  total,
  currency,
  productName,
  productProfile,
  customer,
  successUrl,
  failUrl,
  cancelUrl,
  ipnUrl,
}) => {
  const payload = {
    store_id: STORE_ID,
    store_passwd: STORE_PASSWORD,
    total_amount: Number(total).toFixed(2),
    currency: currency || 'BDT',
    tran_id,
    product_category: 'Leather Goods',
    product_name: productName || 'SAVANT Order',
    product_profile: productProfile || 'physical-goods',
    cus_name: customer.name || '',
    cus_email: customer.email || '',
    cus_phone: customer.phone || '',
    cus_add1: customer.address || '',
    cus_city: customer.city || '',
    cus_country: toCountryCode(customer.country),
    shipping_method: 'Courier',
    ship_name: customer.name || '',
    ship_add1: customer.address || '',
    ship_city: customer.city || '',
    ship_country: toCountryCode(customer.country),
    multi_card_name: 'mastercard,visacard,amexcard,bkash,nagad',
    value_a: tran_id,
    success_url: successUrl,
    fail_url: failUrl,
    cancel_url: cancelUrl,
  };
  if (ipnUrl) payload.ipn_url = ipnUrl;

  const form = new URLSearchParams();
  for (const [k, v] of Object.entries(payload)) form.append(k, v);

  const res = await fetch(`${BASE}/gwprocess/v4/api.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });
  const data = await res.json();
  if (data.status !== 'SUCCESS' || !data.GatewayPageURL) {
    throw new Error(data.failedreason || 'SSLCOMMERZ initiation failed');
  }
  return data.GatewayPageURL;
};

// Validate a transaction after redirect / IPN using the validation API.
export const validateSSLCOMMERZ = async (val_id) => {
  const url = `${BASE}/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=${STORE_ID}&store_passwd=${STORE_PASSWORD}&format=json`;
  const res = await fetch(url);
  return res.json();
};
