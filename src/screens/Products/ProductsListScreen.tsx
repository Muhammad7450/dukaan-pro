/**
 * Products List Screen
 * Display all products with search, filter, and CRUD operations
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, RefreshControl } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/src/store';
import { setProducts, setCategories, setSelectedCategory, setSearchQuery } from '@/src/store/slices/productsSlice';
import { getAllProducts, getCategories, deleteProduct } from '@/src/database/products';
import { formatCurrency } from '@/src/utils/currency';
import { useRouter } from 'expo-router';

export default function ProductsListScreen({ navigation }: any) {
  const router = useRouter();
  const dispatch = useDispatch();
  const products = useSelector((state: RootState) => state.products);
  const [loading, setLoading] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState(products.items);

  // Load products and categories
  const loadProducts = async () => {
    try {
      setLoading(true);
      const allProducts = await getAllProducts();
      const categories = await getCategories();
      dispatch(setProducts(allProducts));
      dispatch(setCategories(categories));
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Filter products based on search and category
  useEffect(() => {
    let filtered = products.items;

    if (products.selectedCategory) {
      filtered = filtered.filter(p => p.category === products.selectedCategory);
    }

    if (products.searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(products.searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products.items, products.selectedCategory, products.searchQuery]);

  const handleSearch = (text: string) => {
    dispatch(setSearchQuery(text));
  };

  const handleCategoryFilter = (category: string | null) => {
    dispatch(setSelectedCategory(category === products.selectedCategory ? null : category));
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${productName}"?`,
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteProduct(productId);
              await loadProducts();
              Alert.alert('Success', 'Product deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderProductCard = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => router.push(`./${item.id}`)}
      className="bg-surface rounded-lg p-4 mb-3 border border-border"
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground">{item.name}</Text>
          <Text className="text-xs text-muted mt-1">{item.category}</Text>
        </View>
        {item.stock_qty < item.min_stock_qty && (
          <View className="bg-error rounded-full px-2 py-1">
            <Text className="text-white text-xs font-bold">Low</Text>
          </View>
        )}
      </View>

      <View className="flex-row justify-between mb-3">
        <View>
          <Text className="text-xs text-muted">Sale Price</Text>
          <Text className="text-base font-bold text-primary mt-1">{formatCurrency(item.sale_price)}</Text>
        </View>
        <View>
          <Text className="text-xs text-muted">Stock</Text>
          <Text className="text-base font-bold text-foreground mt-1">{item.stock_qty}</Text>
        </View>
      </View>

      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={() => router.push(`./${item.id}`)}
          className="flex-1 bg-primary rounded p-2 items-center"
        >
          <Text className="text-white text-sm font-semibold">Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteProduct(item.id, item.name)}
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
        data={filteredProducts}
        renderItem={renderProductCard}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <View className="mb-4">
            {/* Search Bar */}
            <TextInput
              placeholder="Search products..."
              value={products.searchQuery}
              onChangeText={handleSearch}
              className="bg-surface border border-border rounded-lg p-3 text-foreground mb-4"
              placeholderTextColor="#687076"
            />

            {/* Category Filter */}
            {products.categories.length > 0 && (
              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">Categories</Text>
                <FlatList
                  data={products.categories}
                  renderItem={({ item: category }) => (
                    <TouchableOpacity
                      onPress={() => handleCategoryFilter(category)}
                      className={`rounded-full px-4 py-2 mr-2 ${
                        products.selectedCategory === category
                          ? 'bg-primary'
                          : 'bg-surface border border-border'
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          products.selectedCategory === category
                            ? 'text-white'
                            : 'text-foreground'
                        }`}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={item => item}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ marginBottom: 16 }}
                />
              </View>
            )}
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadProducts} />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-4xl mb-2">📦</Text>
            <Text className="text-base font-semibold text-foreground">No products</Text>
            <Text className="text-sm text-muted mt-2 text-center">Add your first product to get started</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}
