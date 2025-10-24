import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function AddressSuccessBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <View style={styles.successBanner}>
      <Ionicons name="checkmark-circle" size={18} color="#fff" />
      <Text style={styles.successText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  successBanner: {
    position: "absolute",
    top: 10,
    left: 16,
    right: 16,
    zIndex: 50,
    backgroundColor: "#22c55e",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  successText: { color: "#fff", fontWeight: "700" },
});
