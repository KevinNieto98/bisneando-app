import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { ProductGridItem } from "./ProductGridItem";
import { Product } from "./ProductSlideItem";

interface Props {
  products: Product[];
}

export const ProductGrid: React.FC<Props> = ({ products }) => {
  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.slug}
      numColumns={3}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <View style={styles.itemWrapper}>
          <ProductGridItem product={item} />
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {// ✅ margen lateral fijo
    paddingBottom: 20,
  },
  itemWrapper: {
    // ❌ ya no se necesita margin aquí porque lo maneja ProductGridItem
  },
});
