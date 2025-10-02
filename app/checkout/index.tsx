import { ProductHeader } from "@/components/product/ProductHeader";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
    Alert,
    Image,
    Pressable,

    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- Mock productos ---
const productsInCart = [
  {
    slug: "p1",
    title: "Zapatos Nike Air",
    price: 1800,
    images: ["https://via.placeholder.com/100"],
  },
  {
    slug: "p2",
    title: "Camisa Adidas",
    price: 1200,
    images: ["https://via.placeholder.com/100"],
  },
  {
    slug: "p3",
    title: "Pantalón Levi's",
    price: 2200,
    images: ["https://via.placeholder.com/100"],
  },
];
const DEFAULT_QTY = 2;

// --- Mock direcciones ---
const addresses = [
  {
    id: "addr_1",
    label: "Casa - Juan Pérez",
    line1: "Av. Siempre Viva 123",
    city: "Tegucigalpa",
    state: "FM",
    zip: "11101",
    phone: "9876-5432",
    isDefault: true,
  },
  {
    id: "addr_2",
    label: "Oficina",
    line1: "Boulevard Morazán",
    city: "Tegucigalpa",
    state: "FM",
    zip: "11011",
    phone: "9988-1122",
    isDefault: false,
  },
];

export default function CheckoutScreen() {
  const [selectedAddressId, setSelectedAddressId] = useState(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0].id
  );
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "tarjeta" | "">("");
  const [cardForm, setCardForm] = useState({
    holder: "",
    number: "",
    expiry: "",
    cvv: "",
  });

  // --- Items en carrito ---
  const items = useMemo(
    () =>
      productsInCart.map((p) => ({
        ...p,
        qty: DEFAULT_QTY,
        subtotal: p.price * DEFAULT_QTY,
      })),
    []
  );

  // --- Resumen ---
  const summary = useMemo(() => {
    const itemsCount = items.reduce((acc, it) => acc + it.qty, 0);
    const subtotal = items.reduce((acc, it) => acc + it.subtotal, 0);
    const taxes = Math.round(subtotal * 0.15 * 100) / 100;
    const total = Math.round((subtotal + taxes) * 100) / 100;
    return { itemsCount, subtotal, taxes, total };
  }, [items]);

  // --- Validaciones ---
  const isCardValid =
    paymentMethod !== "tarjeta" ||
    (cardForm.holder.trim().length > 3 &&
      cardForm.number.replace(/\s/g, "").length >= 15 &&
      /\d{2}\/\d{2}/.test(cardForm.expiry) &&
      cardForm.cvv.length >= 3);

  const canPlaceOrder = selectedAddressId && paymentMethod && isCardValid;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}> 
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />
      <ScrollView style={styles.container} >
       < ProductHeader />

      {/* Carrito */}
      <View style={styles.section}>
      <Text style={styles.title}>Verificar orden</Text>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tu carrito</Text>
          <Pressable>
            <Text style={styles.linkText}>Editar carrito</Text>
          </Pressable>
        </View>

        {items.map((product) => (
            <View key={product.slug} style={styles.cartItem}>
            <Image source={{ uri: product.images[0] }} style={styles.cartImage} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cartTitle}>{product.title}</Text>
              <Text style={styles.cartSubText}>
                L {product.price} x {product.qty}
              </Text>
              <Text style={styles.cartSubtotal}>Subtotal: L {product.subtotal}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Direcciones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dirección de entrega</Text>
        {addresses.map((addr) => (
            <Pressable
            key={addr.id}
            onPress={() => setSelectedAddressId(addr.id)}
            style={[
                styles.addressCard,
                selectedAddressId === addr.id && styles.addressCardSelected,
            ]}
            >
            <Text style={styles.addressLabel}>{addr.label}</Text>
            <Text style={styles.addressText}>{addr.line1}</Text>
            <Text style={styles.addressText}>
              {addr.city}, {addr.state} {addr.zip}
            </Text>
            <Text style={styles.addressText}>{addr.phone}</Text>
          </Pressable>
        ))}
      </View>

      {/* Método de pago */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Método de pago</Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Pressable
            onPress={() => setPaymentMethod("efectivo")}
            style={[
                styles.paymentCard,
                paymentMethod === "efectivo" && styles.paymentCardSelected,
            ]}
          >
            <Ionicons name="wallet-outline" size={20} color="black" />
            <Text style={styles.paymentText}>Efectivo</Text>
          </Pressable>
          <Pressable
            onPress={() => setPaymentMethod("tarjeta")}
            style={[
                styles.paymentCard,
                paymentMethod === "tarjeta" && styles.paymentCardSelected,
            ]}
          >
            <Ionicons name="card-outline" size={20} color="black" />
            <Text style={styles.paymentText}>Tarjeta</Text>
          </Pressable>
        </View>

        {/* Formulario tarjeta */}
        {paymentMethod === "tarjeta" && (
            <View style={{ marginTop: 16 }}>
            <TextInput
              style={styles.input}
              placeholder="Titular de la tarjeta"
              value={cardForm.holder}
              onChangeText={(t) => setCardForm((f) => ({ ...f, holder: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Número de tarjeta"
              keyboardType="numeric"
              value={cardForm.number}
              onChangeText={(t) => setCardForm((f) => ({ ...f, number: t }))}
            />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="MM/AA"
                keyboardType="numeric"
                value={cardForm.expiry}
                onChangeText={(t) => setCardForm((f) => ({ ...f, expiry: t }))}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="CVV"
                keyboardType="numeric"
                value={cardForm.cvv}
                onChangeText={(t) => setCardForm((f) => ({ ...f, cvv: t }))}
              />
            </View>
          </View>
        )}
      </View>

      {/* Resumen */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumen de orden</Text>
        <View style={styles.summaryRow}>
          <Text>No. Productos</Text>
          <Text>{summary.itemsCount}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Subtotal</Text>
          <Text>L {summary.subtotal}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Impuestos (15%)</Text>
          <Text>L {summary.taxes}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={{ fontWeight: "700" }}>Total</Text>
          <Text style={{ fontWeight: "700" }}>L {summary.total}</Text>
        </View>
      </View>

      {/* Botón */}
      <TouchableOpacity
        style={[styles.orderButton, !canPlaceOrder && { opacity: 0.5 }]}
        disabled={!canPlaceOrder}
        onPress={() => Alert.alert("Orden realizada", "Tu pedido fue procesado ✅")}
      >
        <Text style={styles.orderButtonText}>Colocar orden</Text>
      </TouchableOpacity>
    </ScrollView>
</SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1,     backgroundColor: "#FFD600", },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  linkText: { color: "#2563eb", fontSize: 14 },
  cartItem: { flexDirection: "row", gap: 10, marginBottom: 12 },
  cartImage: { width: 64, height: 64, borderRadius: 10 },
  cartTitle: { fontWeight: "600", fontSize: 14 },
  cartSubText: { fontSize: 12, color: "gray" },
  cartSubtotal: { marginTop: 4, fontWeight: "600" },
  addressCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  addressCardSelected: {
    borderColor: "black",
    backgroundColor: "#f3f4f6",
  },
  addressLabel: { fontWeight: "600", marginBottom: 4 },
  addressText: { fontSize: 12, color: "gray" },
  paymentCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  paymentCardSelected: { borderColor: "black", backgroundColor: "#f3f4f6" },
  paymentText: { fontWeight: "500" },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 14,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  orderButton: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 30,
  },
  orderButtonText: { color: "white", fontWeight: "700", fontSize: 16 },
});
