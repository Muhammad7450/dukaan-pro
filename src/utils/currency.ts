/**
 * Currency Formatting Utilities
 * Helper functions for formatting and parsing currency values
 */

/**
 * Format number as Pakistani Rupees
 * e.g., 1234.56 → "Rs. 1,234.56"
 */
export function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format number as currency without symbol
 * e.g., 1234.56 → "1,234.56"
 */
export function formatAmount(amount: number): string {
  return amount.toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Parse currency string to number
 * e.g., "Rs. 1,234.56" → 1234.56
 */
export function parseCurrency(currencyStr: string): number {
  const cleaned = currencyStr.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Format number with Urdu numerals
 * e.g., 1234 → "۱۲۳۴"
 */
export function formatUrduNumerals(num: number | string): string {
  const urduDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/\d/g, (digit) => urduDigits[parseInt(digit)]);
}

/**
 * Format number as percentage
 * e.g., 0.25 → "25%"
 */
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * Calculate profit margin percentage
 * e.g., costPrice=100, salePrice=150 → "33.33%"
 */
export function calculateProfitMargin(costPrice: number, salePrice: number): number {
  if (costPrice === 0) return 0;
  return ((salePrice - costPrice) / costPrice) * 100;
}

/**
 * Calculate profit amount
 * e.g., costPrice=100, salePrice=150, quantity=2 → 100
 */
export function calculateProfit(
  costPrice: number,
  salePrice: number,
  quantity: number = 1
): number {
  return (salePrice - costPrice) * quantity;
}

/**
 * Round to 2 decimal places
 */
export function roundToTwo(num: number): number {
  return Math.round(num * 100) / 100;
}
