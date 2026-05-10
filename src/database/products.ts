/**
 * Product Database Operations
 * CRUD functions for managing products in SQLite
 */

import { getDatabase } from './schema';

export interface Product {
  id: string;
  name: string;
  category: string;
  purchase_price: number;
  sale_price: number;
  stock_qty: number;
  min_stock_qty: number;
  created_at: string;
  updated_at: string;
  synced: number;
}

/**
 * Get all products
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    console.log('📦 Fetching all products...');
    const db = await getDatabase();
    if (!db) {
      console.warn('⚠️ Database not available');
      return [];
    }
    const result = await db.getAllAsync<Product>('SELECT * FROM products ORDER BY name ASC');
    console.log(`✅ Fetched ${result?.length || 0} products`);
    return result || [];
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return [];
  }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const db = await getDatabase();
    if (!db) return [];
    const result = await db.getAllAsync<Product>(
      'SELECT * FROM products WHERE category = ? ORDER BY name ASC',
      [category]
    );
    return result || [];
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
}

/**
 * Search products by name
 */
export async function searchProducts(query: string): Promise<Product[]> {
  try {
    const db = await getDatabase();
    if (!db) return [];
    const result = await db.getAllAsync<Product>(
      'SELECT * FROM products WHERE name LIKE ? ORDER BY name ASC',
      [`%${query}%`]
    );
    return result || [];
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
}

/**
 * Get low stock products (stock < min_stock_qty)
 */
export async function getLowStockProducts(): Promise<Product[]> {
  try {
    const db = await getDatabase();
    if (!db) return [];
    const result = await db.getAllAsync<Product>(
      'SELECT * FROM products WHERE stock_qty < min_stock_qty ORDER BY stock_qty ASC'
    );
    return result || [];
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    throw error;
  }
}

/**
 * Get single product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const db = await getDatabase();
    if (!db) return null;
    const result = await db.getFirstAsync<Product>(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );
    return result || null;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

/**
 * Add new product
 */
export async function addProduct(product: Omit<Product, 'created_at' | 'updated_at' | 'synced'>): Promise<Product> {
  try {
    const db = await getDatabase();
    if (!db) throw new Error('Database not available');
    const now = new Date().toISOString();
    
    const newProduct: Product = {
      ...product,
      created_at: now,
      updated_at: now,
      synced: 0,
    };

    await db.runAsync(
      `INSERT INTO products (id, name, category, purchase_price, sale_price, stock_qty, min_stock_qty, created_at, updated_at, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newProduct.id,
        newProduct.name,
        newProduct.category,
        newProduct.purchase_price,
        newProduct.sale_price,
        newProduct.stock_qty,
        newProduct.min_stock_qty,
        newProduct.created_at,
        newProduct.updated_at,
        newProduct.synced,
      ]
    );

    return newProduct;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
}

/**
 * Update product
 */
export async function updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'created_at' | 'synced'>>): Promise<Product | null> {
  try {
    const db = await getDatabase();
    if (!db) return null;
    const now = new Date().toISOString();

    // Build dynamic UPDATE query
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);

    await db.runAsync(
      `UPDATE products SET ${fields}, updated_at = ? WHERE id = ?`,
      [...values, now, id]
    );

    return getProductById(id);
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

/**
 * Delete product
 */
export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const db = await getDatabase();
    if (!db) return false;
    const result = await db.runAsync('DELETE FROM products WHERE id = ?', [id]);
    return result.changes > 0;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

/**
 * Decrease product stock (called when sale is made)
 */
export async function decreaseStock(productId: string, quantity: number): Promise<boolean> {
  try {
    const db = await getDatabase();
    if (!db) return false;
    const result = await db.runAsync(
      'UPDATE products SET stock_qty = stock_qty - ?, updated_at = ? WHERE id = ?',
      [quantity, new Date().toISOString(), productId]
    );
    return result.changes > 0;
  } catch (error) {
    console.error('Error decreasing stock:', error);
    throw error;
  }
}

/**
 * Get all product categories
 */
export async function getCategories(): Promise<string[]> {
  try {
    const db = await getDatabase();
    if (!db) return [];
    const result = await db.getAllAsync<{ category: string }>(
      'SELECT DISTINCT category FROM products ORDER BY category ASC'
    );
    return result?.map(r => r.category) || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}
