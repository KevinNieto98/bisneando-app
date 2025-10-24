import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  onBack: () => void;
  onAdd: () => void;
};

export default function AddressHeader({ onBack, onAdd }: Props) {
  return (
    <View style={styles.header}>


      <View style={styles.topRow}>
        <Text style={styles.headerTitle}>Mis direcciones</Text>
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
          <Ionicons name="add-outline" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Agregar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // 👇 sin fondo amarillo
  header: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
  backButton: { marginRight: 8, padding: 6, borderRadius: 20, alignSelf: "flex-start" },
  topRow: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1e293b" },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#facc15", // botón sigue amarillo; lo cambio si quieres
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  addButtonText: { color: "#fff", fontWeight: "700", marginLeft: 4, fontSize: 14 },
});
