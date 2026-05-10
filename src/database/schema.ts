/**
 * SQLite Database Schema for DukaanPro
 * Defines all tables and their structure for offline-first storage
 */

import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

export const DB_NAME = 'dukaan_pro.db';

// Database initialization SQL - array of clean statements without comments
export const INIT_STATEMENTS = [
  // Products table: Store all products with pricing and stock info
  `CREATE TABLE IF NOT EXISTS products (
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
  )`,

  // Sales table: Record each sale transaction
  `CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    total_amount REAL NOT NULL,
    payment_type TEXT NOT NULL CHECK(payment_type IN ('cash', 'udhaar')),
    customer_id TEXT,
    created_at TEXT NOT NULL,
    synced INTEGER DEFAULT 0,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  )`,

  // Sale_items table: Individual items in each sale
  `CREATE TABLE IF NOT EXISTS sale_items (
    id TEXT PRIMARY KEY,
    sale_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    subtotal REAL NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  )`,

  // Customers table: Store customer information
  `CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    total_udhaar REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    synced INTEGER DEFAULT 0
  )`,

  // Payments table: Track customer payments (full or partial)
  `CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    amount REAL NOT NULL,
    note TEXT,
    created_at TEXT NOT NULL,
    synced INTEGER DEFAULT 0,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  )`,

  // Create indexes for common queries
  `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`,
  `CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id)`,
  `CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id)`,
  `CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id)`,
  `CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone)`,
  `CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id)`,
];

/**
 * Initialize the database and create tables if they don't exist
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
    
    // Execute initialization SQL statements
    console.log(`📋 Executing ${INIT_STATEMENTS.length} SQL statements`);
    
    for (let i = 0; i < INIT_STATEMENTS.length; i++) {
      const statement = INIT_STATEMENTS[i];
      try {
        await db.execAsync(statement);
        console.log(`✅ Statement ${i + 1}/${INIT_STATEMENTS.length} executed`);
      } catch (stmtError) {
        console.error(`❌ Error in statement ${i + 1}:`, stmtError);
        // Continue with next statement - CREATE TABLE IF NOT EXISTS won't fail
        if (statement.includes('CREATE TABLE IF NOT EXISTS') || statement.includes('CREATE INDEX IF NOT EXISTS')) {
          continue;
        }
        throw stmtError;
      }
    }
    
    console.log('✅ Database initialized successfully');
    return db;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    // Return null instead of throwing - allows app to continue
    return null;
  }
}

/**
 * Get database instance (singleton pattern)
 */
let dbInstance: SQLite.SQLiteDatabase | null = null;
let dbInitialized = false;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase | null> {
  if (!dbInitialized) {
    dbInstance = await initializeDatabase();
    dbInitialized = true;
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
