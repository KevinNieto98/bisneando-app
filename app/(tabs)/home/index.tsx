import { CarouselBanner } from "@/components/CarouselBanner";
import CategorySkeleton from "@/components/CategorySkeleton";
import CategorySection from "@/components/CategoySection";
import { ProductSimilares } from "@/components/ProductSimilares";
import Icono from "@/components/ui/Icon.native";
import Title from "@/components/ui/Title.native";
import { useAppStore } from "@/store/useAppStore";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const {
    categories,
    loadingCategories,
    products,
    loadingProducts,
    loadCategories,
    loadProducts,
  } = useAppStore();

  useEffect(() => {
    loadCategories();
    loadProducts();
    console.log('products', products);
    
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Notch amarillo */}
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        {/* Logo */}
        <Image
          source={require("@/assets/images/bisneando.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Botón notificación */}
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => console.log("Notificaciones")}
        >
          <Icono name="Bell" size={22} color="#27272a" />
        </TouchableOpacity>
      </View>

      {/* Contenido */}
      <View
        style={[
          styles.content,
          Platform.OS === "android" && { marginTop: StatusBar.currentHeight },
        ]}
      >
        {/* Banner */}
        <CarouselBanner />

        {/* Categorías */}
        <Title
          icon={<Icono name="Tags" size={20} color="#52525b" />}
          title="Categorías"
        />
        {loadingCategories ? (
          <CategorySkeleton />
        ) : (
          <CategorySection categories={categories} />
        )}

        {/* Productos Destacados */}
        <Title
          icon={<Icono name="Star" size={20} color="#52525b" />}
          title="Productos Destacados"
          style={{ marginTop: 16 }}
        />
        {loadingProducts ? (
          <ActivityIndicator size="large" color="#000" />
        ) : (
          <ProductSimilares products={products} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFD600", // fondo notch y header
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // 👈 logo a la izq, botón a la der
    backgroundColor: "#FFD600",
    paddingHorizontal: 16,
  ...Platform.select({
    ios: { paddingVertical: 8 },      // un poco de respiro en iOS
    android: { height: 42, paddingTop:28 }, // 👈 altura fija compacta
  }),
  },
  logo: {
    aspectRatio: 3,
    resizeMode: "contain",

    ...Platform.select({
      ios: {
        width: 160, // ajusta al tamaño que necesites
        height: 40,
      },
      android: {
        width: 180, // ajusta al tamaño que necesites
        height: 40,
      }, // 👈 menos espacio en Android
    }),
  },
  notificationButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.6)", // 👈 fondo suave opcional
  },
  content: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
});
