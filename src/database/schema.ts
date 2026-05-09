/**
 * SQLite Database Schema for DukaanPro
 * Defines all tables and their structure for offline-first storage
 */

import * as SQLite from 'expo-sqlite';

export const DB_NAME = 'dukaan_pro.db';

// Database initialization SQL
export const INIT_SQL = `
-- Products table: Store all products with pricing and stock info
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

-- Sales table: Record each sale transaction
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  total_amount REAL NOT NULL,
  payment_type TEXT NOT NULL CHECK(payment_type IN ('cash', 'udhaar')),
  customer_id TEXT,
  created_at TEXT NOT NULL,
  synced INTEGER DEFAULT 0,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Sale_items table: Individual items in each sale
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

-- Customers table: Store customer information
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  total_udhaar REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  synced INTEGER DEFAULT 0
);

-- Payments table: Track customer payments (full or partial)
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  amount REAL NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL,
  synced INTEGER DEFAULT 0,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
`;

/**
 * Initialize the database and create tables if they don't exist
 */
export async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  try {
    console.log('🔄 Opening database:', DB_NAME);
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    console.log('✅ Database opened successfully');
    
    // Execute initialization SQL
    const statements = INIT_SQL.split(';').filter(stmt => stmt.trim());
    console.log(`📋 Executing ${statements.length} SQL statements`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await db.execAsync(statement);
          console.log(`✅ Statement ${i + 1}/${statements.length} executed`);
        } catch (stmtError) {
          console.error(`❌ Error in statement ${i + 1}:`, stmtError);
          // Continue with next statement if it's a CREATE TABLE IF NOT EXISTS
          if (!statement.includes('CREATE TABLE IF NOT EXISTS')) {
            throw stmtError;
          }
        }
      }
    }
    
    console.log('✅ Database initialized successfully');
    return db;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

/**
 * Get database instance (singleton pattern)
 */
let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await initializeDatabase();
  }
  return dbInstance;
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
  }
}
