import { validateCart } from "@/services/api";
import type { CartItem as CartItemType } from "@/store/useCartStore";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

type ValidationIssue = {
  id: number;
  status: "insufficient_stock" | "price_mismatch" | "inactive" | "not_found";
  availableQty?: number; // si hay stock insuficiente
  dbPrice?: number;      // si hubo cambio de precio
  nombre_producto?: string;
};

type Props = {
  subtotal: number;
  shipping: number;
  taxes: number;
  total: number;
  toHNL: (n: number) => string;
  items: CartItemType[];
  /** Notifica al screen que hubo errores, con detalle por item */
  onValidationFail?: (payload: {
    message: string;
    issues: ValidationIssue[];
  }) => void;
};

export const CartSummary: React.FC<Props> = ({
  subtotal,
  shipping,
  taxes,
  total,
  toHNL,
  items,
  onValidationFail,
}) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

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
        }))
      );

      console.log("Validación del carrito:", res);

      if (!res.ok) {
        const first = res.items?.find((i) => i.status !== "ok");
        let msg = "No se puede continuar con la orden. Revisa tu carrito.";
        if (first) {
          switch (first.status) {
            case "insufficient_stock":
              msg = `Stock insuficiente para "${(first as any).nombre_producto}". Disponibles: ${(first as any).availableQty}.`;
              break;
            case "price_mismatch":
              msg = `El precio de "${(first as any).nombre_producto}" cambió a ${(first as any).dbPrice}.`;
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
          res.items
            ?.filter((i) => i.status !== "ok")
            .map((i: any) => ({
              id: i.id,
              status: i.status,
              availableQty: typeof i.availableQty === "number" ? i.availableQty : undefined,
              dbPrice: typeof i.dbPrice === "number" ? i.dbPrice : undefined,
              nombre_producto: i.nombre_producto,
            })) ?? [];

        onValidationFail?.({ message: msg, issues });
        return;
      }

      router.push("/checkout");
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
        android_ripple={!isCheckoutDisabled ? { color: "rgba(255,255,255,0.2)" } : undefined}
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
        onPress={() => navigation.navigate("Products" as never)}
        disabled={isKeepDisabled}
        android_ripple={!isKeepDisabled ? { color: "rgba(0,0,0,0.06)" } : undefined}
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
