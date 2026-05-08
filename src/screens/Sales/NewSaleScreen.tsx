/**
 * New Sale Screen
 * Product selection and quantity entry for creating a sale
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, RefreshControl } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/src/store';
import { addSaleItem, removeSaleItem, updateSaleItemQuantity } from '@/src/store/slices/salesSlice';
import { getAllProducts } from '@/src/database/products';
import { formatCurrency } from '@/src/utils/currency';
import { generateSaleItemId } from '@/src/utils/id';
import { useRouter } from 'expo-router';

export default function NewSaleScreen({ navigation }: any) {
  const router = useRouter();
  const dispatch = useDispatch();
  const sales = useSelector((state: RootState) => state.sales);
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

  // Load products
  const loadProducts = async () => {
    try {
      setLoading(true);
      const allProducts = await getAllProducts();
      setProducts(allProducts);
      setFilteredProducts(allProducts);
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

  // Filter products based on search
  useEffect(() => {
    if (searchQuery) {
      setFilteredProducts(
        products.filter(p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  const handleAddProduct = (product: any) => {
    const itemId = generateSaleItemId();
    dispatch(addSaleItem({
      id: itemId,
      sale_id: '',
      product_id: product.id,
      product_name: product.name,
      quantity: 1,
      unit_price: product.sale_price,
      subtotal: product.sale_price,
    }));
  };

  const handleRemoveItem = (itemId: string) => {
    dispatch(removeSaleItem(itemId));
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    const item = sales.currentSale.items.find(i => i.id === itemId);
    if (item && quantity > 0) {
      dispatch(updateSaleItemQuantity({
        itemId,
        quantity,
        subtotal: item.unit_price * quantity,
      }));
    }
  };

  const handleProceedToCheckout = () => {
    if (sales.currentSale.items.length === 0) {
      Alert.alert('Error', 'Please select at least one product');
      return;
    }
    router.push('./summary');
  };

  const renderProductCard = ({ item }: any) => {
    const isSelected = sales.currentSale.items.some(i => i.product_id === item.id);
    const selectedItem = sales.currentSale.items.find(i => i.product_id === item.id);

    return (
      <View className="bg-surface rounded-lg p-4 mb-3 border border-border">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">{item.name}</Text>
            <Text className="text-xs text-muted mt-1">Stock: {item.stock_qty}</Text>
          </View>
          <Text className="text-base font-bold text-primary">{formatCurrency(item.sale_price)}</Text>
        </View>

        {isSelected && selectedItem ? (
          <View className="flex-row items-center gap-2 mt-3">
            <TouchableOpacity
              onPress={() => handleQuantityChange(selectedItem.id, selectedItem.quantity - 1)}
              className="bg-error rounded px-3 py-2"
            >
              <Text className="text-white font-bold">−</Text>
            </TouchableOpacity>
            <TextInput
              value={selectedItem.quantity.toString()}
              onChangeText={text => {
                const qty = parseInt(text) || 0;
                handleQuantityChange(selectedItem.id, qty);
              }}
              keyboardType="number-pad"
              className="flex-1 bg-background border border-border rounded px-3 py-2 text-center text-foreground"
            />
            <TouchableOpacity
              onPress={() => handleQuantityChange(selectedItem.id, selectedItem.quantity + 1)}
              className="bg-success rounded px-3 py-2"
            >
              <Text className="text-white font-bold">+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleRemoveItem(selectedItem.id)}
              className="bg-error rounded px-3 py-2"
            >
              <Text className="text-white font-bold">✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => handleAddProduct(item)}
            className="bg-primary rounded p-2 items-center mt-3"
          >
            <Text className="text-white font-semibold">Add to Sale</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <ScreenContainer className="p-4">
      <FlatList
        data={filteredProducts}
        renderItem={renderProductCard}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <View className="mb-4">
            <Text className="text-2xl font-bold text-foreground mb-4">New Sale</Text>
            <TextInput
              placeholder="Search products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="bg-surface border border-border rounded-lg p-3 text-foreground mb-4"
              placeholderTextColor="#687076"
            />
          </View>
        }
        ListFooterComponent={
          sales.currentSale.items.length > 0 ? (
            <View className="mt-6 mb-4">
              <View className="bg-surface rounded-lg p-4 mb-4 border border-border">
                <Text className="text-sm text-muted mb-2">Items: {sales.currentSale.items.length}</Text>
                <Text className="text-2xl font-bold text-primary">
                  Total: {formatCurrency(sales.currentSale.totalAmount)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleProceedToCheckout}
                className="bg-primary rounded-lg p-4 items-center"
              >
                <Text className="text-white font-semibold text-lg">Proceed to Checkout</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadProducts} />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-4xl mb-2">📦</Text>
            <Text className="text-base font-semibold text-foreground">No products</Text>
            <Text className="text-sm text-muted mt-2 text-center">Add products to your inventory first</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}
