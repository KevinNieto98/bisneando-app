import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type CartItemType = {
  id: number;
  slug: string;
  title: string;
  price: number;
  images: string[];
  inStock?: number;
  quantity: number;
};

interface Props {
  item: CartItemType;
  onChangeQty: (slug: string, qty: number) => void;
  onRemove: (slug: string) => void;
}

const toHNL = (n: number) =>
  new Intl.NumberFormat("es-HN", {
    style: "currency",
    currency: "HNL",
    maximumFractionDigits: 2,
  }).format(n);

export const CartItem: React.FC<Props> = ({ item, onChangeQty, onRemove }) => {
  return (
    <Pressable
      style={({ pressed }) => [styles.item, pressed && { opacity: 0.8 }]}
      onPress={() => router.push(`/product/${item.id}`)} // 👉 lleva al detalle
    >
      {/* Imagen */}
      <Image
        source={{
          uri: item.images?.[0] || "https://via.placeholder.com/150",
        }}
        style={styles.image}
      />

      {/* Info */}
      <View style={styles.info}>
        <Text numberOfLines={2} style={styles.itemTitle}>
          {item.title}
        </Text>
        <Text style={styles.stock}>
          {item.inStock && item.inStock > 0
            ? `En stock: ${item.inStock}`
            : "Sin stock"}
        </Text>

        {/* Controles */}
        <View style={styles.controls}>
          <Pressable
            style={styles.qtyBtn}
            onPress={(e) => {
              e.stopPropagation(); // 👈 evita que dispare la navegación
              onChangeQty(item.slug, Math.max(1, item.quantity - 1));
            }}
          >
            <Text>-</Text>
          </Pressable>

          <Text>{item.quantity}</Text>

          <Pressable
            style={styles.qtyBtn}
            onPress={(e) => {
              e.stopPropagation();
              onChangeQty(item.slug, item.quantity + 1);
            }}
          >
            <Text>+</Text>
          </Pressable>

          <Pressable
            style={styles.removeBtn}
            onPress={(e) => {
              e.stopPropagation();
              onRemove(item.slug);
            }}
          >
            <Ionicons name="trash-outline" size={18} color="red" />
          </Pressable>
        </View>
      </View>

      {/* Precio */}
      <Text style={styles.price}>{toHNL(item.price)}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  image: { width: 70, height: 70, borderRadius: 8 },
  info: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  stock: { fontSize: 12, color: "gray" },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  qtyBtn: {
    borderWidth: 1,
    borderColor: "#d4d4d8",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  removeBtn: {
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 20,
    padding: 4,
  },
  price: { fontWeight: "600", minWidth: 60, textAlign: "right" },
});
