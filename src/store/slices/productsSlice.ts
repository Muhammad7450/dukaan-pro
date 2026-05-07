/**
 * Products Redux Slice
 * Manages products inventory state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '../../database/products';

export interface ProductsState {
  items: Product[];
  categories: string[];
  selectedCategory: string | null;
  searchQuery: string;
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  categories: [],
  selectedCategory: null,
  searchQuery: '',
  loading: false,
  error: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // Set all products
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
      state.error = null;
    },

    // Add product
    addProduct: (state, action: PayloadAction<Product>) => {
      state.items.push(action.payload);
    },

    // Update product
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.items.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },

    // Delete product
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(p => p.id !== action.payload);
    },

    // Set categories
    setCategories: (state, action: PayloadAction<string[]>) => {
      state.categories = action.payload;
    },

    // Set selected category
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },

    // Set search query
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
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
    clearProducts: (state) => {
      state.items = [];
      state.categories = [];
      state.selectedCategory = null;
      state.searchQuery = '';
    },
  },
});

export const {
  setProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  setCategories,
  setSelectedCategory,
  setSearchQuery,
  setLoading,
  setError,
  clearProducts,
} = productsSlice.actions;

export default productsSlice.reducer;
