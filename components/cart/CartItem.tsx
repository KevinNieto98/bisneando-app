import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import QuantityStepper from "../ui/QuantityStepper";

export type CartItemType = {
  id: number;
  title: string;
  price: number;
  images: string[];
  inStock?: number;
  quantity: number;
};

interface Props {
  item: CartItemType;
  onChangeQty: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
  /** Cuando está activo, marca el contorno en rojo */
  notAvailable?: boolean;
  /** Disponibilidad inmediata (p. ej. reservas, bloqueo, stock en bodega cercana) */
  qtyAvailable?: number;
}

const toHNL = (n: number) =>
  new Intl.NumberFormat("es-HN", {
    style: "currency",
    currency: "HNL",
    maximumFractionDigits: 2,
  }).format(n);

const CartItem: React.FC<Props> = ({
  item,
  onChangeQty,
  onRemove,
  notAvailable,
  qtyAvailable,
}) => {
  // Límites de stock
  const stockCap =
    typeof item.inStock === "number" ? Math.max(0, item.inStock) : undefined;
  const availabilityCap =
    typeof qtyAvailable === "number" ? Math.max(0, qtyAvailable) : undefined;

  // maxQty = el menor entre inStock y qtyAvailable (si ambos existen)
  const maxQty =
    typeof stockCap === "number" && typeof availabilityCap === "number"
      ? Math.min(stockCap, availabilityCap)
      : typeof stockCap === "number"
      ? stockCap
      : availabilityCap;

  const outOfStock = (maxQty ?? 1) <= 0;
  const overRequested =
    typeof availabilityCap === "number" && item.quantity > availabilityCap;

  const setQty = (next: number) => {
    const clamped =
      Math.max(1, typeof maxQty === "number" ? Math.min(maxQty, next) : next);
    onChangeQty(item.id, clamped);
  };

  const goToDetail = () => router.push(`/product/${item.id}`);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.item,
        pressed && { opacity: 0.9 },
        (notAvailable || overRequested || outOfStock) && styles.itemDanger, // borde rojo si hay problema
      ]}
      onPress={goToDetail}
      accessibilityRole="button"
      accessibilityLabel={`Ver detalle de ${item.title}`}
    >
      {/* Imagen */}
      <Image
        source={{ uri: item.images?.[0] || "https://via.placeholder.com/150" }}
        style={styles.image}
      />

      {/* Centro: título, stock, contador + eliminar */}
      <View style={styles.info}>
        <Text numberOfLines={2} style={styles.itemTitle}>
          {item.title}
        </Text>

        {/* Línea de estado */}
        <Text
          style={[
            styles.stock,
            (outOfStock || notAvailable || overRequested) && styles.stockDanger,
          ]}
        >
          {/* {
  typeof qtyAvailable === "number"
    ? (typeof item.inStock === "number"
        ? `En stock: ${item.inStock} · Disponibles ahora: ${qtyAvailable}`
        : `Disponibles ahora: ${qtyAvailable}`)
    : notAvailable
      ? "No disponible"
      : typeof item.inStock === "number"
        ? (item.inStock > 0 ? `En stock: ${item.inStock}` : "Sin stock")
        : "Stock no especificado"
} */}
        {/* Mensaje de sobre-solicitud */}
        {overRequested && (
          <Text style={[styles.stock, styles.stockDanger]}>
            Tienes {item.quantity} en el carrito, pero solo hay {qtyAvailable} disponibles.
            Ajusta la cantidad.
          </Text>
        )}
        </Text>


        <View style={styles.controls}>
          <QuantityStepper
            value={item.quantity}
            onChange={setQty}
            min={1}
            max={maxQty}
            size="md"
            disabled={outOfStock || notAvailable}
            stopPropagation
          />

          <Pressable
            style={styles.removeBtn}
            onPress={(e) => {
              e.stopPropagation();
              onRemove(item.id);
            }}
            android_ripple={{ color: "rgba(0,0,0,0.06)" }}
            accessibilityRole="button"
            accessibilityLabel="Quitar del carrito"
          >
            <Ionicons name="trash-outline" size={18} color="#dc2626" />
          </Pressable>
        </View>
      </View>

      {/* Derecha: precio (unidad) y subtotal */}
      <View style={styles.priceWrap}>
        <Text style={styles.priceUnit}>{toHNL(item.price)}</Text>
        <Text style={styles.priceSubtotal}>
          {toHNL(item.price * item.quantity)}
        </Text>
      </View>
    </Pressable>
  );
};

export default CartItem;

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12, // <-- mantuve tu padding extra
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  itemDanger: {
    borderColor: "#dc2626",
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  info: { flex: 1, minHeight: 70, justifyContent: "space-between" },
  itemTitle: { fontSize: 14, fontWeight: "600", color: "#111827" },
  stock: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  stockDanger: { color: "#dc2626" },

  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  removeBtn: {
    marginLeft: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 999,
    padding: 6,
    backgroundColor: "#fff",
  },

  priceWrap: {
    alignItems: "flex-end",
    minWidth: 94,
  },
  priceUnit: {
    fontWeight: "700",
    color: "#111827",
  },
  priceSubtotal: {
    marginTop: 2,
    fontSize: 12,
    color: "#6b7280",
  },
});
