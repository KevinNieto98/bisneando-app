import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { useAppStore } from "@/store/useAppStore";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type CartItemType = {
 id: number;  
  slug: string;
  title: string;
  price: number;
  images: string[];
  brand?: string;
  inStock?: number;
  quantity: number;
};

const toHNL = (n: number) =>
  new Intl.NumberFormat("es-HN", {
    style: "currency",
    currency: "HNL",
    maximumFractionDigits: 2,
  }).format(n);

export default function CartScreen() {
  const navigation = useNavigation();
  const { products, loadProducts } = useAppStore();

  const [items, setItems] = useState<CartItemType[]>([]);

  // 🔄 Cargar productos
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (products.length > 0) {
      const withQty = products.map((p) => ({
        ...p,
        quantity: 1,
        inStock: Math.floor(Math.random() * 10) + 1,
      }));
      setItems(withQty);
    }
  }, [products]);

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.quantity, 0),
    [items]
  );
  const shipping = 0;
  const taxes = 0;
  const total = subtotal + shipping + taxes;

  const handleRemove = (slug: string) =>
    setItems((prev) => prev.filter((it) => it.slug !== slug));

  const handleChangeQty = (slug: string, nextQty: number) =>
    setItems((prev) =>
      prev.map((it) =>
        it.slug === slug ? { ...it, quantity: Math.max(1, nextQty) } : it
      )
    );

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
        {/* Lista scrollable */}
        <View style={styles.listContainer}>
          {items.length === 0 ? (
            <Text style={styles.empty}>Tu carrito está vacío.</Text>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => item.slug}
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

        {/* Resumen fijo abajo */}
        <View style={styles.summaryContainer}>
          <CartSummary
            subtotal={subtotal}
            shipping={shipping}
            taxes={taxes}
            total={total}
            toHNL={toHNL}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFD600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD600",
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  backButton: {
    marginRight: 8,
    padding: 6,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  content: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  listContainer: {
    flex: 1, // ocupa todo el espacio disponible
  },
  summaryContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "white",
  },
  empty: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 14,
    paddingVertical: 20,
  },
});
