/**
 * Sales Redux Slice
 * Manages sales and billing state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Sale, SaleItem, SaleWithItems } from '../../database/sales';

export interface SalesState {
  sales: Sale[];
  currentSale: {
    items: SaleItem[];
    totalAmount: number;
    paymentType: 'cash' | 'udhaar';
    customerId: string | null;
  };
  todaysSalesAmount: number;
  todaysTransactionCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: SalesState = {
  sales: [],
  currentSale: {
    items: [],
    totalAmount: 0,
    paymentType: 'cash',
    customerId: null,
  },
  todaysSalesAmount: 0,
  todaysTransactionCount: 0,
  loading: false,
  error: null,
};

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    // Set all sales
    setSales: (state, action: PayloadAction<Sale[]>) => {
      state.sales = action.payload;
    },

    // Add sale item to current sale
    addSaleItem: (state, action: PayloadAction<SaleItem>) => {
      state.currentSale.items.push(action.payload);
      state.currentSale.totalAmount += action.payload.subtotal;
    },

    // Update sale item quantity
    updateSaleItemQuantity: (
      state,
      action: PayloadAction<{ itemId: string; quantity: number; subtotal: number }>
    ) => {
      const item = state.currentSale.items.find(i => i.id === action.payload.itemId);
      if (item) {
        state.currentSale.totalAmount -= item.subtotal;
        item.quantity = action.payload.quantity;
        item.subtotal = action.payload.subtotal;
        state.currentSale.totalAmount += action.payload.subtotal;
      }
    },

    // Remove sale item
    removeSaleItem: (state, action: PayloadAction<string>) => {
      const item = state.currentSale.items.find(i => i.id === action.payload);
      if (item) {
        state.currentSale.totalAmount -= item.subtotal;
        state.currentSale.items = state.currentSale.items.filter(i => i.id !== action.payload);
      }
    },

    // Set payment type
    setPaymentType: (state, action: PayloadAction<'cash' | 'udhaar'>) => {
      state.currentSale.paymentType = action.payload;
    },

    // Set customer for udhaar
    setCustomerForUdhaar: (state, action: PayloadAction<string>) => {
      state.currentSale.customerId = action.payload;
    },

    // Clear current sale
    clearCurrentSale: (state) => {
      state.currentSale = {
        items: [],
        totalAmount: 0,
        paymentType: 'cash',
        customerId: null,
      };
    },

    // Set today's sales metrics
    setTodaysSalesMetrics: (
      state,
      action: PayloadAction<{ amount: number; count: number }>
    ) => {
      state.todaysSalesAmount = action.payload.amount;
      state.todaysTransactionCount = action.payload.count;
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setSales,
  addSaleItem,
  updateSaleItemQuantity,
  removeSaleItem,
  setPaymentType,
  setCustomerForUdhaar,
  clearCurrentSale,
  setTodaysSalesMetrics,
  setLoading,
  setError,
} = salesSlice.actions;

export default salesSlice.reducer;
