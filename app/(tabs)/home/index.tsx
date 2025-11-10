import { CategorySkeleton } from "@/components";
import { CarouselBanner } from "@/components/CarouselBanner";
import CategorySection from "@/components/CategoySection";
import { ProductSimilares } from "@/components/ProductSimilares";

import Icono from "@/components/ui/Icon.native";
import Title from "@/components/ui/Title.native";
import useAuth from "@/hooks/useAuth";
import { useAppStore } from "@/store/useAppStore";
import { router, useLocalSearchParams, usePathname } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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

  const { user } = useAuth();

  const { welcome } = useLocalSearchParams();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [showBanner, setShowBanner] = useState(welcome === "1" || welcome === "true");
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 👇 controla si el padre puede scrollear (para no pelear con el horizontal)
  const [parentScroll, setParentScroll] = useState(true);

  useEffect(() => {
    // carga inicial
    loadCategories();
    loadProducts();
  }, []);

  useEffect(() => {
    if (showBanner) {
      bannerTimerRef.current = setTimeout(() => {
        setShowBanner(false);
        router.replace(pathname as any);
      }, 5000);
    }
    return () => {
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    };
  }, [showBanner]);

  // Pull-to-refresh (usa las mismas actions)
  const onRefresh = () => {
    loadCategories();
    loadProducts();
  };

  const refreshing = loadingCategories || loadingProducts;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />

      {showBanner && (
        <View style={[styles.successBanner, { paddingTop: insets.top + 8 }]}>
          <Text style={styles.successText}>Bienvenido a Bisneando</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/bisneando.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {user && (
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push("/notifications")}
          >
            <Icono name="Bell" size={22} color="#27272a" />
          </TouchableOpacity>
        )}
      </View>

      {/* Contenedor con fondo blanco y bordes redondeados */}
      <View
        style={[
          styles.content,
          Platform.OS === "android" && { marginTop: StatusBar.currentHeight },
        ]}
      >
        {/* 👇 FlatList principal (vertical) con pull-to-refresh */}
        <FlatList
          data={[{ key: "header" }]}           // lista dummy de un solo ítem
          keyExtractor={(item) => item.key}
          renderItem={null as any}             // no renderiza filas; usamos solo el header

          // 👇 control fino del scroll del padre (iOS: evita roces con horizontal)
          scrollEnabled={parentScroll}
          directionalLockEnabled
          alwaysBounceVertical

          contentContainerStyle={{ paddingBottom: 24 }}
          refreshing={refreshing}
          onRefresh={onRefresh}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews

          ListHeaderComponent={
            <View>
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
                <CategorySection
                  categories={categories}
                  // 👇 desactiva/activa scroll del padre mientras se usa el carrusel
                  onGestureStart={() => setParentScroll(false)}
                  onGestureEnd={() => setParentScroll(true)}
                />
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
          }
        />
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
    padding: 16, // mantenemos el padding aquí
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
