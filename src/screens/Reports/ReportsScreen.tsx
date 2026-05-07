/**
 * Reports Screen
 * Display sales analytics, metrics, and best-selling products
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, RefreshControl } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/src/store';
import { setTimeFilter, setSalesMetrics, setBestSellingProducts } from '@/src/store/slices/reportsSlice';
import { getTotalSalesForRange, getTotalProfitForRange, getBestSellingProducts } from '@/src/database/sales';
import { getDateRange } from '@/src/utils/dates';
import { formatCurrency } from '@/src/utils/currency';

export default function ReportsScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const reports = useSelector((state: RootState) => state.reports);
  const [loading, setLoading] = useState(false);

  // Load reports data
  const loadReports = async () => {
    try {
      setLoading(true);
      const { start, end } = getDateRange(reports.timeFilter);

      // Get sales metrics
      const totalSales = await getTotalSalesForRange(start, end);
      const totalProfit = await getTotalProfitForRange(start, end);

      // Get best selling products
      const bestSelling = await getBestSellingProducts(5);

      dispatch(setSalesMetrics({
        totalSales,
        totalProfit,
        totalTransactions: 0, // Will be calculated from sales data
      }));
      dispatch(setBestSellingProducts(bestSelling));
    } catch (error) {
      console.error('Error loading reports:', error);
      Alert.alert('Error', 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [reports.timeFilter]);

  const handleTimeFilterChange = (filter: 'today' | 'week' | 'month') => {
    dispatch(setTimeFilter(filter));
  };

  const renderMetricCard = (title: string, value: string, color: string) => (
    <View className={`flex-1 ${color} rounded-lg p-4 items-center`}>
      <Text className="text-white text-sm opacity-80">{title}</Text>
      <Text className="text-white text-2xl font-bold mt-2">{value}</Text>
    </View>
  );

  const renderBestSellingItem = ({ item }: any) => (
    <View className="bg-surface rounded-lg p-4 mb-3 border border-border flex-row justify-between items-center">
      <View className="flex-1">
        <Text className="text-base font-semibold text-foreground">{item.product_name}</Text>
        <Text className="text-sm text-muted mt-1">Qty: {item.total_qty}</Text>
      </View>
      <Text className="text-base font-bold text-primary">{formatCurrency(item.total_revenue)}</Text>
    </View>
  );

  return (
    <ScreenContainer className="p-4">
      <FlatList
        data={[{ key: 'content' }]}
        renderItem={() => (
          <View>
            {/* Header */}
            <Text className="text-2xl font-bold text-foreground mb-4">Reports</Text>

            {/* Time Filter */}
            <View className="flex-row gap-2 mb-6">
              {(['today', 'week', 'month'] as const).map(filter => (
                <TouchableOpacity
                  key={filter}
                  onPress={() => handleTimeFilterChange(filter)}
                  className={`flex-1 rounded-lg p-3 items-center ${
                    reports.timeFilter === filter
                      ? 'bg-primary'
                      : 'bg-surface border border-border'
                  }`}
                >
                  <Text
                    className={`font-semibold capitalize ${
                      reports.timeFilter === filter
                        ? 'text-white'
                        : 'text-foreground'
                    }`}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Metrics Cards */}
            <View className="flex-row gap-3 mb-6">
              {renderMetricCard('Total Sales', formatCurrency(reports.totalSales), 'bg-primary')}
              {renderMetricCard('Total Profit', formatCurrency(reports.totalProfit), 'bg-success')}
            </View>

            {/* Best Selling Products */}
            <View>
              <Text className="text-lg font-bold text-foreground mb-3">🏆 Best Selling Products</Text>
              {reports.bestSellingProducts.length > 0 ? (
                <FlatList
                  data={reports.bestSellingProducts}
                  renderItem={renderBestSellingItem}
                  keyExtractor={(item, index) => index.toString()}
                  scrollEnabled={false}
                />
              ) : (
                <View className="bg-surface rounded-lg p-6 items-center border border-border">
                  <Text className="text-4xl mb-2">📊</Text>
                  <Text className="text-base font-semibold text-foreground">No sales data</Text>
                  <Text className="text-sm text-muted mt-2 text-center">
                    Complete some sales to see reports
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
        keyExtractor={item => item.key}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadReports} />
        }
      />
    </ScreenContainer>
  );
}
