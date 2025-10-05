import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";

export function PlaceOrderButton({ disabled }: { disabled: boolean }) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && { opacity: 0.5 }]}
      disabled={disabled}
      onPress={() => Alert.alert("Orden realizada", "Tu pedido fue procesado ✅")}
    >
      <Text style={styles.text}>Colocar orden</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { backgroundColor: "#2563eb", padding: 16, borderRadius: 12, alignItems: "center", marginBottom: 30 },
  text: { color: "white", fontWeight: "700", fontSize: 16 },
});
