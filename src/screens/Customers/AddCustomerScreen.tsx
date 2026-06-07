/**
 * Add Customer Screen
 * Form to add a new customer
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { addCustomer } from '@/src/database/customers';
import { generateCustomerId } from '@/src/utils/id';

export default function AddCustomerScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
  });

  const handleSave = async () => {
    // Validation
    if (!form.name.trim()) {
      Alert.alert('Required', 'Please enter customer name');
      return;
    }
    if (!form.phone.trim()) {
      Alert.alert('Required', 'Please enter phone number');
      return;
    }
    if (form.phone.length < 10) {
      Alert.alert('Invalid', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      await addCustomer({
        id: generateCustomerId(),
        name: form.name,
        phone: form.phone,
        total_udhaar: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      Alert.alert('Success', 'Customer added');
      router.back();
    } catch (error) {
      console.error('Add customer error:', error);
      Alert.alert('Error', 'Failed to add customer: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-foreground mb-6">Add Customer</Text>

        {/* Customer Name */}
        <View className="mb-4">
          <Text className="text-base font-semibold text-foreground mb-2">Customer Name *</Text>
          <TextInput
            placeholder="e.g., Ahmed Khan"
            value={form.name}
            onChangeText={text => setForm({ ...form, name: text })}
            className="bg-surface border border-border rounded-lg p-4 text-foreground"
            placeholderTextColor="#687076"
            editable={!loading}
          />
        </View>

        {/* Phone Number */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-foreground mb-2">Phone Number *</Text>
          <TextInput
            placeholder="e.g., 03001234567"
            value={form.phone}
            onChangeText={text => setForm({ ...form, phone: text })}
            keyboardType="phone-pad"
            className="bg-surface border border-border rounded-lg p-4 text-foreground"
            placeholderTextColor="#687076"
            editable={!loading}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className={`rounded-lg p-4 items-center mb-4 ${
            loading ? 'bg-muted' : 'bg-primary'
          }`}
        >
          <Text className="text-white font-semibold text-lg">
            {loading ? 'Saving...' : 'Add Customer'}
          </Text>
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          disabled={loading}
          className="rounded-lg p-4 items-center border border-border"
        >
          <Text className="text-foreground font-semibold">Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
