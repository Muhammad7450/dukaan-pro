/**
 * Customer Database Operations
 * CRUD functions for managing customers and their udhaar (credit) in SQLite
 */

import { getDatabase } from './schema';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  total_udhaar: number;
  created_at: string;
  updated_at: string;
  synced: number;
}

export interface Payment {
  id: string;
  customer_id: string;
  amount: number;
  note: string | null;
  created_at: string;
  synced: number;
}

/**
 * Get all customers
 */
export async function getAllCustomers(): Promise<Customer[]> {
  try {
    const db = await getDatabase();
    if (!db) return [];
    const result = await db.getAllAsync<Customer>(
      'SELECT * FROM customers ORDER BY name ASC'
    );
    return result || [];
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
}

/**
 * Search customers by name or phone
 */
export async function searchCustomers(query: string): Promise<Customer[]> {
  try {
    const db = await getDatabase();
    if (!db) return [];
    const result = await db.getAllAsync<Customer>(
      `SELECT * FROM customers 
       WHERE name LIKE ? OR phone LIKE ?
       ORDER BY name ASC`,
      [`%${query}%`, `%${query}%`]
    );
    return result || [];
  } catch (error) {
    console.error('Error searching customers:', error);
    return [];
  }
}

/**
 * Get customers with udhaar balance > 0
 */
export async function getCustomersWithUdhaar(): Promise<Customer[]> {
  try {
    const db = await getDatabase();
    if (!db) return [];
    const result = await db.getAllAsync<Customer>(
      'SELECT * FROM customers WHERE total_udhaar > 0 ORDER BY total_udhaar DESC'
    );
    return result || [];
  } catch (error) {
    console.error('Error fetching customers with udhaar:', error);
    return [];
  }
}

/**
 * Get single customer by ID
 */
export async function getCustomerById(customerId: string): Promise<Customer | null> {
  try {
    const db = await getDatabase();
    if (!db) return null;
    const result = await db.getFirstAsync<Customer>(
      'SELECT * FROM customers WHERE id = ?',
      [customerId]
    );
    return result || null;
  } catch (error) {
    console.error('Error fetching customer:', error);
    return null;
  }
}

/**
 * Create a new customer
 */
export async function addCustomer(customer: Omit<Customer, 'synced'>): Promise<Customer> {
  try {
    const db = await getDatabase();
    if (!db) throw new Error('Database not available');
    
    await db.runAsync(
      `INSERT INTO customers (id, name, phone, total_udhaar, created_at, updated_at, synced)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [customer.id, customer.name, customer.phone, customer.total_udhaar, customer.created_at, customer.updated_at]
    );
    return { ...customer, synced: 0 };
  } catch (error) {
    console.error('Error adding customer:', error);
    throw error;
  }
}

/**
 * Update customer
 */
export async function updateCustomer(customerId: string, updates: Partial<Customer>): Promise<void> {
  try {
    const db = await getDatabase();
    if (!db) throw new Error('Database not available');
    
    const fields = Object.keys(updates)
      .filter(key => key !== 'id')
      .map(key => `${key} = ?`)
      .join(', ');
    
    const values = Object.keys(updates)
      .filter(key => key !== 'id')
      .map(key => (updates as any)[key]);
    
    await db.runAsync(
      `UPDATE customers SET ${fields} WHERE id = ?`,
      [...values, customerId]
    );
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
}

/**
 * Delete customer
 */
export async function deleteCustomer(customerId: string): Promise<void> {
  try {
    const db = await getDatabase();
    if (!db) throw new Error('Database not available');
    
    await db.runAsync('DELETE FROM customers WHERE id = ?', [customerId]);
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
}

/**
 * Get total udhaar across all customers
 */
export async function getTotalUdhaar(): Promise<number> {
  try {
    const db = await getDatabase();
    if (!db) return 0;
    
    const result = await db.getFirstAsync<{ total: number }>(
      'SELECT COALESCE(SUM(total_udhaar), 0) as total FROM customers'
    );
    return result?.total || 0;
  } catch (error) {
    console.error('Error calculating total udhaar:', error);
    return 0;
  }
}

/**
 * Add payment for customer
 */
export async function addPayment(payment: Omit<Payment, 'synced'>): Promise<Payment> {
  try {
    const db = await getDatabase();
    if (!db) throw new Error('Database not available');
    
    await db.runAsync(
      `INSERT INTO payments (id, customer_id, amount, note, created_at, synced)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [payment.id, payment.customer_id, payment.amount, payment.note, payment.created_at]
    );
    
    // Update customer's total_udhaar
    const customer = await getCustomerById(payment.customer_id);
    if (customer) {
      await updateCustomer(payment.customer_id, {
        ...customer,
        total_udhaar: Math.max(0, customer.total_udhaar - payment.amount),
        updated_at: new Date().toISOString(),
      });
    }
    
    return { ...payment, synced: 0 };
  } catch (error) {
    console.error('Error adding payment:', error);
    throw error;
  }
}

/**
 * Get payments for a customer
 */
export async function getCustomerPayments(customerId: string): Promise<Payment[]> {
  try {
    const db = await getDatabase();
    if (!db) return [];
    
    const result = await db.getAllAsync<Payment>(
      'SELECT * FROM payments WHERE customer_id = ? ORDER BY created_at DESC',
      [customerId]
    );
    return result || [];
  } catch (error) {
    console.error('Error fetching customer payments:', error);
    return [];
  }
}

/**
 * Get categories of products
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
    return [];
  }
}
