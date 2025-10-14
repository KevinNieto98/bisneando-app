import { CategorySkeleton } from "@/components";
import { CarouselBanner } from "@/components/CarouselBanner";
import CategorySection from "@/components/CategoySection";
import { ProductSimilares } from "@/components/ProductSimilares";

import Icono from "@/components/ui/Icon.native";
import Title from "@/components/ui/Title.native";
import useAuth from "@/hooks/useAuth"; // 👈 importamos el hook
import { useAppStore } from "@/store/useAppStore";
import { router, useLocalSearchParams, usePathname } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const {
    categories,
    loadingCategories,
    products,
    loadingProducts,
    loadCategories,
    loadProducts,
  } = useAppStore();

  const { user } = useAuth(); // 👈 obtenemos el usuario actual

  // 👇 Banner "Bienvenido a Bisneando" (cuando venimos de registro)
  const { welcome } = useLocalSearchParams();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [showBanner, setShowBanner] = useState(welcome === "1" || welcome === "true");
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  useEffect(() => {
    if (showBanner) {
      // ocultar en 5s y limpiar el query param
      bannerTimerRef.current = setTimeout(() => {
        setShowBanner(false);
        router.replace(pathname as any); // quita ?welcome=1 para que no reaparezca
      }, 5000);
    }
    return () => {
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    };
  }, [showBanner]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Notch amarillo */}
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />

      {/* Banner de bienvenida (overlay superior) */}
      {showBanner && (
        <View style={[styles.successBanner, { paddingTop: insets.top + 8 }]}>
          <Text style={styles.successText}>Bienvenido a Bisneando</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        {/* Logo */}
        <Image
          source={require("@/assets/images/bisneando.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* 👇 Botón notificación solo si está logueado */}
        {user && (
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push("/notifications")}
          >
            <Icono name="Bell" size={22} color="#27272a" />
          </TouchableOpacity>
        )}
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
    backgroundColor: "#FFD600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFD600",
    paddingHorizontal: 16,
    ...Platform.select({
      ios: { paddingVertical: 8 },
      android: { height: 42, paddingTop: 28 },
    }),
  },
  logo: {
    aspectRatio: 3,
    resizeMode: "contain",
    ...Platform.select({
      ios: { width: 160, height: 40 },
      android: { width: 180, height: 40 },
    }),
  },
  notificationButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  content: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  successBanner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#16a34a",
    zIndex: 20,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  successText: {
    color: "white",
    fontWeight: "800",
    textAlign: "center",
  },
});
