/**
 * Splash Screen
 * Animated welcome screen with DukaanPro branding
 */

import React, { useEffect } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { useColors } from '@/hooks/use-colors';

export default function SplashScreen() {
  const colors = useColors();
  const logoScale = React.useRef(new Animated.Value(0.3)).current;
  const logoOpacity = React.useRef(new Animated.Value(0)).current;
  const textOpacity = React.useRef(new Animated.Value(0)).current;
  const loadingOpacity = React.useRef(new Animated.Value(0)).current;
  const progressWidth = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // Text animation
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Loading animation
      Animated.timing(loadingOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Progress bar animation
      Animated.timing(progressWidth, {
        toValue: 100,
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  return (
    <View className="flex-1 bg-background items-center justify-center">
      {/* Background gradient effect */}
      <View className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />

      {/* Logo */}
      <Animated.View
        style={{
          transform: [{ scale: logoScale }],
          opacity: logoOpacity,
        }}
        className="mb-8"
      >
        <View className="w-32 h-32 rounded-full bg-primary/10 border-2 border-primary items-center justify-center">
          <Text className="text-6xl">🏪</Text>
        </View>
      </Animated.View>

      {/* App Name */}
      <Animated.View style={{ opacity: textOpacity }} className="mb-2 items-center">
        <Text className="text-4xl font-bold text-foreground">
          <Text className="text-foreground">Dukaan</Text>
          <Text className="text-primary">Pro</Text>
        </Text>
      </Animated.View>

      {/* Slogan */}
      <Animated.View style={{ opacity: textOpacity }} className="mb-12">
        <Text className="text-sm text-muted text-center">
          Dukaan Tumhari, Hisaab Hamara
        </Text>
        <Text className="text-xs text-muted/60 text-center mt-2">
          SMART SHOP · PAKISTAN
        </Text>
      </Animated.View>

      {/* Loading Bar */}
      <Animated.View style={{ opacity: loadingOpacity }} className="w-40">
        <View className="h-1 bg-surface rounded-full overflow-hidden mb-3">
          <Animated.View
            style={{
              width: progressWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            }}
            className="h-full bg-gradient-to-r from-primary via-success to-primary rounded-full"
          />
        </View>
        <Text className="text-xs text-muted text-center">
          Loading your store…
        </Text>
      </Animated.View>

      {/* Bottom branding */}
      <View className="absolute bottom-8 items-center">
        <Text className="text-xs text-muted/40">Powered by DukaanPro</Text>
      </View>
    </View>
  );
}
