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
    const result = await db.getAllAsync<Customer>(
      'SELECT * FROM customers ORDER BY name ASC'
    );
    return result || [];
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
}

/**
 * Search customers by name or phone
 */
export async function searchCustomers(query: string): Promise<Customer[]> {
  try {
    const db = await getDatabase();
    const result = await db.getAllAsync<Customer>(
      `SELECT * FROM customers 
       WHERE name LIKE ? OR phone LIKE ?
       ORDER BY name ASC`,
      [`%${query}%`, `%${query}%`]
    );
    return result || [];
  } catch (error) {
    console.error('Error searching customers:', error);
    throw error;
  }
}

/**
 * Get customers with udhaar balance > 0
 */
export async function getCustomersWithUdhaar(): Promise<Customer[]> {
  try {
    const db = await getDatabase();
    const result = await db.getAllAsync<Customer>(
      'SELECT * FROM customers WHERE total_udhaar > 0 ORDER BY total_udhaar DESC'
    );
    return result || [];
  } catch (error) {
    console.error('Error fetching customers with udhaar:', error);
    throw error;
  }
}

/**
 * Get single customer by ID
 */
export async function getCustomerById(id: string): Promise<Customer | null> {
  try {
    const db = await getDatabase();
    const result = await db.getFirstAsync<Customer>(
      'SELECT * FROM customers WHERE id = ?',
      [id]
    );
    return result || null;
  } catch (error) {
    console.error('Error fetching customer:', error);
    throw error;
  }
}

/**
 * Get customer by phone number
 */
export async function getCustomerByPhone(phone: string): Promise<Customer | null> {
  try {
    const db = await getDatabase();
    const result = await db.getFirstAsync<Customer>(
      'SELECT * FROM customers WHERE phone = ?',
      [phone]
    );
    return result || null;
  } catch (error) {
    console.error('Error fetching customer by phone:', error);
    throw error;
  }
}

/**
 * Add new customer
 */
export async function addCustomer(
  id: string,
  name: string,
  phone: string
): Promise<Customer> {
  try {
    const db = await getDatabase();
    const now = new Date().toISOString();

    const newCustomer: Customer = {
      id,
      name,
      phone,
      total_udhaar: 0,
      created_at: now,
      updated_at: now,
      synced: 0,
    };

    await db.runAsync(
      `INSERT INTO customers (id, name, phone, total_udhaar, created_at, updated_at, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, name, phone, 0, now, now, 0]
    );

    return newCustomer;
  } catch (error) {
    console.error('Error adding customer:', error);
    throw error;
  }
}

/**
 * Update customer
 */
export async function updateCustomer(
  id: string,
  updates: Partial<Omit<Customer, 'id' | 'created_at' | 'synced'>>
): Promise<Customer | null> {
  try {
    const db = await getDatabase();
    const now = new Date().toISOString();

    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);

    await db.runAsync(
      `UPDATE customers SET ${fields}, updated_at = ? WHERE id = ?`,
      [...values, now, id]
    );

    return getCustomerById(id);
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
}

/**
 * Delete customer
 */
export async function deleteCustomer(id: string): Promise<boolean> {
  try {
    const db = await getDatabase();
    const result = await db.runAsync('DELETE FROM customers WHERE id = ?', [id]);
    return result.changes > 0;
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
}

/**
 * Add udhaar amount to customer
 */
export async function addUdhaar(customerId: string, amount: number): Promise<boolean> {
  try {
    const db = await getDatabase();
    const result = await db.runAsync(
      `UPDATE customers 
       SET total_udhaar = total_udhaar + ?, updated_at = ?
       WHERE id = ?`,
      [amount, new Date().toISOString(), customerId]
    );
    return result.changes > 0;
  } catch (error) {
    console.error('Error adding udhaar:', error);
    throw error;
  }
}

/**
 * Record a payment (reduces udhaar balance)
 */
export async function recordPayment(
  paymentId: string,
  customerId: string,
  amount: number,
  note?: string
): Promise<Payment> {
  try {
    const db = await getDatabase();
    const now = new Date().toISOString();

    // Record payment
    await db.runAsync(
      `INSERT INTO payments (id, customer_id, amount, note, created_at, synced)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [paymentId, customerId, amount, note || null, now, 0]
    );

    // Reduce customer udhaar balance
    await db.runAsync(
      `UPDATE customers 
       SET total_udhaar = MAX(0, total_udhaar - ?), updated_at = ?
       WHERE id = ?`,
      [amount, now, customerId]
    );

    return {
      id: paymentId,
      customer_id: customerId,
      amount,
      note: note || null,
      created_at: now,
      synced: 0,
    };
  } catch (error) {
    console.error('Error recording payment:', error);
    throw error;
  }
}

/**
 * Get payment history for a customer
 */
export async function getCustomerPaymentHistory(customerId: string): Promise<Payment[]> {
  try {
    const db = await getDatabase();
    const result = await db.getAllAsync<Payment>(
      `SELECT * FROM payments 
       WHERE customer_id = ?
       ORDER BY created_at DESC`,
      [customerId]
    );
    return result || [];
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw error;
  }
}

/**
 * Get total udhaar amount across all customers
 */
export async function getTotalUdhaar(): Promise<number> {
  try {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ total: number }>(
      'SELECT COALESCE(SUM(total_udhaar), 0) as total FROM customers'
    );
    return result?.total || 0;
  } catch (error) {
    console.error('Error fetching total udhaar:', error);
    throw error;
  }
}
