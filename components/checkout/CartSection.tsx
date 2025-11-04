import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import EditButton from "../ui/EditButton";

type CartLikeItem = {
  id?: number | string;
  title: string;
  price: number;         // ya puede venir con dbPrice aplicado
  image?: string;        // <- muchos flujos de checkout traen este
  images?: string[];     // <- otros traen array
  quantity?: number;     // preferido
  qty?: number;          // alternativo
  subtotal?: number;     // opcional
};

const toHNL = (n: number) =>
  new Intl.NumberFormat("es-HN", {
    style: "currency",
    currency: "HNL",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);

const PLACEHOLDER = "https://via.placeholder.com/150";

// Toma primero `image`, si no, el primer string válido de `images[]`.
const pickImageUri = (it: CartLikeItem): string => {
  const one = typeof it.image === "string" ? it.image.trim() : "";
  if (one) return one;

  if (Array.isArray(it.images)) {
    const firstValid = it.images.find(
      (u) => typeof u === "string" && u.trim().length > 0
    );
    if (firstValid) return firstValid;
  }
  return PLACEHOLDER;
};

export function CartSection({ items = [] as CartLikeItem[] }) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Verificar orden</Text>

      <View style={styles.header}>
        <Text style={styles.subtitle}>Tu carrito</Text>
        <EditButton />
      </View>

      {safeItems.length === 0 ? (
        <View style={{ paddingVertical: 12 }}>
          <Text style={{ color: "#6b7280" }}>Tu carrito está vacío.</Text>
        </View>
      ) : (
        safeItems.map((product, idx) => {
          const qty =
            typeof product.quantity === "number"
              ? product.quantity
              : typeof product.qty === "number"
              ? product.qty
              : 0;

          const unit = Number(product.price || 0);
          const lineSubtotal =
            typeof product.subtotal === "number"
              ? product.subtotal
              : unit * qty;

          const key = String(product.id ?? `line-${idx}`);
          const uri = pickImageUri(product); // 👈 soporta image y images[0]

          return (
            <View key={key} style={styles.item}>
              <Image source={{ uri }} style={styles.image} />

              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={2}>
                  {product.title}
                </Text>

                <Text style={styles.details}>
                  {toHNL(unit)} x {qty}
                </Text>

                <Text style={styles.subtotal}>
                  Subtotal: {toHNL(lineSubtotal)}
                </Text>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    marginHorizontal: 8,
    padding: 16,
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    alignItems: "center",
  },
  subtitle: { fontSize: 18, fontWeight: "600" },

  item: { flexDirection: "row", gap: 10, marginBottom: 12, alignItems: "center" },
  image: { width: 64, height: 64, borderRadius: 10, backgroundColor: "#f3f4f6" },

  name: { fontWeight: "600", color: "#111827" },
  details: { color: "gray", fontSize: 12, marginTop: 2 },
  subtotal: { marginTop: 4, fontWeight: "600" },
});
