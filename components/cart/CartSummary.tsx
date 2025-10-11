import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  subtotal: number;
  shipping: number;
  taxes: number;
  total: number;
  toHNL: (n: number) => string;
};

export const CartSummary: React.FC<Props> = ({
  subtotal,
  shipping,
  taxes,
  total,
  toHNL,
}) => {
  const navigation = useNavigation();

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

      {/* Botones */}
      <Pressable
        style={styles.checkoutBtn}
          onPress={() => router.push("/checkout")}
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
});
