/**
 * Customer Detail Screen
 * View customer details, udhaar balance, and payment history
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, RefreshControl } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { getCustomerById } from '@/src/database/customers';
import { formatCurrency } from '@/src/utils/currency';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function CustomerDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const customerId = params.id;
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      const data = await getCustomerById(customerId!);
      setCustomer(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load customer');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomer();
  }, [customerId]);

  if (!customer) {
    return (
      <ScreenContainer className="p-4 items-center justify-center">
        <Text className="text-foreground">Loading...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <FlatList
        data={[{ key: 'content' }]}
        renderItem={() => (
          <View>
            {/* Header */}
            <Text className="text-2xl font-bold text-foreground mb-6">{customer.name}</Text>

            {/* Customer Info Card */}
            <View className="bg-surface rounded-lg p-4 mb-6 border border-border">
              <View className="mb-4">
                <Text className="text-sm text-muted mb-1">Phone</Text>
                <Text className="text-lg font-semibold text-foreground">{customer.phone}</Text>
              </View>
              <View>
                <Text className="text-sm text-muted mb-1">Customer ID</Text>
                <Text className="text-sm font-mono text-foreground">{customer.id}</Text>
              </View>
            </View>

            {/* Udhaar Balance */}
            {customer.total_udhaar > 0 && (
              <View className="bg-error bg-opacity-10 border border-error rounded-lg p-4 mb-6">
                <Text className="text-sm text-error font-semibold">Outstanding Udhaar</Text>
                <Text className="text-3xl font-bold text-error mt-2">
                  {formatCurrency(customer.total_udhaar)}
                </Text>
              </View>
            )}

            {customer.total_udhaar === 0 && (
              <View className="bg-success bg-opacity-10 border border-success rounded-lg p-4 mb-6 items-center">
                <Text className="text-4xl mb-2">✅</Text>
                <Text className="text-base font-semibold text-success">No outstanding balance</Text>
              </View>
            )}

            {/* Action Buttons */}
            <View className="gap-3">
              <TouchableOpacity
                onPress={() => router.back()}
                className="rounded-lg p-4 items-center border border-border"
              >
                <Text className="text-foreground font-semibold">Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={item => item.key}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadCustomer} />
        }
      />
    </ScreenContainer>
  );
}
