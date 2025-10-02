import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export interface Product {
  id: number;
  slug: string;
  title: string;
  price: number;
  images: string[];
  brand?: string;
}

interface Props {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

const { width } = Dimensions.get("window");
const CARD_MARGIN = 8;
const CARD_WIDTH = (width - CARD_MARGIN * 2 * 3 - 32) / 3;

export const ProductGridItem: React.FC<Props> = ({ product, onAddToCart }) => {
  const imageUri =
    product.images?.[0] ||
    "https://via.placeholder.com/300x200.png?text=Sin+Imagen";

  const priceFormatted = useMemo(
    () =>
      new Intl.NumberFormat("es-HN", {
        style: "currency",
        currency: "HNL",
        maximumFractionDigits: 2,
      }).format(product.price),
    [product.price]
  
  );

  

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.9 }, // feedback al presionar
      ]}
        onPress={() => router.push(`../product/${product.id}`)} // 
    >
      <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
      <View style={styles.info}>
        <View style={styles.textWrapper}>
          {product.brand && (
            <Text style={styles.brand} numberOfLines={1}>
              {product.brand}
            </Text>
          )}
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
            {product.title}
          </Text>
          <Text style={styles.price}>{priceFormatted}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.cartButton,
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => onAddToCart?.(product)}
        >
          <Ionicons name="cart-outline" size={12} color="white" />
          <Text style={styles.cartText}>+</Text>
        </Pressable>
        <View style={styles.bottomSpacer} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
    width: CARD_WIDTH,
    height: 180,
    margin: CARD_MARGIN,
  },
  image: {
    width: "100%",
    height: 80,
  },
  info: {
    flex: 1,
    justifyContent: "space-between",
    padding: 6,
  },
  textWrapper: {
    flexShrink: 1,
  },
  brand: {
    fontSize: 8,
    fontWeight: "600",
    color: "#71717a",
    textTransform: "uppercase",
    marginBottom: 1,
  },
  title: {
    fontSize: 10,
    fontWeight: "500",
    color: "#3f3f46",
    minHeight: 24,
    lineHeight: 12,
    marginBottom: 2,
  },
  price: {
    fontSize: 11,
    fontWeight: "700",
    color: "#18181b",
    marginBottom: 4,
  },
  cartButton: {
    marginTop: 4,
    backgroundColor: "#2563eb",
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  cartText: {
    color: "white",
    fontSize: 9,
    fontWeight: "600",
  },
  bottomSpacer: {
    height: 1,
  },
});
