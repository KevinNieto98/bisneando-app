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
  BackHandler,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 🔹 Direcciones reales
import { supabase } from "@/lib/supabase";
import { Direccion, fetchDireccionesByUid } from "@/services/api";

// 🔹 Modales
import AlertModal from "@/components/ui/AlertModal";
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

const toNumber = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// 🔒 Regla: tope para pagos en efectivo
const MAX_CASH_TOTAL = 1500;

export default function CheckoutScreen() {
  const { user, loading } = useAuth();
  const { products, loadProducts } = useAppStore();
  const { cart: cartParam, totals: totalsParam } = useLocalSearchParams<CheckoutParams>();

  // Estado de checkout
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  // 🔸 Control por ID de método (coincide con id_metodo en BD)
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
  const [cardForm, setCardForm] = useState({ holder: "", number: "", expiry: "", cvv: "" });

  // Ítems
  const [items, setItems] = useState<any[]>([]);

  // Direcciones
  const [addresses, setAddresses] = useState<Addr[]>([]);
  const [isAddrLoading, setIsAddrLoading] = useState<boolean>(true);
  const firstLoadRef = useRef(true);

  // Loading métodos de pago (desde hijo)
  const [isPmLoading, setIsPmLoading] = useState<boolean>(false);

  // Modal confirmación back
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  // Modal de alertas (reasons)
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const openReason = (msg: string) => {
    setModalMessage(msg);
    setIsModalVisible(true);
  };
  const handleModalClose = () => setIsModalVisible(false);

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
        shipping: toNumber((totalsFromParam as any).shipping ?? 0),
      };
    }

    const subtotal = items.reduce(
      (a, i) => a + (toNumber(i.subtotal) || toNumber(i.price) * toNumber(i.quantity)),
      0
    );
    const taxes = Math.round(subtotal * 0.15 * 100) / 100;
    const shipping = 0; // ajusta si manejas envío
    const total = subtotal + taxes + shipping;

    return { itemsCount, subtotal, taxes, shipping, total };
  }, [items, totalsFromParam]);

  // ======== Selección del método (ID → code) ========
  const paymentMethodCode: "efectivo" | "tarjeta" | "" =
    selectedMethodId == null ? "" : codeFromId(selectedMethodId);

  // Validaciones (usadas al intentar colocar orden)
  const isCard = selectedMethodId === 2;
  const isCash = !isCard && !!paymentMethodCode; // efectivo = no tarjeta y hay método elegido
  const cardFormValid =
    !isCard ||
    (cardForm.holder.trim().length > 3 &&
      cardForm.number.replace(/\s/g, "").length >= 15 &&
      /\d{2}\/\d{2}/.test(cardForm.expiry) &&
      cardForm.cvv.length >= 3);

  // ======== LOG HELPERS ========
  const buildLogPayload = (phase: "attempt" | "ready" | "blocked") => {
    const now = new Date();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const addressObj =
      selectedAddressId != null ? addresses.find(a => a.id === selectedAddressId) ?? null : null;

    return {
      phase,
      timestamp_iso: now.toISOString(),
      timestamp_local: now.toLocaleString("es-HN"),
      timezone_device: tz,
      platform: { os: Platform.OS, version: Platform.Version },
      user: {
        uid: user?.id ?? null,
        email: (user as any)?.email ?? null,
      },
      cart: {
        itemsCount: summary.itemsCount,
        items: items.map(it => ({
          id: it.id,
          title: it.title,
          price: Number(it.price),
          quantity: Number(it.quantity),
          subtotal: Number(it.subtotal ?? (Number(it.price) * Number(it.quantity))),
          image: it.image ?? null,
          dbPrice: typeof it.dbPrice === "number" ? it.dbPrice : null,
        })),
      },
      address: addressObj
        ? {
            id: addressObj.id,
            tipo_direccion: addressObj.tipo_direccion,
            nombre_direccion: addressObj.nombre_direccion,
            referencia: addressObj.referencia,
            isPrincipal: !!addressObj.isPrincipal,
          }
        : null,
      payment: {
        selectedMethodId,
        paymentMethodCode: paymentMethodCode || null,
        isCard,
        cardForm: isCard
          ? {
              holder: cardForm.holder,
              numberMasked: cardForm.number.replace(/\d(?=\d{4})/g, "•"),
              expiry: cardForm.expiry,
              cvvMasked: cardForm.cvv ? "•••" : "",
              valid: cardFormValid,
            }
          : null,
      },
      rules: {
        maxCashTotal: MAX_CASH_TOTAL,
      },
      totals: {
        subtotal: summary.subtotal,
        taxes: summary.taxes,
        shipping: summary.shipping,
        total: summary.total,
      },
      loading: {
        isAddrLoading,
        isPmLoading,
      },
    };
  };

  const handlePlaceOrder = () => {
    // Siempre logeamos el intento con el estado actual
    console.log("[CHECKOUT][PLACE_ORDER_ATTEMPT]", JSON.stringify(buildLogPayload("attempt"), null, 2));

    // Si aún estamos cargando algo, avisar y loggear
    if (isAddrLoading || isPmLoading) {
      console.log("[CHECKOUT][BLOCKED_LOADING]", JSON.stringify(buildLogPayload("blocked"), null, 2));
      openReason("Estamos cargando la información necesaria. Intenta nuevamente en unos segundos.");
      return;
    }

    // 1) Método de pago no seleccionado
    if (!paymentMethodCode) {
      console.log("[CHECKOUT][BLOCKED_NO_PAYMENT]", JSON.stringify(buildLogPayload("blocked"), null, 2));
      openReason("Debes elegir un método de pago para continuar.");
      return;
    }

    // 2) Dirección no seleccionada
    if (!selectedAddressId) {
      console.log("[CHECKOUT][BLOCKED_NO_ADDRESS]", JSON.stringify(buildLogPayload("blocked"), null, 2));
      openReason("Debes elegir una dirección de entrega para continuar.");
      return;
    }

    // 2.5) Regla de EFECTIVO: total debe ser < 1500
    if (isCash && summary.total >= MAX_CASH_TOTAL) {
      console.log("[CHECKOUT][BLOCKED_CASH_CAP]", JSON.stringify(buildLogPayload("blocked"), null, 2));
      openReason(
        `Para pagar en efectivo, el total debe ser menor a L ${MAX_CASH_TOTAL.toLocaleString("es-HN")}. ` +
        `Selecciona Tarjeta o ajusta tu carrito.`
      );
      return;
    }

    // 3) Validación de tarjeta si aplica
    if (isCard && !cardFormValid) {
      console.log("[CHECKOUT][BLOCKED_CARD_INVALID]", JSON.stringify(buildLogPayload("blocked"), null, 2));
      openReason("Completa correctamente los datos de la tarjeta.");
      return;
    }

    // Todo listo
    console.log("[CHECKOUT][ORDER_READY]", JSON.stringify(buildLogPayload("ready"), null, 2));
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
            setSelectedMethodId(id);
            console.log("[PAYMENT] selected:", id, code);
          }}
          cardForm={cardForm}
          setCardForm={setCardForm}
          onLoadingChange={setIsPmLoading}
        />

        {/* No mostramos reasons en la UI; solo AlertModal cuando intenta colocar orden */}
        <CartSection />
      </ScrollView>

      <OrderSummary summary={summary} />

      <PlaceOrderButton
        variant="warning"
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

      <AlertModal
        visible={isModalVisible}
        title="¡Ups!"
        message={modalMessage}
        onClose={handleModalClose}
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

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: { fontSize: 16, color: "#52525b" },
});
