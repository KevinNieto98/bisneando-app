import Button from "@/components/ui/Button";
import Icono from "@/components/ui/Icon.native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";

export default function SuccessOrderScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const orderId = (route.params as any)?.id || "ORD-123456";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />

      <View style={styles.card}>
        {/* ✅ Icono principal */}
        <View style={styles.iconWrapper}>
          <Icono name="CheckCircle2" size={80} color="#16a34a" />
        </View>

        {/* ✅ Título y mensaje */}
        <Text style={styles.title}>¡Hemos recibido tu pedido!</Text>
        <Text style={styles.subtitle}>
          Muy pronto nos comunicaremos contigo para confirmar los detalles y avanzar con el envío.
        </Text>

        {/* ✅ Bloque con ID */}
        <View style={styles.orderBox}>
          <Text style={styles.orderLabel}>ID de la orden</Text>
          <Text style={styles.orderId}>{orderId}</Text>
        </View>

        {/* ✅ Botones */}
        <View style={styles.buttonsRow}>
            <Button
            title="Regresar"
            iconName="Home"
            variant="gray"
            onPress={() =>  router.push("/home")}
          />
          <Button
            title="Dar seguimiento"
            iconName="Truck"
            variant="primary"
            onPress={() => navigation.navigate("Orders" as never)}
          />
        </View>

        {/* ✅ Nota inferior */}
        <Text style={styles.tip}>Consejo: Guarda tu ID para futuras consultas.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFD600", // 🎨 Fondo amarillo correcto
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "white", // 🧱 Cuadro blanco
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: "center",
  },
  iconWrapper: {
    marginBottom: 16,
  },
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
  orderLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
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
  buttonOutline: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  buttonPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: "#2563eb",
  },
  buttonTextGray: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "500",
  },
  buttonTextWhite: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  tip: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 10,
    textAlign: "center",
  },
});
