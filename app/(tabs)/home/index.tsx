// app/(tabs)/index.tsx o donde tengas este HomeScreen

import { CategorySkeleton } from "@/components";
import { CarouselBanner } from "@/components/CarouselBanner";
import CategorySection from "@/components/CategoySection";
import { ProductSimilares } from "@/components/ProductSimilares";

import Icono from "@/components/ui/Icon.native";
import { InternetError } from "@/components/ui/InternetError";
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
  const [showBanner, setShowBanner] = useState(
    welcome === "1" || welcome === "true"
  );
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // controla si el padre puede scrollear (para no pelear con el horizontal)
  const [parentScroll, setParentScroll] = useState(true);

  // estado para errores de red (opcional, por si en algún lugar sí propagas el error)
  const [networkError, setNetworkError] = useState(false);
  const [networkErrorMessage, setNetworkErrorMessage] = useState(
    "No pudimos cargar la información. Revisa tu conexión a internet."
  );

  useEffect(() => {
    const loadInitial = async () => {
      setNetworkError(false);
      try {
        await Promise.all([loadCategories(), loadProducts()]);
      } catch (error: any) {
        // Si en algún futuro sí propagas errores desde el store, esto lo capturará
        if (error?.isNetworkError) {
          setNetworkError(true);
          if (error?.message) setNetworkErrorMessage(error.message);
        }
      }
    };

    loadInitial();
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

  // Pull-to-refresh
  const onRefresh = async () => {
    setNetworkError(false);
    try {
      await Promise.all([loadCategories(), loadProducts()]);
    } catch (error: any) {
      if (error?.isNetworkError) {
        setNetworkError(true);
        if (error?.message) setNetworkErrorMessage(error.message);
      }
    }
  };

  const refreshing = loadingCategories || loadingProducts;

  // 🧠 CLAVE: si no hay datos y ya no está cargando, asumimos problema de red
  const noDataLoaded =
    !loadingCategories &&
    !loadingProducts &&
    categories.length === 0 &&
    products.length === 0;

  const showInternetError = networkError || noDataLoaded;

  // 🧮 Filtramos productos con stock > 0
  const productsInStock = products.filter((p: any) => (p.qty ?? 0) > 0);

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
        {/* FlatList principal (vertical) con pull-to-refresh */}
        <FlatList
          data={[{ key: "header" }]} // lista dummy de un solo ítem
          keyExtractor={(item) => item.key}
          renderItem={null as any} // no renderiza filas; usamos solo el header
          scrollEnabled={parentScroll}
          directionalLockEnabled
          alwaysBounceVertical
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshing={refreshing}
          onRefresh={onRefresh}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews
          ListHeaderComponent={
            showInternetError ? (
              // 👉 SOLO se muestra esto cuando no hay datos (y/o networkError)
              <InternetError
                message={networkErrorMessage}
                onRetry={onRefresh}
              />
            ) : (
              <View>
                {/* Banner / portadas */}
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
                    // desactiva/activa scroll del padre mientras se usa el carrusel
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
                  // 👇 SOLO productos con stock
                  <ProductSimilares products={productsInStock} />
                )}
              </View>
            )
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
