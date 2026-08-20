/** Format a price for display. Returns "View" if value is not a number. */
export function formatPrice(value: unknown): string {
  const num = Number(value);
  return Number.isNaN(num) ? "View" : `$${num.toFixed(2)}`;
}
