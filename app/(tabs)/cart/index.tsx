import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type CartItem = {
  slug: string;
  title: string;
  price: number;
  images: string[];
  inStock?: number;
  quantity: number;
};

const initialItems: CartItem[] = [
  {
    slug: "producto-1",
    title: "Amazon Echo Pop",
    price: 1456,
    images: ["https://via.placeholder.com/150"],
    inStock: 5,
    quantity: 1,
  },
  {
    slug: "producto-2",
    title: "Linkind Smart Bulbs",
    price: 350,
    images: ["https://via.placeholder.com/150"],
    inStock: 8,
    quantity: 1,
  },
];

const toHNL = (n: number) =>
  new Intl.NumberFormat("es-HN", {
    style: "currency",
    currency: "HNL",
    maximumFractionDigits: 2,
  }).format(n);

export default function CartScreen() {
  const navigation = useNavigation();
  const [items, setItems] = useState<CartItem[]>(initialItems);

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
      {/* 🔝 StatusBar amarillo */}
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />

      {/* Header amarillo con back y título */}
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

      {/* Contenido con fondo blanco redondeado */}
      <View
        style={[
          styles.content,
          Platform.OS === "android" && { marginTop: StatusBar.currentHeight },
        ]}
      >
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* Lista de items */}
          <View style={styles.itemsBox}>
            {items.length === 0 ? (
              <Text style={styles.empty}>Tu carrito está vacío.</Text>
            ) : (
              <FlatList
                data={items}
                keyExtractor={(item) => item.slug}
                renderItem={({ item }) => (
                  <View style={styles.item}>
                    {/* Imagen */}
                    <Image source={{ uri: item.images[0] }} style={styles.image} />

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
                          onPress={() =>
                            handleChangeQty(item.slug, item.quantity - 1)
                          }
                        >
                          <Text>-</Text>
                        </Pressable>
                        <Text>{item.quantity}</Text>
                        <Pressable
                          style={styles.qtyBtn}
                          onPress={() =>
                            handleChangeQty(item.slug, item.quantity + 1)
                          }
                        >
                          <Text>+</Text>
                        </Pressable>

                        <Pressable
                          style={styles.removeBtn}
                          onPress={() => handleRemove(item.slug)}
                        >
                          <Ionicons name="trash-outline" size={18} color="red" />
                        </Pressable>
                      </View>
                    </View>

                    {/* Precio */}
                    <Text style={styles.price}>{toHNL(item.price)}</Text>
                  </View>
                )}
              />
            )}
          </View>

          {/* Resumen */}
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Resumen del pedido</Text>

            <View style={styles.row}>
              <Text>Subtotal</Text>
              <Text>{toHNL(subtotal)}</Text>
            </View>
            <View style={styles.row}>
              <Text>Envío</Text>
              <Text>{shipping === 0 ? "Gratis" : toHNL(shipping)}</Text>
            </View>
            <View style={styles.row}>
              <Text>Impuestos</Text>
              <Text>{taxes === 0 ? "-" : toHNL(taxes)}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.row}>
              <Text style={{ fontWeight: "700" }}>Total</Text>
              <Text style={{ fontWeight: "700" }}>{toHNL(total)}</Text>
            </View>

            {/* Botones */}
            <Pressable
              style={styles.checkoutBtn}
              onPress={() => navigation.navigate("Checkout" as never)}
            >
              <Ionicons name="card-outline" size={18} color="white" />
              <Text style={styles.checkoutText}>Ir a pagar</Text>
            </Pressable>

            <Pressable
              style={styles.keepBtn}
              onPress={() => navigation.navigate("Products" as never)}
            >
              <Ionicons name="arrow-forward-outline" size={18} color="#2563eb" />
              <Text style={styles.keepText}>Seguir comprando</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFD600", // ✅ Amarillo para notch
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
  itemsBox: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 8,
    marginBottom: 20,
  },
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
  controls: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
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
  summary: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  separator: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 8 },
  checkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    borderRadius: 30,
    paddingVertical: 12,
    gap: 6,
    marginTop: 12,
  },
  checkoutText: { color: "white", fontWeight: "600" },
  keepBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#d4d4d8",
    paddingVertical: 12,
    gap: 6,
    marginTop: 8,
  },
  keepText: { color: "#2563eb", fontWeight: "600" },
  empty: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 14,
    paddingVertical: 20,
  },
});
