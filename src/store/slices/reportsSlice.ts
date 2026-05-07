/**
 * Reports Redux Slice
 * Manages reports and analytics state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface BestSellingProduct {
  product_name: string;
  total_qty: number;
  total_revenue: number;
}

export interface ReportsState {
  timeFilter: 'today' | 'week' | 'month';
  totalSales: number;
  totalProfit: number;
  totalTransactions: number;
  bestSellingProducts: BestSellingProduct[];
  weeklySalesData: Array<{ day: string; amount: number }>;
  loading: boolean;
  error: string | null;
}

const initialState: ReportsState = {
  timeFilter: 'today',
  totalSales: 0,
  totalProfit: 0,
  totalTransactions: 0,
  bestSellingProducts: [],
  weeklySalesData: [],
  loading: false,
  error: null,
};

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    // Set time filter
    setTimeFilter: (state, action: PayloadAction<'today' | 'week' | 'month'>) => {
      state.timeFilter = action.payload;
    },

    // Set sales metrics
    setSalesMetrics: (
      state,
      action: PayloadAction<{
        totalSales: number;
        totalProfit: number;
        totalTransactions: number;
      }>
    ) => {
      state.totalSales = action.payload.totalSales;
      state.totalProfit = action.payload.totalProfit;
      state.totalTransactions = action.payload.totalTransactions;
    },

    // Set best selling products
    setBestSellingProducts: (state, action: PayloadAction<BestSellingProduct[]>) => {
      state.bestSellingProducts = action.payload;
    },

    // Set weekly sales data
    setWeeklySalesData: (state, action: PayloadAction<Array<{ day: string; amount: number }>>) => {
      state.weeklySalesData = action.payload;
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
    clearReports: (state) => {
      state.timeFilter = 'today';
      state.totalSales = 0;
      state.totalProfit = 0;
      state.totalTransactions = 0;
      state.bestSellingProducts = [];
      state.weeklySalesData = [];
    },
  },
});

export const {
  setTimeFilter,
  setSalesMetrics,
  setBestSellingProducts,
  setWeeklySalesData,
  setLoading,
  setError,
  clearReports,
} = reportsSlice.actions;

export default reportsSlice.reducer;
