import Button from "@/components/ui/Button";
import Icono from "@/components/ui/Icon.native";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  BackHandler,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

function formatOrderCode(id: number, width = 5, prefix = "ORD-") {
  if (!Number.isFinite(id) || id <= 0) return `${prefix}00000`;
  return `${prefix}${String(id).padStart(width, "0")}`;
}

export default function SuccessOrderScreen() {
  const router = useRouter(); // 👈 SOLO esto, nada de useNavigation()
  const params = useLocalSearchParams<{ id_order?: string }>();
  const rawId = Number(params.id_order ?? 0);
  const orderCode = formatOrderCode(rawId);

  useFocusEffect(
    React.useCallback(() => {
      const goHome = () => {
        console.log("[SUCCESS] HW Back -> replace to home");
        router.replace("/(tabs)/home");
        return true;
      };

      const subHW = BackHandler.addEventListener("hardwareBackPress", goHome);

      return () => {
        subHW.remove();
      };
    }, [router])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />

      <View style={styles.card}>
        <View style={styles.iconWrapper}>
          <Icono name="CheckCircle2" size={80} color="#16a34a" />
        </View>

        <Text style={styles.title}>¡Hemos recibido tu pedido!</Text>
        <Text style={styles.subtitle}>
          Muy pronto nos comunicaremos contigo para confirmar los detalles y
          avanzar con el envío.
        </Text>

        <View style={styles.orderBox}>
          <Text style={styles.orderLabel}>ID de la orden</Text>
          <Text style={styles.orderId}>{orderCode}</Text>
        </View>

        <View style={styles.buttonsRow}>
          <Button
            title="Regresar"
            iconName="Home"
            variant="gray"
            onPress={() => {
              console.log("[SUCCESS] Botón Regresar");
              router.replace("/(tabs)/home");
            }}
          />

          <Button
            title="Dar seguimiento"
            iconName="Truck"
            variant="primary"
            onPress={() => {
              console.log("[SUCCESS] Botón Seguimiento");
              router.replace("/orders/id");
            }}
          />
        </View>

        <Text style={styles.tip}>
          Consejo: Guarda tu ID para futuras consultas.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFD600",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: "center",
  },
  iconWrapper: { marginBottom: 16 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 15,
    marginBottom: 20,
  },
  orderBox: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  orderLabel: { fontSize: 13, color: "#6b7280" },
  orderId: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: "#111827",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    width: "100%",
    marginBottom: 16,
  },
  tip: { fontSize: 12, color: "#6b7280", marginTop: 10, textAlign: "center" },
});
