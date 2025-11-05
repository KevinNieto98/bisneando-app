// app/(app)/checkout/CheckoutScreen.tsx
import { AddressSelector } from "@/components/checkout/AddressSelector";
import { CartSection } from "@/components/checkout/CartSection";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { PaymentMethodSelector } from "@/components/checkout/PaymentMethodSelector";
import { PlaceOrderButton } from "@/components/checkout/PlaceOrderButton";
import { ProductHeader } from "@/components/product/ProductHeader";
import useAuth from "@/hooks/useAuth";
import { useAppStore } from "@/store/useAppStore";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
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

// ✅ Necesario para detectar foco de pantalla (trabaja con expo-router / react-navigation)
import { useFocusEffect } from "@react-navigation/native";

type Addr = {
  id: number;
  tipo_direccion: number;
  nombre_direccion: string;
  referencia: string;
  isPrincipal?: boolean;
};

// Tipos de params recibidos
type CheckoutParams = {
  cart?: string;   // encodeURIComponent(JSON.stringify([...]))
  totals?: string; // encodeURIComponent(JSON.stringify({ subtotal, shipping, taxes, total }))
};

export default function CheckoutScreen() {
  const { user, loading } = useAuth();
  const { products, loadProducts } = useAppStore();

  // ⬇️ Recibir carrito/total desde router params
  const { cart: cartParam, totals: totalsParam } = useLocalSearchParams<CheckoutParams>();

  // Estado de checkout
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "tarjeta" | "">("");
  const [cardForm, setCardForm] = useState({ holder: "", number: "", expiry: "", cvv: "" });

  // Ítems que se renderizan en el checkout
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

  // Si NO llegaron params, mantiene tu demo (productos del store)
  useEffect(() => {
    if (cartParam) return; // si llegó carrito por params, no cargues demo
    loadProducts();
  }, [loadProducts, cartParam]);

  // Si hay productos demo y no llegó carrito por params, arma items de prueba
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

  // ⬇️ Parsear carrito recibido por params (con dbPrice ya aplicado como price)
  useEffect(() => {
    if (!cartParam) return;
    try {
      const parsed = JSON.parse(decodeURIComponent(cartParam));
      // normalizar (asegurar price/quantity numéricos y subtotal)
      const normalized = (Array.isArray(parsed) ? parsed : []).map((it) => {
        const priceNum = Number(it.price);
        const qtyNum = Number(it.quantity);
        return {
          id: Number(it.id),
          title: String(it.title ?? ""),
          price: isNaN(priceNum) ? 0 : priceNum, // ← aquí ya viene dbPrice si existía
          quantity: isNaN(qtyNum) ? 0 : qtyNum,
          image: it.image,
          dbPrice: typeof it.dbPrice === "number" ? it.dbPrice : undefined,
          subtotal: isNaN(priceNum) || isNaN(qtyNum) ? 0 : priceNum * qtyNum,
        };
      });
      setItems(normalized);
    } catch (e) {
      console.warn("No se pudo parsear cart param:", e);
      // si falla parseo, dejamos items como estén (demo o vacío)
    }
  }, [cartParam]);

  // Parsear totales recibidos (opcional). Si no vienen, se calculará abajo.
  const totalsFromParam = useMemo(() => {
    if (!totalsParam) return null;
    try {
      const t = JSON.parse(decodeURIComponent(totalsParam));
      const subtotal = Number(t.subtotal ?? 0);
      const shipping = Number(t.shipping ?? 0);
      const taxes = Number(t.taxes ?? 0);
      const total = Number(t.total ?? subtotal + shipping + taxes);
      return { subtotal, shipping, taxes, total };
    } catch (e) {
      console.warn("No se pudo parsear totals param:", e);
      return null;
    }
  }, [totalsParam]);

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

  // Resumen: usa los totales del server si llegaron, si no, calcula
  const summary = useMemo(() => {
    const itemsCount = items.reduce((a, i) => a + Number(i.quantity || 0), 0);

    if (totalsFromParam) {
      return {
        itemsCount,
        subtotal: totalsFromParam.subtotal,
        taxes: totalsFromParam.taxes,
        total: totalsFromParam.total,
      };
    }

    const subtotal = items.reduce(
      (a, i) => a + Number(i.subtotal || (i.price || 0) * (i.quantity || 0)),
      0
    );
    const taxes = Math.round(subtotal * 0.15 * 100) / 100;
    const total = subtotal + taxes;
    return { itemsCount, subtotal, taxes, total };
  }, [items, totalsFromParam]);

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

        {/* Render del carrito recibido (o demo) */}
        <CartSection  />
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

// Sombras y elevación con fallbacks seguros (nada de spreads de undefined)
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
    // ✅ spreads con objeto seguro (nunca undefined)
    ...iosShadow,
    ...androidElevation,
  },
  scrollContent: { padding: 2 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: { fontSize: 16, color: "#52525b" },
});
