import { CarouselBanner } from "@/components/CarouselBanner";
import Icono from "@/components/ui/Icon.native";
import Title from "@/components/ui/Title.native";
import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={{ marginBottom: 24, paddingHorizontal: 16 }}>
        <CarouselBanner />
        <Title icon={<Icono name="Tags" size={20} color="#52525b" />} title="Categorías" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  // ⬇️ Aquí aplicas las esquinas redondeadas y el recorte
  roundedWrap: {
    marginHorizontal: 10,
    borderRadius: 45,      // el radio que quieras
    overflow: "hidden",    // CLAVE: recorta el contenido
    backgroundColor: "white",
  },
});
