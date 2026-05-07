/**
 * Customers List Screen
 * Display all customers with udhaar balances and search
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, RefreshControl } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/src/store';
import { setCustomers, setTotalUdhaar } from '@/src/store/slices/customersSlice';
import { getAllCustomers, getTotalUdhaar, deleteCustomer } from '@/src/database/customers';
import { formatCurrency } from '@/src/utils/currency';

export default function CustomersListScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const customers = useSelector((state: RootState) => state.customers);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState(customers.items);

  // Load customers
  const loadCustomers = async () => {
    try {
      setLoading(true);
      const allCustomers = await getAllCustomers();
      const total = await getTotalUdhaar();
      dispatch(setCustomers(allCustomers));
      dispatch(setTotalUdhaar(total));
    } catch (error) {
      console.error('Error loading customers:', error);
      Alert.alert('Error', 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // Filter customers based on search
  useEffect(() => {
    if (searchQuery) {
      setFilteredCustomers(
        customers.items.filter(c =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.phone.includes(searchQuery)
        )
      );
    } else {
      setFilteredCustomers(customers.items);
    }
  }, [searchQuery, customers.items]);

  const handleDeleteCustomer = (customerId: string, customerName: string) => {
    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete "${customerName}"?`,
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteCustomer(customerId);
              await loadCustomers();
              Alert.alert('Success', 'Customer deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete customer');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderCustomerCard = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('CustomerDetail', { customerId: item.id })}
      className="bg-surface rounded-lg p-4 mb-3 border border-border"
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground">{item.name}</Text>
          <Text className="text-xs text-muted mt-1">{item.phone}</Text>
        </View>
        {item.total_udhaar > 0 && (
          <View className="bg-error rounded-lg px-3 py-1">
            <Text className="text-white text-xs font-bold">{formatCurrency(item.total_udhaar)}</Text>
          </View>
        )}
      </View>

      <View className="flex-row gap-2 mt-3">
        <TouchableOpacity
          onPress={() => navigation.navigate('CustomerDetail', { customerId: item.id })}
          className="flex-1 bg-primary rounded p-2 items-center"
        >
          <Text className="text-white text-sm font-semibold">View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteCustomer(item.id, item.name)}
          className="flex-1 bg-error rounded p-2 items-center"
        >
          <Text className="text-white text-sm font-semibold">Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer className="p-4">
      <FlatList
        data={filteredCustomers}
        renderItem={renderCustomerCard}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <View className="mb-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold text-foreground">Customers</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('AddCustomer')}
                className="bg-primary rounded-full px-4 py-2"
              >
                <Text className="text-white font-semibold">+ Add</Text>
              </TouchableOpacity>
            </View>

            {/* Total Udhaar Card */}
            {customers.totalUdhaar > 0 && (
              <View className="bg-error bg-opacity-10 border border-error rounded-lg p-4 mb-4">
                <Text className="text-sm text-error font-semibold">Total Udhaar</Text>
                <Text className="text-2xl font-bold text-error mt-2">
                  {formatCurrency(customers.totalUdhaar)}
                </Text>
              </View>
            )}

            {/* Search Bar */}
            <TextInput
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="bg-surface border border-border rounded-lg p-3 text-foreground"
              placeholderTextColor="#687076"
            />
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadCustomers} />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-4xl mb-2">👥</Text>
            <Text className="text-base font-semibold text-foreground">No customers</Text>
            <Text className="text-sm text-muted mt-2 text-center">Add your first customer</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}
