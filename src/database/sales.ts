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
    if (!db) return [];
    const result = await db.getAllAsync<Sale>(
      'SELECT * FROM sales ORDER BY created_at DESC'
    );
    return result || [];
  } catch (error) {
    console.error('Error fetching sales:', error);
    return [];
  }
}

/**
 * Get sales for a specific date
 */
export async function getSalesByDate(date: string): Promise<Sale[]> {
  try {
    const db = await getDatabase();
    if (!db) return [];
    const result = await db.getAllAsync<Sale>(
      `SELECT * FROM sales 
       WHERE DATE(created_at) = DATE(?) 
       ORDER BY created_at DESC`,
      [date]
    );
    return result || [];
  } catch (error) {
    console.error('Error fetching sales by date:', error);
    return [];
  }
}

/**
 * Get sales for a date range
 */
export async function getSalesByDateRange(startDate: string, endDate: string): Promise<Sale[]> {
  try {
    const db = await getDatabase();
    if (!db) return [];
    const result = await db.getAllAsync<Sale>(
      `SELECT * FROM sales 
       WHERE DATE(created_at) BETWEEN DATE(?) AND DATE(?)
       ORDER BY created_at DESC`,
      [startDate, endDate]
    );
    return result || [];
  } catch (error) {
    console.error('Error fetching sales by date range:', error);
    return [];
  }
}

/**
 * Create a new sale
 */
export async function createSale(sale: Omit<Sale, 'synced'>): Promise<Sale> {
  try {
    const db = await getDatabase();
    if (!db) throw new Error('Database not available');
    
    await db.runAsync(
      `INSERT INTO sales (id, total_amount, payment_type, customer_id, created_at, synced)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [sale.id, sale.total_amount, sale.payment_type, sale.customer_id || null, sale.created_at]
    );
    return { ...sale, synced: 0 };
  } catch (error) {
    console.error('Error creating sale:', error);
    throw error;
  }
}

/**
 * Add item to a sale
 */
export async function addSaleItem(item: SaleItem): Promise<SaleItem> {
  try {
    const db = await getDatabase();
    if (!db) throw new Error('Database not available');
    
    await db.runAsync(
      `INSERT INTO sale_items (id, sale_id, product_id, product_name, quantity, unit_price, subtotal)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [item.id, item.sale_id, item.product_id, item.product_name, item.quantity, item.unit_price, item.subtotal]
    );
    return item;
  } catch (error) {
    console.error('Error adding sale item:', error);
    throw error;
  }
}

/**
 * Get sale items for a sale
 */
export async function getSaleItems(saleId: string): Promise<SaleItem[]> {
  try {
    const db = await getDatabase();
    if (!db) return [];
    
    const result = await db.getAllAsync<SaleItem>(
      'SELECT * FROM sale_items WHERE sale_id = ?',
      [saleId]
    );
    return result || [];
  } catch (error) {
    console.error('Error fetching sale items:', error);
    return [];
  }
}

/**
 * Get complete sale with items
 */
export async function getSaleWithItems(saleId: string): Promise<SaleWithItems | null> {
  try {
    const db = await getDatabase();
    if (!db) return null;
    
    const sale = await db.getFirstAsync<Sale>(
      'SELECT * FROM sales WHERE id = ?',
      [saleId]
    );
    
    if (!sale) return null;
    
    const items = await getSaleItems(saleId);
    return { ...sale, items };
  } catch (error) {
    console.error('Error fetching sale with items:', error);
    return null;
  }
}

/**
 * Get total sales amount for a date
 */
export async function getTotalSalesForDate(date: string): Promise<number> {
  try {
    const db = await getDatabase();
    if (!db) return 0;
    
    const result = await db.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(total_amount), 0) as total FROM sales 
       WHERE DATE(created_at) = DATE(?)`,
      [date]
    );
    return result?.total || 0;
  } catch (error) {
    console.error('Error calculating total sales:', error);
    return 0;
  }
}

/**
 * Get total sales count for a date
 */
export async function getTotalSalesCountForDate(date: string): Promise<number> {
  try {
    const db = await getDatabase();
    if (!db) return 0;
    
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM sales 
       WHERE DATE(created_at) = DATE(?)`,
      [date]
    );
    return result?.count || 0;
  } catch (error) {
    console.error('Error counting sales:', error);
    return 0;
  }
}

/**
 * Get best selling products
 */
export async function getBestSellingProducts(limit: number = 5): Promise<any[]> {
  try {
    const db = await getDatabase();
    if (!db) return [];
    
    const result = await db.getAllAsync(
      `SELECT 
        product_name,
        SUM(quantity) as total_qty,
        SUM(subtotal) as total_amount,
        COUNT(*) as times_sold
       FROM sale_items
       GROUP BY product_id
       ORDER BY total_qty DESC
       LIMIT ?`,
      [limit]
    );
    return result || [];
  } catch (error) {
    console.error('Error fetching best selling products:', error);
    return [];
  }
}

/**
 * Get profit for date range
 */
export async function getProfitForDateRange(startDate: string, endDate: string): Promise<number> {
  try {
    const db = await getDatabase();
    if (!db) return 0;
    
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
    console.error('Error calculating profit:', error);
    return 0;
  }
}
