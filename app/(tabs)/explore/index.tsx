import { Platform, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CartScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View
        style={[
          styles.container,
          Platform.OS === "android" && { marginTop: StatusBar.currentHeight },
        ]}
      >
        <Text style={styles.text}>Hola Explore</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    marginHorizontal: 16,
  },
  text: {
    fontSize: 20, // equivalente a text-xl
    fontWeight: "bold",
    color: "#2563eb", // azul estilo tailwind text-blue-600
  },
  roundedWrap: {
    marginHorizontal: 10,
    borderRadius: 45,
    overflow: "hidden",
    backgroundColor: "white",
  },
});
