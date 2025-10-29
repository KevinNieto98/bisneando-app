// app/(app)/checkout/CheckoutScreen.tsx
import { AddressSelector } from "@/components/checkout/AddressSelector";
import { CartSection } from "@/components/checkout/CartSection";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { PaymentMethodSelector } from "@/components/checkout/PaymentMethodSelector";
import { PlaceOrderButton } from "@/components/checkout/PlaceOrderButton";
import { ProductHeader } from "@/components/product/ProductHeader";
import useAuth from "@/hooks/useAuth";
import { useAppStore } from "@/store/useAppStore";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { BackHandler, Platform, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 🔹 Direcciones reales
import { supabase } from "@/lib/supabase";
import { Direccion, fetchDireccionesByUid } from "@/services/api";

// 🔹 Confirmación al salir
import ConfirmModal from "@/components/ui/ConfirmModal";

// ✅ Necesario para detectar foco de pantalla (trabaja con expo-router)
import { useFocusEffect } from "@react-navigation/native";

type Addr = {
  id: number;
  tipo_direccion: number;
  nombre_direccion: string;
  referencia: string;
  isPrincipal?: boolean;
};

export default function CheckoutScreen() {
  const { user, loading } = useAuth();
  const { products, loadProducts } = useAppStore();

  // Estado de checkout
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "tarjeta" | "">("");
  const [cardForm, setCardForm] = useState({ holder: "", number: "", expiry: "", cvv: "" });
  const [items, setItems] = useState<any[]>([]);

  // Direcciones
  const [addresses, setAddresses] = useState<Addr[]>([]);
  const [isAddrLoading, setIsAddrLoading] = useState<boolean>(true);
  const firstLoadRef = useRef(true);

  // Modal confirmación back
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  // 🔙 Interceptar botón físico de atrás en Android
  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS !== "android") return undefined;

      const onBackPress = () => {
        // si el modal ya está abierto, ciérralo
        if (showBackConfirm) {
          setShowBackConfirm(false);
          return true; // consumimos el evento
        }
        // si no está abierto, mostrar confirm y bloquear navegación por defecto
        setShowBackConfirm(true);
        return true;
      };

      const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => sub.remove();
    }, [showBackConfirm])
  );

  // Redirección si no hay sesión
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/(auth)/login");
    }
  }, [loading, user]);

  // Productos demo
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

  // fetch direcciones por uid
  const fetchAddresses = async (hard = false) => {
    if (!user?.id) return;
    if (hard) setIsAddrLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      const rows: Direccion[] = await fetchDireccionesByUid(user.id, { token });

      const mapped: Addr[] = rows.map((r) => ({
        id: r.id_direccion,
        tipo_direccion: r.tipo_direccion,
        nombre_direccion: r.nombre_direccion ?? "Sin nombre",
        referencia: r.referencia ?? "",
        isPrincipal: !!r.isPrincipal,
      }));

      setAddresses(mapped);

      // Primer load: auto-seleccionar principal
      if (firstLoadRef.current) {
        const principal = mapped.find((m) => m.isPrincipal);
        setSelectedAddressId(principal?.id ?? (mapped[0]?.id ?? null));
        firstLoadRef.current = false;
      }
    } catch (e: any) {
      console.error("fetch direcciones checkout:", e);
    } finally {
      setIsAddrLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchAddresses(true);
  }, [user?.id]);

  // Resumen
  const summary = useMemo(() => {
    const itemsCount = items.reduce((a, i) => a + i.quantity, 0);
    const subtotal = items.reduce((a, i) => a + (i.subtotal ?? 0), 0);
    const taxes = Math.round(subtotal * 0.15 * 100) / 100;
    const total = subtotal + taxes;
    return { itemsCount, subtotal, taxes, total };
  }, [items]);

  // Validaciones
  const isCardValid =
    paymentMethod !== "tarjeta" ||
    (cardForm.holder.trim().length > 3 &&
      cardForm.number.replace(/\s/g, "").length >= 15 &&
      /\d{2}\/\d{2}/.test(cardForm.expiry) &&
      cardForm.cvv.length >= 3);

  const canPlaceOrder = !!selectedAddressId && !!paymentMethod && isCardValid;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando sesión...</Text>
      </View>
    );
  }
  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />

      <ProductHeader
        // El back del header también dispara el confirm
        returnAction={() => setShowBackConfirm(true)}
        showCartButton={false}
      />

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        <AddressSelector
          addresses={addresses}
          selectedId={selectedAddressId}
          onSelect={setSelectedAddressId}
          isLoading={isAddrLoading}
          onAdd={() =>
            router.push({
              pathname: "/address",
              params: { lastPage: "checkout" },
            })
          }
          variant="grid"
        />

        <PaymentMethodSelector
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          cardForm={cardForm}
          setCardForm={setCardForm}
        />

        <CartSection items={items} />
      </ScrollView>

      <OrderSummary summary={summary} />
      <PlaceOrderButton variant="warning" disabled={!canPlaceOrder} />

      {/* Modal de confirmación para salir del checkout */}
      <ConfirmModal
        visible={showBackConfirm}
        title="¿Salir del checkout?"
        message={"Si regresas, perderás el progreso de esta orden.\n\n¿Deseas salir?"}
        icon="alert-circle"
        confirmText="Salir"
        cancelText="Continuar aquí"
        onConfirm={() => {
          setShowBackConfirm(false);
          router.replace("/(tabs)/cart");
        }}
        onCancel={() => setShowBackConfirm(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFD600" },
  scrollArea: { flex: 1, marginBottom: 3, borderRadius: 12 },
  scrollContent: { padding: 2 },
  loadingContainer: {
    flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff",
  },
  loadingText: { fontSize: 16, color: "#52525b" },
});
