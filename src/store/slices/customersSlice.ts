/**
 * Customers Redux Slice
 * Manages customers and udhaar (credit) state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Customer, Payment } from '../../database/customers';

export interface CustomersState {
  items: Customer[];
  selectedCustomer: Customer | null;
  paymentHistory: Payment[];
  totalUdhaar: number;
  loading: boolean;
  error: string | null;
}

const initialState: CustomersState = {
  items: [],
  selectedCustomer: null,
  paymentHistory: [],
  totalUdhaar: 0,
  loading: false,
  error: null,
};

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    // Set all customers
    setCustomers: (state, action: PayloadAction<Customer[]>) => {
      state.items = action.payload;
      state.totalUdhaar = action.payload.reduce((sum, c) => sum + c.total_udhaar, 0);
    },

    // Add customer
    addCustomer: (state, action: PayloadAction<Customer>) => {
      state.items.push(action.payload);
    },

    // Update customer
    updateCustomer: (state, action: PayloadAction<Customer>) => {
      const index = state.items.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        const oldUdhaar = state.items[index].total_udhaar;
        state.items[index] = action.payload;
        state.totalUdhaar = state.totalUdhaar - oldUdhaar + action.payload.total_udhaar;
      }
    },

    // Delete customer
    deleteCustomer: (state, action: PayloadAction<string>) => {
      const customer = state.items.find(c => c.id === action.payload);
      if (customer) {
        state.totalUdhaar -= customer.total_udhaar;
      }
      state.items = state.items.filter(c => c.id !== action.payload);
    },

    // Set selected customer
    setSelectedCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.selectedCustomer = action.payload;
    },

    // Set payment history
    setPaymentHistory: (state, action: PayloadAction<Payment[]>) => {
      state.paymentHistory = action.payload;
    },

    // Add payment
    addPayment: (state, action: PayloadAction<Payment>) => {
      state.paymentHistory.push(action.payload);
    },

    // Set total udhaar
    setTotalUdhaar: (state, action: PayloadAction<number>) => {
      state.totalUdhaar = action.payload;
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Clear all
    clearCustomers: (state) => {
      state.items = [];
      state.selectedCustomer = null;
      state.paymentHistory = [];
      state.totalUdhaar = 0;
    },
  },
});

export const {
  setCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  setSelectedCustomer,
  setPaymentHistory,
  addPayment,
  setTotalUdhaar,
  setLoading,
  setError,
  clearCustomers,
} = customersSlice.actions;

export default customersSlice.reducer;
