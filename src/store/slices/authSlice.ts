/**
 * Auth Redux Slice
 * Manages authentication state (PIN, shop setup, user info)
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  isLoggedIn: boolean;
  isPinSet: boolean;
  isSetupComplete: boolean;
  shopName: string;
  ownerName: string;
  pin: string;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  isPinSet: false,
  isSetupComplete: false,
  shopName: '',
  ownerName: '',
  pin: '',
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set PIN
    setPIN: (state, action: PayloadAction<string>) => {
      state.pin = action.payload;
      state.isPinSet = true;
    },

    // Complete shop setup
    completeSetup: (state, action: PayloadAction<{ shopName: string; ownerName: string }>) => {
      state.shopName = action.payload.shopName;
      state.ownerName = action.payload.ownerName;
      state.isSetupComplete = true;
    },

    // Login with PIN
    loginWithPIN: (state) => {
      state.isLoggedIn = true;
      state.error = null;
    },

    // Login failed
    loginFailed: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },

    // Logout
    logout: (state) => {
      state.isLoggedIn = false;
      state.error = null;
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Restore auth state from storage
    restoreAuthState: (state, action: PayloadAction<Partial<AuthState>>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const {
  setPIN,
  completeSetup,
  loginWithPIN,
  loginFailed,
  logout,
  setLoading,
  clearError,
  restoreAuthState,
} = authSlice.actions;

export default authSlice.reducer;
