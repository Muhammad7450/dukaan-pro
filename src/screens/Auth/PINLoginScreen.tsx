/**
 * PIN Login Screen
 * 4-digit PIN entry for authentication
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useDispatch } from 'react-redux';
import { loginWithPIN, loginFailed } from '@/src/store/slices/authSlice';
import { getPIN } from '@/src/utils/storage';

export default function PINLoginScreen() {
  const dispatch = useDispatch();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePINPress = (digit: string) => {
    if (pin.length < 4) {
      setPin(pin + digit);
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const handleLogin = async () => {
    if (pin.length !== 4) {
      Alert.alert('Invalid PIN', 'Please enter a 4-digit PIN');
      return;
    }

    setLoading(true);
    try {
      const savedPin = await getPIN();
      if (savedPin === pin) {
        dispatch(loginWithPIN());
      } else {
        dispatch(loginFailed('Incorrect PIN'));
        Alert.alert('Login Failed', 'Incorrect PIN. Please try again.');
        setPin('');
      }
    } catch (error) {
      console.error('Login error:', error);
      dispatch(loginFailed('Login error'));
      Alert.alert('Error', 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const PIN_BUTTONS = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', ''],
  ];

  return (
    <ScreenContainer className="justify-center items-center p-6">
      <View className="w-full max-w-sm">
        {/* Header */}
        <View className="items-center mb-12">
          <Text className="text-4xl font-bold text-foreground mb-2">🏪</Text>
          <Text className="text-2xl font-bold text-foreground">DukaanPro</Text>
          <Text className="text-base text-muted mt-2">Enter your PIN to login</Text>
        </View>

        {/* PIN Display */}
        <View className="bg-surface rounded-lg p-6 mb-8 items-center">
          <View className="flex-row gap-3">
            {[0, 1, 2, 3].map(index => (
              <View
                key={index}
                className="w-12 h-12 rounded-lg border-2 border-border bg-background items-center justify-center"
              >
                <Text className="text-2xl font-bold text-foreground">
                  {pin[index] ? '●' : ''}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* PIN Keypad */}
        <View className="gap-3 mb-8">
          {PIN_BUTTONS.map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row gap-3 justify-center">
              {row.map((digit, colIndex) => (
                <TouchableOpacity
                  key={`${rowIndex}-${colIndex}`}
                  onPress={() => digit && handlePINPress(digit)}
                  disabled={!digit || loading}
                  className={`w-16 h-16 rounded-lg items-center justify-center ${
                    digit
                      ? 'bg-primary'
                      : 'bg-transparent'
                  } ${loading ? 'opacity-50' : ''}`}
                >
                  <Text className="text-2xl font-bold text-white">{digit}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        {/* Backspace Button */}
        <TouchableOpacity
          onPress={handleBackspace}
          disabled={loading || pin.length === 0}
          className="bg-error rounded-lg p-4 mb-4 items-center"
        >
          <Text className="text-white font-semibold">← Backspace</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading || pin.length !== 4}
          className={`rounded-lg p-4 items-center ${
            pin.length === 4 ? 'bg-primary' : 'bg-muted'
          } ${loading ? 'opacity-50' : ''}`}
        >
          <Text className="text-white font-semibold text-lg">
            {loading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
