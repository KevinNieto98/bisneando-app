import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export function PaymentMethodSelector({ paymentMethod, setPaymentMethod, cardForm, setCardForm }: any) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Método de pago</Text>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Pressable
          onPress={() => setPaymentMethod("efectivo")}
          style={[
            styles.option,
            paymentMethod === "efectivo" && styles.selected,
          ]}
        >
          <Ionicons name="wallet-outline" size={20} color="black" />
          <Text style={styles.text}>Efectivo</Text>
        </Pressable>
        <Pressable
          onPress={() => setPaymentMethod("tarjeta")}
          style={[
            styles.option,
            paymentMethod === "tarjeta" && styles.selected,
          ]}
        >
          <Ionicons name="card-outline" size={20} color="black" />
          <Text style={styles.text}>Tarjeta</Text>
        </Pressable>
      </View>

      {paymentMethod === "tarjeta" && (
        <View style={{ marginTop: 16 }}>
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
          <View style={{ flexDirection: "row", gap: 10 }}>
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
  section: { backgroundColor: "white", borderRadius: 12,
        marginHorizontal: 8,
    padding: 16, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  option: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  selected: { borderColor: "black", backgroundColor: "#f3f4f6" },
  text: { fontWeight: "500" },
  input: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8, padding: 10, marginBottom: 10, fontSize: 14 },
});
