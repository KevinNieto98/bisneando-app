import { CategorySkeleton } from "@/components";
import { CarouselBanner } from "@/components/CarouselBanner";
import CategorySection from "@/components/CategoySection";
import { ProductSimilares } from "@/components/ProductSimilares";

import { CartButton } from "@/components/ui/CartButttom";
import Icono from "@/components/ui/Icon.native";
import { InternetError } from "@/components/ui/InternetError";
import { ProductSkeleton } from "@/components/ui/ProductSkeleton";
import Title from "@/components/ui/Title.native";
import useAuth from "@/hooks/useAuth";
import { useAppStore } from "@/store/useAppStore";
import { useCartStore } from "@/store/useCartStore";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

// =========================================================================
// Mock de la barra de búsqueda (al presionar navega a /explore)
// =========================================================================
const SearchInputMock = () => {
  const handlePress = () => {
    router.push("/explore");
  };

  return (
    <TouchableOpacity 
      style={mockStyles.searchContainer} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Icono name="Search" size={18} color="#71717a" />
      <Text style={mockStyles.searchText}>Buscar productos...</Text>
    </TouchableOpacity>
  );
};

const mockStyles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 15,
    marginHorizontal: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4
  },
  searchText: {
    marginLeft: 8,
    color: '#71717a',
    fontSize: 15,
  },
});
// =========================================================================


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
  const totalItems = useCartStore((s) => s.totalItems());

  const insets = useSafeAreaInsets();
  const [showBanner, setShowBanner] = useState(false);
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // estado para errores de red
  const [networkError, setNetworkError] = useState(false);
  const [networkErrorMessage, setNetworkErrorMessage] = useState(
    "No pudimos cargar la información. Revisa tu conexión a internet."
  );

  // estado de refresco (pull-to-refresh)
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const loadInitial = async () => {
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

    loadInitial();
  }, []);

  // Opcional: puedes activar el banner manualmente más adelante si quieres
  useEffect(() => {
    if (!showBanner) return;
    bannerTimerRef.current = setTimeout(() => {
      setShowBanner(false);
    }, 5000);
    return () => {
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    };
  }, [showBanner]);

  // Pull-to-refresh sobre ScrollView
  const onRefresh = async () => {
    setRefreshing(true);
    setNetworkError(false);
    try {
      await Promise.all([loadCategories(), loadProducts()]);
    } catch (error: any) {
      if (error?.isNetworkError) {
        setNetworkError(true);
        if (error?.message) setNetworkErrorMessage(error.message);
      }
    } finally {
      setRefreshing(false);
    }
  };

  // si no hay datos y ya no está cargando, asumimos problema de red
  const noDataLoaded =
    !loadingCategories &&
    !loadingProducts &&
    categories.length === 0 &&
    products.length === 0;

  const showInternetError = networkError || noDataLoaded;

  // solo productos con stock > 0
  const productsInStock = products.filter((p: any) => (p.qty ?? 0) > 0);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/bisneando.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Agrupar Notificaciones y Carrito */}
        <View style={styles.rightHeaderIcons}>
          {user && (
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => router.push("/notifications")}
            >
              <Icono name="Bell" size={22} color="#27272a" />
            </TouchableOpacity>
          )}

          <CartButton count={totalItems} />
        </View>
      </View>
      
      {/* MOCK DE SEARCH INPUT */}
      <SearchInputMock />

      {/* Contenedor con fondo blanco y bordes redondeados */}
      <View
        style={[
          styles.content,
          Platform.OS === "android" && { marginTop: StatusBar.currentHeight },
        ]}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="always" 
          keyboardDismissMode="on-drag"
          scrollEnabled={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Banner inline */}
          {showBanner && (
            <View
              style={[
                styles.inlineBanner,
                { marginTop: insets.top > 0 ? 4 : 0 },
              ]}
            >
              <Text style={styles.inlineBannerText}>
                Bienvenido a Bisneando
              </Text>
            </View>
          )}

          {showInternetError ? (
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
                <TouchableOpacity 
                    activeOpacity={1} 
                    onPress={() => {}} 
                    style={{ flex: 1 }} 
                    disabled={false}
                >
                    <CategorySection categories={categories} />
                </TouchableOpacity>
              )}

              {/* Productos Destacados */}
              <Title
                icon={<Icono name="Star" size={20} color="#52525b" />}
                title="Productos Destacados"
                style={{ marginTop: 16 }}
              />
              {loadingProducts ? (
                // *** USO DEL SKELETON EN VEZ DEL SPINNER ***
                <ProductSkeleton count={3} />
              ) : (
                <ProductSimilares products={productsInStock} />
              )}
            </View>
          )}
        </ScrollView>
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
  rightHeaderIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  inlineBanner: {
    backgroundColor: "#16a34a",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 12,
  },
  inlineBannerText: {
    color: "white",
    fontWeight: "800",
    textAlign: "center",
  },
});