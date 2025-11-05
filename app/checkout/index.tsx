// app/(app)/checkout/CheckoutScreen.tsx
import { AddressSelector } from "@/components/checkout/AddressSelector";
import { CartSection } from "@/components/checkout/CartSection";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import PaymentMethodSelector, { codeFromId } from "@/components/checkout/PaymentMethodSelector";
import { PlaceOrderButton } from "@/components/checkout/PlaceOrderButton";
import { ProductHeader } from "@/components/product/ProductHeader";
import useAuth from "@/hooks/useAuth";
import { useAppStore } from "@/store/useAppStore";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 🔹 Direcciones reales
import { supabase } from "@/lib/supabase";
import { Direccion, fetchDireccionesByUid } from "@/services/api";

// 🔹 Confirmación al salir
import ConfirmModal from "@/components/ui/ConfirmModal";

// ✅ Necesario para detectar foco de pantalla
import { useFocusEffect } from "@react-navigation/native";

type CheckoutParams = {
  cart?: string;
  totals?: string;
};

type Addr = {
  id: number;
  tipo_direccion: number;
  nombre_direccion: string;
  referencia: string;
  isPrincipal?: boolean;
};

const MIN_CARD_TOTAL = 1500;

const toNumber = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export default function CheckoutScreen() {
  const { user, loading } = useAuth();
  const { products, loadProducts } = useAppStore();
  const { cart: cartParam, totals: totalsParam } = useLocalSearchParams<CheckoutParams>();

  // Estado de checkout
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  // 🔸 Ahora control por ID de método (coincide con id_metodo en BD)
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
  const [cardForm, setCardForm] = useState({ holder: "", number: "", expiry: "", cvv: "" });

  // Ítems
  const [items, setItems] = useState<any[]>([]);

  // Direcciones
  const [addresses, setAddresses] = useState<Addr[]>([]);
  const [isAddrLoading, setIsAddrLoading] = useState<boolean>(true);
  const firstLoadRef = useRef(true);

  // Modal confirmación back
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS !== "android") return undefined;

      const onBackPress = () => {
        if (showBackConfirm) {
          setShowBackConfirm(false);
          return true;
        }
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

  // Demo products si no llegaron params
  useEffect(() => {
    if (cartParam) return;
    loadProducts();
  }, [loadProducts, cartParam]);

  useEffect(() => {
    if (cartParam) return;
    if (products.length > 0) {
      const enriched = products.map((p) => ({
        id: p.id,
        title: p.title,
        price: Number(p.price),
        quantity: 1,
        image: Array.isArray(p.images) ? p.images[0] : undefined,
        inStock: Math.floor(Math.random() * 10) + 1,
        subtotal: Number(p.price) * 1,
      }));
      setItems(enriched);
    }
  }, [products, cartParam]);

  // Carrito por params (dbPrice ya aplicado como price)
  useEffect(() => {
    if (!cartParam) return;
    try {
      const parsed = JSON.parse(decodeURIComponent(cartParam));
      const normalized = (Array.isArray(parsed) ? parsed : []).map((it) => {
        const priceNum = toNumber(it.price);
        const qtyNum = toNumber(it.quantity);
        return {
          id: toNumber(it.id),
          title: String(it.title ?? ""),
          price: priceNum,
          quantity: qtyNum,
          image: it.image,
          dbPrice: typeof it.dbPrice === "number" ? it.dbPrice : undefined,
          subtotal: priceNum * qtyNum,
        };
      });
      setItems(normalized);
    } catch (e) {
      console.warn("No se pudo parsear cart param:", e);
    }
  }, [cartParam]);

  // Totales por params (opcional)
  const totalsFromParam = useMemo(() => {
    if (!totalsParam) return null;
    try {
      const t = JSON.parse(decodeURIComponent(totalsParam));
      const subtotal = toNumber(t.subtotal);
      const shipping = toNumber(t.shipping);
      const taxes = toNumber(t.taxes);
      const total = toNumber(t.total ?? subtotal + shipping + taxes);
      return { subtotal, shipping, taxes, total };
    } catch (e) {
      console.warn("No se pudo parsear totals param:", e);
      return null;
    }
  }, [totalsParam]);

  // Direcciones por uid
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
    const itemsCount = items.reduce((a, i) => a + toNumber(i.quantity), 0);

    if (totalsFromParam) {
      return {
        itemsCount,
        subtotal: toNumber(totalsFromParam.subtotal),
        taxes: toNumber(totalsFromParam.taxes),
        total: toNumber(totalsFromParam.total),
      };
    }

    const subtotal = items.reduce(
      (a, i) => a + (toNumber(i.subtotal) || toNumber(i.price) * toNumber(i.quantity)),
      0
    );
    const taxes = Math.round(subtotal * 0.15 * 100) / 100;
    const total = subtotal + taxes;

    return { itemsCount, subtotal, taxes, total };
  }, [items, totalsFromParam]);

  // ======== Selección del método (ID → code) ========
  const paymentMethodCode: "efectivo" | "tarjeta" | "" = selectedMethodId == null
    ? ""
    : codeFromId(selectedMethodId);

  // Validaciones
  const isCard = selectedMethodId === 2;
  const cardFormValid =
    !isCard ||
    (cardForm.holder.trim().length > 3 &&
      cardForm.number.replace(/\s/g, "").length >= 15 &&
      /\d{2}\/\d{2}/.test(cardForm.expiry) &&
      cardForm.cvv.length >= 3);

  const meetsCardMin = !isCard || summary.total >= MIN_CARD_TOTAL;

  const reasons: string[] = [];
  if (!selectedAddressId) reasons.push("Selecciona una dirección.");
  if (!paymentMethodCode) reasons.push("Selecciona un método de pago.");
  if (isCard && summary.total < MIN_CARD_TOTAL) {
    reasons.push(`El total debe ser al menos L ${MIN_CARD_TOTAL.toLocaleString("es-HN")} para tarjeta.`);
  }
  if (isCard && !cardFormValid) {
    reasons.push("Completa correctamente los datos de la tarjeta.");
  }

  const canPlaceOrder = reasons.length === 0;

  useEffect(() => {
    console.log("[CHECKOUT] selectedMethodId:", selectedMethodId);
    console.log("[CHECKOUT] paymentMethodCode:", paymentMethodCode);
    console.log("[CHECKOUT] summary:", summary);
    console.log("[CHECKOUT] meetsCardMin:", meetsCardMin, "MIN_CARD_TOTAL:", MIN_CARD_TOTAL);
    console.log("[CHECKOUT] canPlaceOrder:", canPlaceOrder);
    console.log("[CHECKOUT] DISABLE REASONS:", reasons);
  }, [selectedMethodId, paymentMethodCode, summary, meetsCardMin, canPlaceOrder, reasons]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando sesión...</Text>
      </View>
    );
  }
  if (!user) return null;

  const handlePlaceOrder = () => {
    if (isCard && summary.total < MIN_CARD_TOTAL) {
      Alert.alert(
        "Monto mínimo no alcanzado",
        `Para pagar con tarjeta, el total debe ser al menos L ${MIN_CARD_TOTAL.toLocaleString("es-HN")}.`
      );
      return;
    }
    if (!canPlaceOrder) {
      Alert.alert("No podemos continuar", reasons.join("\n"));
      return;
    }
    router.push("/success");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />

      <ProductHeader
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
          selectedMethodId={selectedMethodId}
          onSelectMethod={(id, code) => {
            setSelectedMethodId(id); // 👈 control por ID
            // Si quieres ver el code:
            console.log("[PAYMENT] selected:", id, code);
          }}
          cardForm={cardForm}
          setCardForm={setCardForm}
        />

        {isCard && summary.total < MIN_CARD_TOTAL && (
          <View style={styles.cardMinBox}>
            <Text style={styles.cardMinText}>
              Monto mínimo para pagar con tarjeta: L{" "}
              {MIN_CARD_TOTAL.toLocaleString("es-HN")}
            </Text>
          </View>
        )}

        {reasons.length > 0 && (
          <View style={styles.reasonsBox}>
            {reasons.map((r, i) => (
              <Text key={i} style={styles.reasonsText}>• {r}</Text>
            ))}
          </View>
        )}

        <CartSection />
      </ScrollView>

      <OrderSummary summary={summary} />

      <PlaceOrderButton
        variant={isCard && !meetsCardMin ? "danger" : "warning"}
        disabled={!canPlaceOrder}
        onPress={handlePlaceOrder}
      />

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

// Sombras y elevación con fallbacks seguros
const iosShadow = Platform.OS === "ios"
  ? {
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 6,
    }
  : {};

const androidElevation = Platform.OS === "android" ? { elevation: 0 } : {};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFD600" },
  scrollArea: {
    flex: 1,
    marginBottom: 3,
    borderRadius: 12,
    ...iosShadow,
    ...androidElevation,
  },
  scrollContent: { padding: 2 },

  // Aviso mínimo tarjeta
  cardMinBox: {
    marginHorizontal: 10,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fef3c7", // amber-100
    borderColor: "#f59e0b",     // amber-500
    borderWidth: 1,
    borderRadius: 10,
  },
  cardMinText: {
    color: "#92400e",           // amber-900
    fontWeight: "700",
    fontSize: 13,
  },

  // Razones para bloquear
  reasonsBox: {
    marginHorizontal: 10,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fee2e2", // red-100
    borderColor: "#ef4444",     // red-500
    borderWidth: 1,
    borderRadius: 10,
  },
  reasonsText: {
    color: "#991b1b",           // red-900
    fontWeight: "700",
    fontSize: 12,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: { fontSize: 16, color: "#52525b" },
});
