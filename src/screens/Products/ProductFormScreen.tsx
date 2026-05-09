/**
 * Product Form Screen
 * Add or edit a product with all details
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { addProduct, updateProduct, getProductById } from '@/src/database/products';
import { generateProductId } from '@/src/utils/id';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ProductFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const isEditing = params.id;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: '',
    purchase_price: '',
    sale_price: '',
    stock_qty: '',
    min_stock_qty: '5',
  });

  // Load product if editing
  useEffect(() => {
    if (isEditing) {
      loadProduct();
    }
  }, [isEditing]);

  const loadProduct = async () => {
    try {
      const product = await getProductById(params.id!);
      if (product) {
        setForm({
          name: product.name,
          category: product.category,
          purchase_price: product.purchase_price.toString(),
          sale_price: product.sale_price.toString(),
          stock_qty: product.stock_qty.toString(),
          min_stock_qty: product.min_stock_qty.toString(),
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load product');
    }
  };

  const handleSave = async () => {
    // Validation
    if (!form.name.trim()) {
      Alert.alert('Required', 'Please enter product name');
      return;
    }
    if (!form.category.trim()) {
      Alert.alert('Required', 'Please enter category');
      return;
    }
    if (!form.purchase_price || isNaN(parseFloat(form.purchase_price))) {
      Alert.alert('Invalid', 'Please enter valid purchase price');
      return;
    }
    if (!form.sale_price || isNaN(parseFloat(form.sale_price))) {
      Alert.alert('Invalid', 'Please enter valid sale price');
      return;
    }
    if (!form.stock_qty || isNaN(parseInt(form.stock_qty))) {
      Alert.alert('Invalid', 'Please enter valid stock quantity');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await updateProduct(params.id!, {
          name: form.name,
          category: form.category,
          purchase_price: parseFloat(form.purchase_price),
          sale_price: parseFloat(form.sale_price),
          stock_qty: parseInt(form.stock_qty),
          min_stock_qty: parseInt(form.min_stock_qty),
        });
        Alert.alert('Success', 'Product updated');
      } else {
        await addProduct({
          id: generateProductId(),
          name: form.name,
          category: form.category,
          purchase_price: parseFloat(form.purchase_price),
          sale_price: parseFloat(form.sale_price),
          stock_qty: parseInt(form.stock_qty),
          min_stock_qty: parseInt(form.min_stock_qty),
        });
        Alert.alert('Success', 'Product added');
      }
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-foreground mb-6">
          {isEditing ? 'Edit Product' : 'Add Product'}
        </Text>

        {/* Product Name */}
        <View className="mb-4">
          <Text className="text-base font-semibold text-foreground mb-2">Product Name *</Text>
          <TextInput
            placeholder="e.g., Rice 5kg"
            value={form.name}
            onChangeText={text => setForm({ ...form, name: text })}
            className="bg-surface border border-border rounded-lg p-4 text-foreground"
            placeholderTextColor="#687076"
            editable={!loading}
          />
        </View>

        {/* Category */}
        <View className="mb-4">
          <Text className="text-base font-semibold text-foreground mb-2">Category *</Text>
          <TextInput
            placeholder="e.g., Groceries"
            value={form.category}
            onChangeText={text => setForm({ ...form, category: text })}
            className="bg-surface border border-border rounded-lg p-4 text-foreground"
            placeholderTextColor="#687076"
            editable={!loading}
          />
        </View>

        {/* Purchase Price */}
        <View className="mb-4">
          <Text className="text-base font-semibold text-foreground mb-2">Purchase Price (Rs.) *</Text>
          <TextInput
            placeholder="0.00"
            value={form.purchase_price}
            onChangeText={text => setForm({ ...form, purchase_price: text })}
            keyboardType="decimal-pad"
            className="bg-surface border border-border rounded-lg p-4 text-foreground"
            placeholderTextColor="#687076"
            editable={!loading}
          />
        </View>

        {/* Sale Price */}
        <View className="mb-4">
          <Text className="text-base font-semibold text-foreground mb-2">Sale Price (Rs.) *</Text>
          <TextInput
            placeholder="0.00"
            value={form.sale_price}
            onChangeText={text => setForm({ ...form, sale_price: text })}
            keyboardType="decimal-pad"
            className="bg-surface border border-border rounded-lg p-4 text-foreground"
            placeholderTextColor="#687076"
            editable={!loading}
          />
        </View>

        {/* Stock Quantity */}
        <View className="mb-4">
          <Text className="text-base font-semibold text-foreground mb-2">Stock Quantity *</Text>
          <TextInput
            placeholder="0"
            value={form.stock_qty}
            onChangeText={text => setForm({ ...form, stock_qty: text })}
            keyboardType="number-pad"
            className="bg-surface border border-border rounded-lg p-4 text-foreground"
            placeholderTextColor="#687076"
            editable={!loading}
          />
        </View>

        {/* Minimum Stock Alert */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-foreground mb-2">Minimum Stock Alert</Text>
          <TextInput
            placeholder="5"
            value={form.min_stock_qty}
            onChangeText={text => setForm({ ...form, min_stock_qty: text })}
            keyboardType="number-pad"
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
            {loading ? 'Saving...' : 'Save Product'}
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
