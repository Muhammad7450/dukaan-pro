/**
 * Sales Database Operations
 * CRUD functions for managing sales and sale items in SQLite
 */

import { getDatabase } from './schema';

export interface Sale {
  id: string;
  total_amount: number;
  payment_type: 'cash' | 'udhaar';
  customer_id: string | null;
  created_at: string;
  synced: number;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface SaleWithItems extends Sale {
  items: SaleItem[];
}

/**
 * Get all sales
 */
export async function getAllSales(): Promise<Sale[]> {
  try {
    const db = await getDatabase();
    const result = await db.getAllAsync<Sale>(
      'SELECT * FROM sales ORDER BY created_at DESC'
    );
    return result || [];
  } catch (error) {
    console.error('Error fetching sales:', error);
    throw error;
  }
}

/**
 * Get sales for a specific date
 */
export async function getSalesByDate(date: string): Promise<Sale[]> {
  try {
    const db = await getDatabase();
    const result = await db.getAllAsync<Sale>(
      `SELECT * FROM sales 
       WHERE DATE(created_at) = DATE(?) 
       ORDER BY created_at DESC`,
      [date]
    );
    return result || [];
  } catch (error) {
    console.error('Error fetching sales by date:', error);
    throw error;
  }
}

/**
 * Get sales for a date range
 */
export async function getSalesByDateRange(startDate: string, endDate: string): Promise<Sale[]> {
  try {
    const db = await getDatabase();
    const result = await db.getAllAsync<Sale>(
      `SELECT * FROM sales 
       WHERE DATE(created_at) BETWEEN DATE(?) AND DATE(?)
       ORDER BY created_at DESC`,
      [startDate, endDate]
    );
    return result || [];
  } catch (error) {
    console.error('Error fetching sales by date range:', error);
    throw error;
  }
}

/**
 * Get sales for a specific customer
 */
export async function getSalesByCustomer(customerId: string): Promise<Sale[]> {
  try {
    const db = await getDatabase();
    const result = await db.getAllAsync<Sale>(
      'SELECT * FROM sales WHERE customer_id = ? ORDER BY created_at DESC',
      [customerId]
    );
    return result || [];
  } catch (error) {
    console.error('Error fetching customer sales:', error);
    throw error;
  }
}

/**
 * Get single sale with items
 */
export async function getSaleWithItems(saleId: string): Promise<SaleWithItems | null> {
  try {
    const db = await getDatabase();
    
    const sale = await db.getFirstAsync<Sale>(
      'SELECT * FROM sales WHERE id = ?',
      [saleId]
    );

    if (!sale) return null;

    const items = await db.getAllAsync<SaleItem>(
      'SELECT * FROM sale_items WHERE sale_id = ?',
      [saleId]
    );

    return {
      ...sale,
      items: items || [],
    };
  } catch (error) {
    console.error('Error fetching sale with items:', error);
    throw error;
  }
}

/**
 * Create new sale with items
 */
export async function createSale(
  saleId: string,
  totalAmount: number,
  paymentType: 'cash' | 'udhaar',
  customerId: string | null,
  items: Omit<SaleItem, 'id' | 'sale_id'>[]
): Promise<Sale> {
  try {
    const db = await getDatabase();
    const now = new Date().toISOString();

    // Insert sale
    await db.runAsync(
      `INSERT INTO sales (id, total_amount, payment_type, customer_id, created_at, synced)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [saleId, totalAmount, paymentType, customerId, now, 0]
    );

    // Insert sale items
    for (const item of items) {
      const itemId = `${saleId}-${item.product_id}`;
      await db.runAsync(
        `INSERT INTO sale_items (id, sale_id, product_id, product_name, quantity, unit_price, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          itemId,
          saleId,
          item.product_id,
          item.product_name,
          item.quantity,
          item.unit_price,
          item.subtotal,
        ]
      );
    }

    return {
      id: saleId,
      total_amount: totalAmount,
      payment_type: paymentType,
      customer_id: customerId,
      created_at: now,
      synced: 0,
    };
  } catch (error) {
    console.error('Error creating sale:', error);
    throw error;
  }
}

/**
 * Get today's total sales amount
 */
export async function getTodaysSalesAmount(): Promise<number> {
  try {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(total_amount), 0) as total 
       FROM sales 
       WHERE DATE(created_at) = DATE('now')`,
    );
    return result?.total || 0;
  } catch (error) {
    console.error('Error fetching today sales amount:', error);
    throw error;
  }
}

/**
 * Get today's transaction count
 */
export async function getTodaysTransactionCount(): Promise<number> {
  try {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count 
       FROM sales 
       WHERE DATE(created_at) = DATE('now')`,
    );
    return result?.count || 0;
  } catch (error) {
    console.error('Error fetching today transaction count:', error);
    throw error;
  }
}

/**
 * Get total sales for a date range
 */
export async function getTotalSalesForRange(startDate: string, endDate: string): Promise<number> {
  try {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(total_amount), 0) as total 
       FROM sales 
       WHERE DATE(created_at) BETWEEN DATE(?) AND DATE(?)`,
      [startDate, endDate]
    );
    return result?.total || 0;
  } catch (error) {
    console.error('Error fetching total sales for range:', error);
    throw error;
  }
}

/**
 * Get best selling products
 */
export async function getBestSellingProducts(limit: number = 5): Promise<Array<{ product_name: string; total_qty: number; total_revenue: number }>> {
  try {
    const db = await getDatabase();
    const result = await db.getAllAsync<{ product_name: string; total_qty: number; total_revenue: number }>(
      `SELECT 
        product_name,
        SUM(quantity) as total_qty,
        SUM(subtotal) as total_revenue
       FROM sale_items
       GROUP BY product_id
       ORDER BY total_qty DESC
       LIMIT ?`,
      [limit]
    );
    return result || [];
  } catch (error) {
    console.error('Error fetching best selling products:', error);
    throw error;
  }
}

/**
 * Get total profit for a date range
 */
export async function getTotalProfitForRange(startDate: string, endDate: string): Promise<number> {
  try {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ profit: number }>(
      `SELECT COALESCE(SUM(si.subtotal - (p.purchase_price * si.quantity)), 0) as profit
       FROM sale_items si
       JOIN products p ON si.product_id = p.id
       JOIN sales s ON si.sale_id = s.id
       WHERE DATE(s.created_at) BETWEEN DATE(?) AND DATE(?)`,
      [startDate, endDate]
    );
    return result?.profit || 0;
  } catch (error) {
    console.error('Error fetching total profit:', error);
    throw error;
  }
}
