import { validateCart } from "@/services/api";

import { useCartStore } from "@/store/useCartStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type CartItemValidation = {
  id_bodega: any;
  id: number;
  title: string;
  price: number;
  images: string[];
  quantity: number;
  inStock?: number;
};

type ValidationIssue = {
  id: number;
  status: "insufficient_stock" | "price_mismatch" | "inactive" | "not_found";
  availableQty?: number;
  dbPrice?: number;
  nombre_producto?: string;
};

type Props = {
  subtotal: number;
  shipping: number;
  taxes: number;
  total: number;
  toHNL: (n: number) => string;
  items: CartItemValidation[];
  onValidationFail?: (payload: {
    message: string;
    issues: ValidationIssue[];
  }) => void;
  // 👇 NUEVO: callback para "Seguir comprando"
  onKeepShopping: () => void;
};

export const CartSummary: React.FC<Props> = ({
  subtotal,
  shipping,
  taxes,
  total,
  toHNL,
  items,
  onValidationFail,
  onKeepShopping,
}) => {
  const [loading, setLoading] = useState(false);

  // Nueva acción del store para aplicar precios del servidor
  const applyServerPrices = useCartStore((s) => s.applyServerPrices);

  const onPressCheckout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await validateCart(
        items.map((i) => ({
          id: i.id,
          price: i.price,
          quantity: i.quantity,
          title: i.title,
          id_bodega: i.id_bodega,
        }))
      );

      console.log("Validación del carrito:", res);

      if (!res?.ok) {
        const first = res?.items?.find((i: any) => i.status !== "ok");
        let msg = "No se puede continuar con la orden. Revisa tu carrito.";
        if (first) {
          switch (first.status) {
            case "insufficient_stock":
              msg = `Stock insuficiente para "${first.nombre_producto}". Disponibles: ${first.availableQty}.`;
              break;
            case "price_mismatch":
              msg = `El precio de "${first.nombre_producto}" cambió a ${first.dbPrice}.`;
              break;
            case "inactive":
              msg = "Un producto está inactivo. Retíralo del carrito.";
              break;
            case "not_found":
              msg = "Un producto no se encontró. Retíralo del carrito.";
              break;
          }
        }

        const issues: ValidationIssue[] =
          res?.items
            ?.filter((i: any) => i.status !== "ok")
            .map((i: any) => ({
              id: i.id,
              status: i.status,
              availableQty:
                typeof i.availableQty === "number" ? i.availableQty : undefined,
              dbPrice: typeof i.dbPrice === "number" ? i.dbPrice : undefined,
              nombre_producto: i.nombre_producto,
            })) ?? [];

        onValidationFail?.({ message: msg, issues });
        return;
      }

      // === OK: precios del servidor ===
      const serverItems = Array.isArray(res.items) ? res.items : [];
      console.log("serverItems: ", serverItems);

      // 1) Actualiza precios en el store (UI/local) con dbPrice (+ id_bodega si tu store ya lo soporta)
      applyServerPrices(serverItems);

      // 2) Construye el cart para checkout con precios definitivos
      // ✅ FIX: soporte de key exacta `${id_bodega}:${id}` + fallback por id
      const serverItemsMapExact = new Map<string, any>();
      const serverItemsMapById = new Map<number, any>();

      for (const s of serverItems) {
        if (s == null) continue;

        const sid = Number(s.id);
        if (!Number.isFinite(sid)) continue;

        // if (typeof s.id_bodega === "number") {
        //   serverItemsMapExact.set(`${s.id_bodega}:${sid}`, s);
        // }
        // fallback por id
        serverItemsMapById.set(sid, s);
      }

      const checkoutCart = items.map((i) => {
        const keyExact =
          i.id_bodega != null ? `${Number(i.id_bodega)}:${Number(i.id)}` : null;

        const server =
          (keyExact ? serverItemsMapExact.get(keyExact) : undefined) ??
          serverItemsMapById.get(Number(i.id));

        const priceFromServer =
          server && typeof server.dbPrice === "number"
            ? server.dbPrice
            : i.price;

        // ✅ FIX: id_bodega desde servidor si viene; fallback a i.id_bodega
        const bodegaFromServer =
          server && typeof server.id_bodega === "number"
            ? server.id_bodega
            : i.id_bodega;

        const qtyFromServer =
          server && typeof server.requestedQty === "number"
            ? server.requestedQty
            : i.quantity;

        return {
          id: i.id,
          title: i.title,
          quantity: qtyFromServer,
          id_bodega: bodegaFromServer,
          price: priceFromServer, // definitivo para cobro
          dbPrice:
            typeof server?.dbPrice === "number" ? server.dbPrice : undefined,
          image: Array.isArray(i.images) ? i.images[0] : undefined,
        };
      });

      // ✅ Debug recomendado (puedes quitarlo después)
      console.log(
        "[CARTSUMMARY][CHECKOUT_CART_BODEGAS]",
        checkoutCart.map((x) => ({ id: x.id, id_bodega: x.id_bodega }))
      );

      const subtotalServer = checkoutCart.reduce(
        (acc, it) => acc + Number(it.price) * Number(it.quantity),
        0
      );
      const totalServer = subtotalServer + (shipping || 0) + (taxes || 0);

      router.push({
        pathname: "/checkout",
        params: {
          cart: encodeURIComponent(JSON.stringify(checkoutCart)),
          totals: encodeURIComponent(
            JSON.stringify({
              subtotal: subtotalServer,
              shipping,
              taxes,
              total: totalServer,
            })
          ),
        },
      });
    } catch (err) {
      console.error("Error en checkout:", err);
      onValidationFail?.({
        message: "Hubo un problema al validar. Intenta de nuevo.",
        issues: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const isCheckoutDisabled = loading || items.length === 0;
  const isKeepDisabled = loading;

  return (
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

      {/* Ir a pagar */}
      <Pressable
        style={({ pressed }) => [
          styles.checkoutBtn,
          isCheckoutDisabled && styles.checkoutBtnDisabled,
          pressed && !isCheckoutDisabled && { opacity: 0.9 },
        ]}
        onPress={onPressCheckout}
        disabled={isCheckoutDisabled}
        android_ripple={
          !isCheckoutDisabled
            ? { color: "rgba(255,255,255,0.2)" }
            : undefined
        }
        accessibilityRole="button"
        accessibilityState={{ disabled: isCheckoutDisabled, busy: loading }}
        accessibilityLabel="Proceder al pago"
      >
        {loading ? (
          <ActivityIndicator size="small" />
        ) : (
          <Ionicons name="card-outline" size={18} color="white" />
        )}
        <Text style={styles.checkoutText}>
          {loading ? "Validando..." : "Ir a pagar"}
        </Text>
      </Pressable>

      {/* Seguir comprando */}
      <Pressable
        style={({ pressed }) => [
          styles.keepBtn,
          isKeepDisabled && styles.keepBtnDisabled,
          pressed && !isKeepDisabled && { opacity: 0.9 },
        ]}
        onPress={onKeepShopping}
        disabled={isKeepDisabled}
        android_ripple={
          !isKeepDisabled ? { color: "rgba(0,0,0,0.06)" } : undefined
        }
        accessibilityRole="button"
        accessibilityState={{ disabled: isKeepDisabled, busy: loading }}
        accessibilityLabel="Seguir comprando"
      >
        <Ionicons
          name="arrow-forward-outline"
          size={18}
          color={isKeepDisabled ? "#94a3b8" : "#2563eb"}
        />
        <Text style={[styles.keepText, isKeepDisabled && { color: "#94a3b8" }]}>
          Seguir comprando
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
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
  checkoutBtnDisabled: {
    backgroundColor: "#94a3b8",
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
  keepBtnDisabled: {
    borderColor: "#e5e7eb",
    backgroundColor: "#f3f4f6",
  },
  keepText: { color: "#2563eb", fontWeight: "600" },
});
