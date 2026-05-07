/**
 * Shop Setup Screen
 * First-time setup: shop name, owner name, PIN creation
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useDispatch } from 'react-redux';
import { completeSetup, setPIN } from '@/src/store/slices/authSlice';
import { saveShopSetup, savePIN } from '@/src/utils/storage';

export default function ShopSetupScreen() {
  const dispatch = useDispatch();
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'info' | 'pin'>('info');
  const [loading, setLoading] = useState(false);

  const handleNextStep = () => {
    if (!shopName.trim()) {
      Alert.alert('Required', 'Please enter shop name');
      return;
    }
    if (!ownerName.trim()) {
      Alert.alert('Required', 'Please enter owner name');
      return;
    }
    setStep('pin');
  };

  const handleSetupComplete = async () => {
    if (pin.length !== 4) {
      Alert.alert('Invalid PIN', 'PIN must be 4 digits');
      return;
    }
    if (pin !== confirmPin) {
      Alert.alert('PIN Mismatch', 'PINs do not match');
      return;
    }

    setLoading(true);
    try {
      // Save to AsyncStorage
      await saveShopSetup(shopName, ownerName);
      await savePIN(pin);

      // Update Redux
      dispatch(completeSetup({ shopName, ownerName }));
      dispatch(setPIN(pin));

      Alert.alert('Success', 'Setup complete! You can now login.');
    } catch (error) {
      console.error('Setup error:', error);
      Alert.alert('Error', 'Failed to complete setup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="items-center mb-8 mt-8">
          <Text className="text-4xl font-bold text-foreground mb-2">🏪</Text>
          <Text className="text-2xl font-bold text-foreground">Welcome to DukaanPro</Text>
          <Text className="text-base text-muted mt-2 text-center">
            {step === 'info' ? 'Tell us about your shop' : 'Create a secure PIN'}
          </Text>
        </View>

        {step === 'info' ? (
          // Step 1: Shop Info
          <View className="flex-1 gap-6">
            {/* Shop Name Input */}
            <View>
              <Text className="text-base font-semibold text-foreground mb-2">Shop Name</Text>
              <TextInput
                placeholder="e.g., Ahmed's General Store"
                value={shopName}
                onChangeText={setShopName}
                className="bg-surface border border-border rounded-lg p-4 text-foreground"
                placeholderTextColor="#687076"
                editable={!loading}
              />
            </View>

            {/* Owner Name Input */}
            <View>
              <Text className="text-base font-semibold text-foreground mb-2">Owner Name</Text>
              <TextInput
                placeholder="e.g., Ahmed Khan"
                value={ownerName}
                onChangeText={setOwnerName}
                className="bg-surface border border-border rounded-lg p-4 text-foreground"
                placeholderTextColor="#687076"
                editable={!loading}
              />
            </View>

            {/* Next Button */}
            <TouchableOpacity
              onPress={handleNextStep}
              disabled={loading}
              className={`rounded-lg p-4 items-center mt-6 ${
                shopName.trim() && ownerName.trim() ? 'bg-primary' : 'bg-muted'
              } ${loading ? 'opacity-50' : ''}`}
            >
              <Text className="text-white font-semibold text-lg">Next</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Step 2: PIN Setup
          <View className="flex-1 gap-6">
            <View>
              <Text className="text-base font-semibold text-foreground mb-2">Create PIN (4 digits)</Text>
              <TextInput
                placeholder="e.g., 1234"
                value={pin}
                onChangeText={setPin}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                className="bg-surface border border-border rounded-lg p-4 text-foreground text-center text-2xl"
                placeholderTextColor="#687076"
                editable={!loading}
              />
            </View>

            <View>
              <Text className="text-base font-semibold text-foreground mb-2">Confirm PIN</Text>
              <TextInput
                placeholder="Re-enter PIN"
                value={confirmPin}
                onChangeText={setConfirmPin}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                className="bg-surface border border-border rounded-lg p-4 text-foreground text-center text-2xl"
                placeholderTextColor="#687076"
                editable={!loading}
              />
            </View>

            <View className="bg-warning bg-opacity-10 border border-warning rounded-lg p-4 mt-4">
              <Text className="text-sm text-warning font-semibold">⚠️ Important</Text>
              <Text className="text-sm text-foreground mt-2">
                Remember your PIN. You'll need it to login every time.
              </Text>
            </View>

            {/* Back Button */}
            <TouchableOpacity
              onPress={() => setStep('info')}
              disabled={loading}
              className="rounded-lg p-4 items-center bg-surface border border-border"
            >
              <Text className="text-foreground font-semibold">← Back</Text>
            </TouchableOpacity>

            {/* Complete Setup Button */}
            <TouchableOpacity
              onPress={handleSetupComplete}
              disabled={loading || pin.length !== 4 || confirmPin.length !== 4}
              className={`rounded-lg p-4 items-center ${
                pin.length === 4 && confirmPin.length === 4 ? 'bg-primary' : 'bg-muted'
              } ${loading ? 'opacity-50' : ''}`}
            >
              <Text className="text-white font-semibold text-lg">
                {loading ? 'Setting up...' : 'Complete Setup'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
