/**
 * ID Generation Utilities
 * Helper functions to generate unique IDs for database records
 */

/**
 * Generate a unique ID using timestamp and random string
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}

/**
 * Generate product ID
 */
export function generateProductId(): string {
  return generateId('prod');
}

/**
 * Generate sale ID
 */
export function generateSaleId(): string {
  return generateId('sale');
}

/**
 * Generate customer ID
 */
export function generateCustomerId(): string {
  return generateId('cust');
}

/**
 * Generate payment ID
 */
export function generatePaymentId(): string {
  return generateId('pay');
}

/**
 * Generate sale item ID
 */
export function generateSaleItemId(): string {
  return generateId('item');
}
