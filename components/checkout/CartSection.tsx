import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import EditButton from "../ui/EditButton";

export function CartSection({ items }: { items: any[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Verificar orden</Text>
      <View style={styles.header}>
        <Text style={styles.subtitle}>Tu carrito</Text>
        <EditButton/>
      </View>

      {items.map((product) => (
        <View key={product.slug} style={styles.item}>
          <Image source={{ uri: product.images[0] }} style={styles.image} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{product.title}</Text>
            <Text style={styles.details}>
              L {product.price} x {product.qty}
            </Text>
            <Text style={styles.subtotal}>Subtotal: L {product.subtotal}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { backgroundColor: "white", borderRadius: 12,
        marginHorizontal: 8,
    padding: 16, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  subtitle: { fontSize: 18, fontWeight: "600" },
  link: { color: "#2563eb" },
  item: { flexDirection: "row", gap: 10, marginBottom: 12 },
  image: { width: 64, height: 64, borderRadius: 10 },
  name: { fontWeight: "600" },
  details: { color: "gray", fontSize: 12 },
  subtotal: { marginTop: 4, fontWeight: "600" },
});
