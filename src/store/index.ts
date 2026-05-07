/**
 * Redux Store Configuration
 * Central state management for DukaanPro
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productsReducer from './slices/productsSlice';
import salesReducer from './slices/salesSlice';
import customersReducer from './slices/customersSlice';
import reportsReducer from './slices/reportsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    sales: salesReducer,
    customers: customersReducer,
    reports: reportsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
