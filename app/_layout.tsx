import "@/global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { Platform } from "react-native";
import "@/lib/_core/nativewind-pressable";
import { ThemeProvider } from "@/lib/theme-provider";
import {
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import type { EdgeInsets, Metrics, Rect } from "react-native-safe-area-context";

import { trpc, createTRPCClient } from "@/lib/trpc";
import { initManusRuntime, subscribeSafeAreaInsets } from "@/lib/_core/manus-runtime";
import { Provider, useSelector, useDispatch } from "react-redux";
import { store } from "@/src/store";
import type { RootState } from "@/src/store";
import { restoreAuthState } from "@/src/store/slices/authSlice";
import { getAuthState, isSetupComplete } from "@/src/utils/storage";
import { initializeDatabase } from "@/src/database/schema";
import SplashScreen from "@/src/screens/SplashScreen";

const DEFAULT_WEB_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_WEB_FRAME: Rect = { x: 0, y: 0, width: 0, height: 0 };

// Removed unstable_settings.anchor to allow proper auth gating

/**
 * Root Layout with Auth Navigation
 * Handles authentication flow and Redux state management
 */
function RootLayoutNav() {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const [isReady, setIsReady] = useState(false);

  // Initialize database and restore auth state
  useEffect(() => {
    async function initializeApp() {
      try {
        console.log('Initializing app...');
        
        // Initialize SQLite database first
        const db = await initializeDatabase();
        console.log('Database initialized:', db ? 'success' : 'web platform');

        // Restore auth state from AsyncStorage
        const savedAuthState = await getAuthState();
        console.log('Saved auth state:', savedAuthState);
        
        if (savedAuthState) {
          dispatch(restoreAuthState(savedAuthState));
          console.log('Auth state restored');
        } else {
          console.log('No saved auth state - first time user');
        }
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        setIsReady(true);
        console.log('App ready');
      }
    }

    initializeApp();
  }, [dispatch]);

  const initialInsets = initialWindowMetrics?.insets ?? DEFAULT_WEB_INSETS;
  const initialFrame = initialWindowMetrics?.frame ?? DEFAULT_WEB_FRAME;

  const [insets, setInsets] = useState<EdgeInsets>(initialInsets);
  const [frame, setFrame] = useState<Rect>(initialFrame);

  // Initialize Manus runtime for cookie injection from parent container
  useEffect(() => {
    initManusRuntime();
  }, []);

  const handleSafeAreaUpdate = useCallback((metrics: Metrics) => {
    setInsets(metrics.insets);
    setFrame(metrics.frame);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const unsubscribe = subscribeSafeAreaInsets(handleSafeAreaUpdate);
    return () => unsubscribe();
  }, [handleSafeAreaUpdate]);

  // Create clients once and reuse them
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Disable automatic refetching on window focus for mobile
            refetchOnWindowFocus: false,
            // Retry failed requests once
            retry: 1,
          },
        },
      }),
  );
  const [trpcClient] = useState(() => createTRPCClient());

  // Ensure minimum 8px padding for top and bottom on mobile
  const providerInitialMetrics = useMemo(() => {
    const metrics = initialWindowMetrics ?? { insets: initialInsets, frame: initialFrame };
    return {
      ...metrics,
      insets: {
        ...metrics.insets,
        top: Math.max(metrics.insets.top, 16),
        bottom: Math.max(metrics.insets.bottom, 12),
      },
    };
  }, [initialInsets, initialFrame]);

  if (!isReady) {
    // Show splash screen while initializing
    return (
      <ThemeProvider>
        <SafeAreaProvider initialMetrics={providerInitialMetrics}>
          <SafeAreaFrameContext.Provider value={frame}>
            <SafeAreaInsetsContext.Provider value={insets}>
              <SplashScreen />
            </SafeAreaInsetsContext.Provider>
          </SafeAreaFrameContext.Provider>
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  const content = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }}>
            {!auth.isSetupComplete ? (
              // Setup screen for first-time users
              <Stack.Screen
                name="setup"
                options={{
                  headerShown: false,
                }}
              />
            ) : !auth.isLoggedIn ? (
              // Login screen
              <Stack.Screen
                name="login"
                options={{
                  headerShown: false,
                }}
              />
            ) : (
              // Main app navigation
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerShown: false,
                }}
              />
            )}
            <Stack.Screen name="oauth/callback" />
          </Stack>
          <StatusBar style="auto" />
        </QueryClientProvider>
      </trpc.Provider>
    </GestureHandlerRootView>
  );

  const shouldOverrideSafeArea = Platform.OS === "web";

  if (shouldOverrideSafeArea) {
    return (
      <ThemeProvider>
        <SafeAreaProvider initialMetrics={providerInitialMetrics}>
          <SafeAreaFrameContext.Provider value={frame}>
            <SafeAreaInsetsContext.Provider value={insets}>
              {content}
            </SafeAreaInsetsContext.Provider>
          </SafeAreaFrameContext.Provider>
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider initialMetrics={providerInitialMetrics}>{content}</SafeAreaProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootLayoutNav />
    </Provider>
  );
}
