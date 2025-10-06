import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Icono from "../ui/Icon.native";

export function PaymentMethodSelector({
  paymentMethod,
  setPaymentMethod,
  cardForm,
  setCardForm,
}: any) {
  return (
    <View style={styles.section}>
      {/* Header */}
      <Text style={styles.title}>Método de pago</Text>

      {/* Opciones */}
      <View style={styles.optionsRow}>
        <Pressable
          onPress={() => setPaymentMethod("efectivo")}
          style={({ pressed }) => [
            styles.option,
            paymentMethod === "efectivo" && styles.selected,
            pressed && { transform: [{ scale: 0.97 }] },
          ]}
        >
          <View
            style={[
              styles.iconContainer,
              paymentMethod === "efectivo" && styles.iconContainerSelected,
            ]}
          >
            <Icono
              name="Wallet"
              size={18}
              color={paymentMethod === "efectivo" ? "#fff" : "#2563eb"}
            />
          </View>
          <Text
            style={[
              styles.text,
              paymentMethod === "efectivo" && styles.textSelected,
            ]}
          >
            Efectivo
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setPaymentMethod("tarjeta")}
          style={({ pressed }) => [
            styles.option,
            paymentMethod === "tarjeta" && styles.selected,
            pressed && { transform: [{ scale: 0.97 }] },
          ]}
        >
          <View
            style={[
              styles.iconContainer,
              paymentMethod === "tarjeta" && styles.iconContainerSelected,
            ]}
          >
            <Icono
              name="CreditCard"
              size={18}
              color={paymentMethod === "tarjeta" ? "#fff" : "#2563eb"}
            />
          </View>
          <Text
            style={[
              styles.text,
              paymentMethod === "tarjeta" && styles.textSelected,
            ]}
          >
            Tarjeta
          </Text>
        </Pressable>
      </View>

      {/* Formulario de tarjeta */}
      {paymentMethod === "tarjeta" && (
        <View style={styles.cardForm}>
          <TextInput
            style={styles.input}
            placeholder="Titular de la tarjeta"
            value={cardForm.holder}
            onChangeText={(t) => setCardForm((f: any) => ({ ...f, holder: t }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Número de tarjeta"
            keyboardType="numeric"
            value={cardForm.number}
            onChangeText={(t) => setCardForm((f: any) => ({ ...f, number: t }))}
          />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="MM/AA"
              keyboardType="numeric"
              value={cardForm.expiry}
              onChangeText={(t) => setCardForm((f: any) => ({ ...f, expiry: t }))}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="CVV"
              keyboardType="numeric"
              value={cardForm.cvv}
              onChangeText={(t) => setCardForm((f: any) => ({ ...f, cvv: t }))}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  option: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: "#f9fafb",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    flexDirection: "row",
    gap: 8,
  },
  selected: {
    borderColor: "#2563eb",
    backgroundColor: "#f0f9ff",
    shadowColor: "#2563eb",
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#e0e7ff",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainerSelected: {
    backgroundColor: "#2563eb",
  },
  text: {
    fontWeight: "600",
    fontSize: 14,
    color: "#374151",
  },
  textSelected: {
    color: "#2563eb",
  },
  cardForm: {
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
});
