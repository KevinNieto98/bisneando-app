import { CartButton } from "@/components/ui/CartButttom";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

type ProductHeaderProps = {
  showCartButton?: boolean; // opcional, default = true
};

export function ProductHeader({ showCartButton = true }: ProductHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      {showCartButton && <CartButton count={2} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFD600",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 6,
    borderRadius: 20,
  },
});
