import React, { useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export interface Product {
  slug: string;
  title: string;
  price: number;
  images: string[];
  brand?: string;
}

interface Props {
  product: Product;
}

export const ProductGridItem: React.FC<Props> = ({ product }) => {
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
    <View style={styles.card}>
      {/* Imagen */}
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Info producto */}
      <View style={styles.info}>
        {product.brand && (
          <Text style={styles.brand} numberOfLines={1}>
            {product.brand}
          </Text>
        )}
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        <Text style={styles.price}>{priceFormatted}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,

    borderColor: "#e5e7eb",
    overflow: "hidden",
    width: 200,
    height: 260,       // ✅ altura fija para que todas sean iguales
    marginHorizontal: 40,         // ✅ separación entre cards
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: "100%",
    height: 140,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  info: {
    flex: 1, // ✅ ocupa el espacio restante para alinear contenido
    justifyContent: "space-between",
    padding: 10,
  },
  brand: {
    fontSize: 10,
    fontWeight: "700",
    color: "#71717a",
    textTransform: "uppercase",

  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3f3f46",
    marginBottom: 1,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: "#18181b",
  },
});
