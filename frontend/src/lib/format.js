// Format a BDT amount. SSLCOMMERZ charges in Bangladeshi Taka, so the store
// displays prices in ৳ (BDT) to match what the gateway actually charges.
export function formatBDT(amount, { decimals = 2 } = {}) {
  const value = Number(amount || 0);
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `৳${formatted}`;
}
