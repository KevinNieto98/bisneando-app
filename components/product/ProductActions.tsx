import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function ProductActions({ cantidad, setCantidad, onWhatsApp, onShare }: any) {
  return (
    <View style={styles.counterRow}>
      {/* WhatsApp */}
      <TouchableOpacity style={[styles.wideButton, styles.whatsappButton]} onPress={onWhatsApp}>
        <Ionicons name="logo-whatsapp" size={20} color="#fff" />
      </TouchableOpacity>

      {/* Compartir */}
      <TouchableOpacity style={[styles.wideButton, styles.shareButton]} onPress={onShare}>
        <Ionicons name="share-social" size={20} color="#2563eb" />
      </TouchableOpacity>

      {/* Counter */}
      <View style={styles.counterContainer}>
        <TouchableOpacity
          style={styles.counterButton}
          onPress={() => setCantidad(Math.max(1, cantidad - 1))}
        >
          <Ionicons name="remove" size={18} color="#000" />
        </TouchableOpacity>

        <Text style={styles.counterText}>{cantidad}</Text>

        <TouchableOpacity
          style={styles.counterButton}
          onPress={() => setCantidad(cantidad + 1)}
        >
          <Ionicons name="add" size={18} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 8,
    gap: 12,
  },
  wideButton: {
    flex: 1, // cada botón ocupa 1 parte → 1/4 del total
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  whatsappButton: { backgroundColor: "#25D366" },
  shareButton: { backgroundColor: "#f2f2f2" },
  counterContainer: {
    flex: 2, // el counter ocupa 2 partes → 1/2 del total
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // distribuye botones y número
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  counterText: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    flex: 1, // hace que el número ocupe el centro del espacio
  },
});
