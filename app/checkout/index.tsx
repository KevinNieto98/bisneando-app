import { AddressSelector } from "@/components/checkout/AddressSelector";
import { CartSection } from "@/components/checkout/CartSection";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { PaymentMethodSelector } from "@/components/checkout/PaymentMethodSelector";
import { PlaceOrderButton } from "@/components/checkout/PlaceOrderButton";
import { ProductHeader } from "@/components/product/ProductHeader";
import useAuth from "@/hooks/useAuth";
import { useAppStore } from "@/store/useAppStore";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CheckoutScreen() {
  const { user, loading } = useAuth(); // 👈 obtener el usuario autenticado
  const { products, loadProducts } = useAppStore();

  const [selectedAddressId, setSelectedAddressId] = useState("addr_1");
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "tarjeta" | "">("");
  const [cardForm, setCardForm] = useState({ holder: "", number: "", expiry: "", cvv: "" });
  const [items, setItems] = useState<any[]>([]);

  // 🚫 Si no hay sesión, redirigir al login
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/(auth)/login");
    }
  }, [loading, user]);

  // 🕓 Mostrar mientras se valida sesión
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando sesión...</Text>
      </View>
    );
  }

  if (!user) return null; // evita render mientras redirige

  // 🧩 Cargar productos del store
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (products.length > 0) {
      const enriched = products.map((p) => ({
        ...p,
        quantity: 1,
        inStock: Math.floor(Math.random() * 10) + 1,
        subtotal: p.price * 1,
      }));
      setItems(enriched);
    }
  }, [products]);

  // 📦 Direcciones mockeadas
  const addresses = [
    {
      id: "addr_1",
      tipo_direccion: "Casa",
      nombre_direccion: "Calle Falsa 123",
      referencia: "Frente a la pulpería El Sol",
      telefono: "9876-5432",
      es_principal: true,
    },
    {
      id: "addr_2",
      tipo_direccion: "Oficina",
      nombre_direccion: "Avenida Siempre Viva 742",
      referencia: "Edificio Azul, piso 2",
      telefono: "9988-1122",
      es_principal: false,
    },
  ];

  // 🧮 Calcular resumen
  const summary = useMemo(() => {
    const itemsCount = items.reduce((a, i) => a + i.quantity, 0);
    const subtotal = items.reduce((a, i) => a + (i.subtotal ?? 0), 0);
    const taxes = Math.round(subtotal * 0.15 * 100) / 100;
    const total = subtotal + taxes;
    return { itemsCount, subtotal, taxes, total };
  }, [items]);

  // 💳 Validaciones de tarjeta
  const isCardValid =
    paymentMethod !== "tarjeta" ||
    (cardForm.holder.trim().length > 3 &&
      cardForm.number.replace(/\s/g, "").length >= 15 &&
      /\d{2}\/\d{2}/.test(cardForm.expiry) &&
      cardForm.cvv.length >= 3);

  const canPlaceOrder = selectedAddressId && paymentMethod && isCardValid;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />
      <ProductHeader showCartButton={false} />

      {/* Contenido */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        <AddressSelector
          addresses={addresses}
          selectedId={selectedAddressId}
          onSelect={setSelectedAddressId}
        />

        <PaymentMethodSelector
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          cardForm={cardForm}
          setCardForm={setCardForm}
        />

        <CartSection items={items} />
      </ScrollView>

      {/* Resumen y botón */}
      <OrderSummary summary={summary} />
      <PlaceOrderButton disabled={!canPlaceOrder} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFD600" },
  scrollArea: { flex: 1, marginBottom: 3, borderRadius: 12 },
  scrollContent: { padding: 2 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    fontSize: 16,
    color: "#52525b",
  },
});
