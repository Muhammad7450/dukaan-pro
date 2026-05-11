/**
 * SQLite Database Schema for DukaanPro
 * Defines all tables and their structure for offline-first storage
 */

import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

export const DB_NAME = 'dukaan_pro.db';

// Singleton instance
let dbInstance: SQLite.SQLiteDatabase | null = null;
let dbInitialized = false;

/**
 * Initialize the database and create tables if they don't exist
 * Uses batch SQL with transaction for reliability
 */
export async function initializeDatabase(): Promise<SQLite.SQLiteDatabase | null> {
  try {
    // Check if running on web - SQLite not supported
    if (Platform.OS === 'web') {
      console.warn('⚠️ SQLite not supported on web platform. Using mock database.');
      return null;
    }

    console.log('🔄 Opening database:', DB_NAME);
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    console.log('✅ Database opened successfully');
    
    // Enable foreign keys
    await db.execAsync('PRAGMA foreign_keys = ON');
    console.log('✅ Foreign keys enabled');
    
    // Batch SQL statements with transaction
    const batchSQL = `
      BEGIN TRANSACTION;
      
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        purchase_price REAL NOT NULL,
        sale_price REAL NOT NULL,
        stock_qty INTEGER NOT NULL DEFAULT 0,
        min_stock_qty INTEGER NOT NULL DEFAULT 5,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        synced INTEGER DEFAULT 0
      );
      
      CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY,
        total_amount REAL NOT NULL,
        payment_type TEXT NOT NULL CHECK(payment_type IN ('cash', 'udhaar')),
        customer_id TEXT,
        created_at TEXT NOT NULL,
        synced INTEGER DEFAULT 0,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      );
      
      CREATE TABLE IF NOT EXISTS sale_items (
        id TEXT PRIMARY KEY,
        sale_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        subtotal REAL NOT NULL,
        FOREIGN KEY (sale_id) REFERENCES sales(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      );
      
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL UNIQUE,
        total_udhaar REAL NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        synced INTEGER DEFAULT 0
      );
      
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        amount REAL NOT NULL,
        note TEXT,
        created_at TEXT NOT NULL,
        synced INTEGER DEFAULT 0,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
      CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
      CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
      CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
      CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);
      CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
      CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
      
      COMMIT;
    `;
    
    // Execute batch SQL
    await db.execAsync(batchSQL);
    console.log('✅ Database schema initialized successfully');
    
    // Verify tables exist
    const result = await db.getAllAsync(
      "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('products', 'sales', 'sale_items', 'customers', 'payments')"
    );
    console.log(`✅ Verified ${result.length} required tables exist`);
    
    if (result.length < 5) {
      console.error('❌ Not all required tables were created!');
      console.log('Created tables:', result);
      throw new Error('Database schema incomplete');
    }
    
    // Store instance
    dbInstance = db;
    dbInitialized = true;
    
    return db;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    dbInitialized = true; // Mark as attempted
    dbInstance = null;
    return null;
  }
}

/**
 * Get database instance (singleton pattern)
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase | null> {
  if (!dbInitialized) {
    return await initializeDatabase();
  }
  return dbInstance;
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    try {
      await dbInstance.closeAsync();
    } catch (error) {
      console.error('Error closing database:', error);
    }
    dbInstance = null;
    dbInitialized = false;
  }
}
