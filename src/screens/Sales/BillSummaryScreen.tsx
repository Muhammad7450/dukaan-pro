/**
 * Bill Summary Screen
 * Review sale items, select payment type, and complete the sale
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, ScrollView } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/src/store';
import { clearCurrentSale } from '@/src/store/slices/salesSlice';
import { createSale } from '@/src/database/sales';
import { decreaseStock } from '@/src/database/products';
import { getCustomerByPhone } from '@/src/database/customers';
import { addUdhaar } from '@/src/database/customers';
import { formatCurrency } from '@/src/utils/currency';
import { generateSaleId } from '@/src/utils/id';
import { shareBillViaWhatsApp, formatBillForWhatsApp } from '@/src/utils/whatsapp';

export default function BillSummaryScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const sales = useSelector((state: RootState) => state.sales);
  const [loading, setLoading] = useState(false);

  const handleConfirmSale = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const saleId = generateSaleId();

      // Create sale in database
      await createSale(
        saleId,
        sales.currentSale.totalAmount,
        sales.currentSale.paymentType,
        sales.currentSale.customerId,
        sales.currentSale.items.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
        }))
      );

      // Decrease stock for each product
      for (const item of sales.currentSale.items) {
        await decreaseStock(item.product_id, item.quantity);
      }

      // If udhaar, add to customer balance
      if (sales.currentSale.paymentType === 'udhaar' && sales.currentSale.customerId) {
        await addUdhaar(sales.currentSale.customerId, sales.currentSale.totalAmount);
      }

      // Clear current sale from Redux
      dispatch(clearCurrentSale());

      Alert.alert('Success', 'Sale completed successfully!');
      navigation.navigate('Dashboard');
    } catch (error) {
      console.error('Error completing sale:', error);
      Alert.alert('Error', 'Failed to complete sale');
    } finally {
      setLoading(false);
    }
  };

  const handleShareBill = async () => {
    try {
      const billText = formatBillForWhatsApp(
        auth.shopName,
        sales.currentSale.items.map(item => ({
          name: item.product_name,
          quantity: item.quantity,
          price: item.unit_price,
        })),
        sales.currentSale.totalAmount,
        sales.currentSale.paymentType
      );

      // For now, just copy to clipboard or show message
      Alert.alert('Bill Text', billText);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate bill');
    }
  };

  const renderSaleItem = ({ item }: any) => (
    <View className="flex-row justify-between items-center py-3 border-b border-border">
      <View className="flex-1">
        <Text className="text-base font-semibold text-foreground">{item.product_name}</Text>
        <Text className="text-sm text-muted mt-1">
          {item.quantity} × {formatCurrency(item.unit_price)}
        </Text>
      </View>
      <Text className="text-base font-bold text-foreground">{formatCurrency(item.subtotal)}</Text>
    </View>
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text className="text-2xl font-bold text-foreground mb-6">Bill Summary</Text>

        {/* Sale Items */}
        <View className="bg-surface rounded-lg p-4 mb-6 border border-border">
          <FlatList
            data={sales.currentSale.items}
            renderItem={renderSaleItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />

          {/* Totals */}
          <View className="border-t border-border pt-4 mt-4">
            <View className="flex-row justify-between mb-3">
              <Text className="text-base text-muted">Subtotal</Text>
              <Text className="text-base font-semibold text-foreground">
                {formatCurrency(sales.currentSale.totalAmount)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-lg font-bold text-foreground">Total</Text>
              <Text className="text-2xl font-bold text-primary">
                {formatCurrency(sales.currentSale.totalAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Type */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-foreground mb-3">Payment Type</Text>
          <View className="bg-surface rounded-lg p-4 border border-border">
            <Text className="text-lg font-bold text-primary">
              {sales.currentSale.paymentType === 'cash' ? '💰 Cash' : '📝 Udhaar'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="gap-3 mb-4">
          <TouchableOpacity
            onPress={handleConfirmSale}
            disabled={loading}
            className={`rounded-lg p-4 items-center ${
              loading ? 'bg-muted' : 'bg-primary'
            }`}
          >
            <Text className="text-white font-semibold text-lg">
              {loading ? 'Processing...' : 'Confirm Sale'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShareBill}
            disabled={loading}
            className="rounded-lg p-4 items-center bg-success"
          >
            <Text className="text-white font-semibold text-lg">📱 Share Bill</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            disabled={loading}
            className="rounded-lg p-4 items-center border border-border"
          >
            <Text className="text-foreground font-semibold">Edit Sale</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
