/**
 * AsyncStorage Utilities
 * Helper functions for persisting app state
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  AUTH_STATE: '@dukaan_pro_auth',
  SHOP_NAME: '@dukaan_pro_shop_name',
  OWNER_NAME: '@dukaan_pro_owner_name',
  PIN: '@dukaan_pro_pin',
  SETUP_COMPLETE: '@dukaan_pro_setup_complete',
};

/**
 * Save auth state
 */
export async function saveAuthState(authState: any): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_STATE, JSON.stringify(authState));
  } catch (error) {
    console.error('Error saving auth state:', error);
  }
}

/**
 * Get auth state
 */
export async function getAuthState(): Promise<any | null> {
  try {
    const state = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_STATE);
    return state ? JSON.parse(state) : null;
  } catch (error) {
    console.error('Error getting auth state:', error);
    return null;
  }
}

/**
 * Save shop setup
 */
export async function saveShopSetup(shopName: string, ownerName: string): Promise<void> {
  try {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.SHOP_NAME, shopName],
      [STORAGE_KEYS.OWNER_NAME, ownerName],
      [STORAGE_KEYS.SETUP_COMPLETE, 'true'],
    ]);
  } catch (error) {
    console.error('Error saving shop setup:', error);
  }
}

/**
 * Get shop setup
 */
export async function getShopSetup(): Promise<{ shopName: string; ownerName: string } | null> {
  try {
    const [shopName, ownerName] = await AsyncStorage.multiGet([
      STORAGE_KEYS.SHOP_NAME,
      STORAGE_KEYS.OWNER_NAME,
    ]);

    if (shopName[1] && ownerName[1]) {
      return {
        shopName: shopName[1],
        ownerName: ownerName[1],
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting shop setup:', error);
    return null;
  }
}

/**
 * Save PIN
 */
export async function savePIN(pin: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PIN, pin);
  } catch (error) {
    console.error('Error saving PIN:', error);
  }
}

/**
 * Get PIN
 */
export async function getPIN(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.PIN);
  } catch (error) {
    console.error('Error getting PIN:', error);
    return null;
  }
}

/**
 * Check if setup is complete
 */
export async function isSetupComplete(): Promise<boolean> {
  try {
    const result = await AsyncStorage.getItem(STORAGE_KEYS.SETUP_COMPLETE);
    return result === 'true';
  } catch (error) {
    console.error('Error checking setup status:', error);
    return false;
  }
}

/**
 * Clear all auth data
 */
export async function clearAuthData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_STATE,
      STORAGE_KEYS.SHOP_NAME,
      STORAGE_KEYS.OWNER_NAME,
      STORAGE_KEYS.PIN,
      STORAGE_KEYS.SETUP_COMPLETE,
    ]);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
}
