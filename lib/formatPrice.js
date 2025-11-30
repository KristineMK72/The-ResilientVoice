// lib/formatPrice.js
export function formatPrice(value) {
  const num = Number(value);
  return isNaN(num) ? "View" : `$${num.toFixed(2)}`;
}
