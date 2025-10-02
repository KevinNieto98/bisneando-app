import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

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

export const ProductSlideItem: React.FC<Props> = ({ product, onAddToCart }) => {
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
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.95 }]}
      onPress={() => router.push(`/product/${product.id}`)} // 👉 abre detalle
    >
      {/* Imagen */}
      <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />

      {/* Info producto */}
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

        {/* Botón agregar al carrito */}
        <Pressable
          style={({ pressed }) => [
            styles.cartButton,
            pressed && { opacity: 0.7 },
          ]}
          onPress={(e) => {
            e.stopPropagation(); // 👈 evita que dispare router.push
            onAddToCart?.(product);
          }}
        >
          <Ionicons name="cart-outline" size={18} color="white" />
          <Text style={styles.cartText}>Agregar</Text>
        </Pressable>

        {/* 👇 padding fijo para que todas tengan misma altura */}
        <View style={styles.bottomSpacer} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
    width: 170,
    height: 240,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: "100%",
    height: 120,
  },
  info: {
    flex: 1,
    justifyContent: "space-between",
    padding: 10,
  },
  textWrapper: {
    flexShrink: 1,
  },
  brand: {
    fontSize: 10,
    fontWeight: "700",
    color: "#71717a",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: "500",
    color: "#3f3f46",
    minHeight: 32,
    lineHeight: 17,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: "#18181b",
    marginBottom: 8,
  },
  cartButton: {
    marginTop: 6,
    backgroundColor: "#2563eb",
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  cartText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  bottomSpacer: {
    height: 1,
  },
});
