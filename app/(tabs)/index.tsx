import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, Alert, ScrollView } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/src/store';
import { setTodaysSalesMetrics } from '@/src/store/slices/salesSlice';
import { setProducts } from '@/src/store/slices/productsSlice';
import { getTodaysSalesAmount, getTodaysTransactionCount } from '@/src/database/sales';
import { getAllProducts, getLowStockProducts } from '@/src/database/products';
import { formatCurrency } from '@/src/utils/currency';

export default function HomeScreen() {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const sales = useSelector((state: RootState) => state.sales);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const todaysSalesAmount = await getTodaysSalesAmount();
      const todaysTransactionCount = await getTodaysTransactionCount();
      dispatch(setTodaysSalesMetrics({ amount: todaysSalesAmount, count: todaysTransactionCount }));

      const allProducts = await getAllProducts();
      dispatch(setProducts(allProducts));

      const lowStock = await getLowStockProducts();
      setLowStockItems(lowStock);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const renderLowStockItem = ({ item }: any) => (
    <View className="bg-warning bg-opacity-10 border border-warning rounded-lg p-4 mb-3 flex-row items-center justify-between">
      <View className="flex-1">
        <Text className="text-base font-semibold text-foreground">{item.name}</Text>
        <Text className="text-sm text-muted mt-1">Stock: {item.stock_qty} / Min: {item.min_stock_qty}</Text>
      </View>
      <View className="bg-warning rounded-full px-3 py-1">
        <Text className="text-white font-bold text-xs">Low</Text>
      </View>
    </View>
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">Welcome back!</Text>
          <Text className="text-base text-muted mt-1">{auth.shopName || 'Your Shop'}</Text>
        </View>

        {/* Today's Metrics */}
        <View className="flex-row gap-4 mb-6">
          {/* Total Sales Card */}
          <View className="flex-1 bg-primary rounded-lg p-4">
            <Text className="text-sm text-white opacity-80">Today's Sales</Text>
            <Text className="text-2xl font-bold text-white mt-2">
              Rs. {sales.todaysSalesAmount.toLocaleString()}
            </Text>
          </View>

          {/* Transactions Card */}
          <View className="flex-1 bg-success rounded-lg p-4">
            <Text className="text-sm text-white opacity-80">Transactions</Text>
            <Text className="text-2xl font-bold text-white mt-2">{sales.todaysTransactionCount}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-foreground mb-3">Quick Actions</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity className="flex-1 bg-primary rounded-lg p-4 items-center">
              <Text className="text-2xl mb-2">💰</Text>
              <Text className="text-white font-semibold text-sm">New Sale</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1 bg-success rounded-lg p-4 items-center">
              <Text className="text-2xl mb-2">📦</Text>
              <Text className="text-white font-semibold text-sm">Add Product</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1 bg-warning rounded-lg p-4 items-center">
              <Text className="text-2xl mb-2">📊</Text>
              <Text className="text-white font-semibold text-sm">Reports</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-semibold text-foreground">⚠️ Low Stock Alerts</Text>
              <Text className="text-sm text-error font-semibold">{lowStockItems.length} items</Text>
            </View>
            <FlatList
              data={lowStockItems}
              renderItem={renderLowStockItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Empty State */}
        {lowStockItems.length === 0 && (
          <View className="bg-surface rounded-lg p-6 items-center">
            <Text className="text-4xl mb-2">✅</Text>
            <Text className="text-base font-semibold text-foreground">All items in stock</Text>
            <Text className="text-sm text-muted mt-2 text-center">
              No products below minimum stock level
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
