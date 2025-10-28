import CartItem from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import EmptyCart from "@/components/cart/EmptyCart"; // 👈 nuevo
import { useAppStore } from "@/store/useAppStore";
import { useCartStore, type CartItem as CartItemType } from "@/store/useCartStore";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router"; // 👈 para navegar desde EmptyCart
import React, { useMemo } from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const toHNL = (n: number) =>
  new Intl.NumberFormat("es-HN", {
    style: "currency",
    currency: "HNL",
    maximumFractionDigits: 2,
  }).format(n);

// URL de respaldo por si no encontramos imagen
const PLACEHOLDER =
  "https://via.placeholder.com/300x300.png?text=Sin+imagen";

// 🔧 Limpia y valida un array de imágenes (debe devolver string[])
const ensureUrls = (arr: unknown): string[] => {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((u) => (typeof u === "string" ? u.trim() : ""))
    .filter((u) => u.length > 0);
};

export default function CartScreen() {
  const navigation = useNavigation();

  // 🛒 Carrito
  const itemsRecord = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const totalItems = useCartStore((s) => s.totalItems());

  // 🗂️ Productos (con imágenes normalizadas desde useAppStore)
  const products = useAppStore((s) => s.products);

  // Record -> array
  const itemsRaw: CartItemType[] = useMemo(
    () => Object.values(itemsRecord),
    [itemsRecord]
  );

  // ✅ Asegura que cada item tenga al menos 1 imagen válida:
  //    1) usa las imágenes que ya están en el item (limpiadas),
  //    2) si no hay, intenta tomarlas del catálogo por id,
  //    3) si tampoco hay, usa placeholder.
  const items: CartItemType[] = useMemo(() => {
    const byId = new Map(products?.map((p) => [p.id, p]) ?? []);

    return itemsRaw.map((it) => {
      const cartImgs = ensureUrls(it.images);
      if (cartImgs.length > 0) return { ...it, images: cartImgs };

      const prod = byId.get(it.id);
      const prodImgs = ensureUrls(prod?.images);
      return {
        ...it,
        images: prodImgs.length > 0 ? prodImgs : [PLACEHOLDER],
      };
    });
  }, [itemsRaw, products]);

  const isEmpty = items.length === 0;

  const subtotal = totalPrice;
  const shipping = 0;
  const taxes = 0;
  const total = subtotal + shipping + taxes;

  const handleRemove = (id: number) => remove(id);
  const handleChangeQty = (id: number, nextQty: number) =>
    setQty(id, Math.max(1, nextQty));

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Carrito</Text>
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        <View style={styles.listContainer}>
          {isEmpty ? (
            <EmptyCart
              onPrimaryPress={() => router.push("/")}           // ajusta la ruta
              onSecondaryPress={() => router.push("/explore")} // ajusta la ruta
            />
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <CartItem
                  item={item}
                  onChangeQty={handleChangeQty}
                  onRemove={handleRemove}
                />
              )}
              contentContainerStyle={{ padding: 16 }}
            />
          )}
        </View>

        {/* Resumen fijo abajo (se oculta si está vacío) */}
        {!isEmpty && (
          <View style={styles.summaryContainer}>
            <CartSummary
              subtotal={subtotal}
              shipping={shipping}
              taxes={taxes}
              total={total}
              toHNL={toHNL}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFD600" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD600",
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  backButton: { marginRight: 8, padding: 6, borderRadius: 20 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#000" },
  content: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  listContainer: { flex: 1 },
  summaryContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "white",
  },
});
