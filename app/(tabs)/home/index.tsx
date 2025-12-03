import { CategorySkeleton } from "@/components";
import { CarouselBanner, Portada } from "@/components/CarouselBanner";
import CategorySection from "@/components/CategoySection";
import { ProductSimilares } from "@/components/ProductSimilares";

import { CartButton } from "@/components/ui/CartButttom";
import Icono from "@/components/ui/Icon.native";
import { InternetError } from "@/components/ui/InternetError";
import { ProductSkeleton } from "@/components/ui/ProductSkeleton";
import Title from "@/components/ui/Title.native";
import useAuth from "@/hooks/useAuth";
import { fetchActivePortadas } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { useCartStore } from "@/store/useCartStore";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
// Mock de la barra de búsqueda
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 15,
    marginHorizontal: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  searchText: {
    marginLeft: 8,
    color: "#71717a",
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

  // Estados
  const [refreshing, setRefreshing] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [networkErrorMessage, setNetworkErrorMessage] = useState(
    "No pudimos cargar la información. Revisa tu conexión a internet."
  );

  // Portadas
  const [portadas, setPortadas] = useState<Portada[]>([]);
  const [loadingPortadas, setLoadingPortadas] = useState(true);

  const loadPortadasFromApi = async () => {
    setLoadingPortadas(true);
    try {
      const rawData = await fetchActivePortadas();
      console.log("Portadas crudas desde API:", rawData);

      // 👇 MAPEAMOS USANDO LOS CAMPOS REALES: id_portada, link, is_active, etc.
      const mapped: Portada[] = (rawData ?? []).map((p: any) => ({
        id_portada: p.id_portada,
        url_imagen: p.url_imagen,
        link_destino: p.link ?? null,
        activo: p.is_active,
        metadatos: {
          fecha_creacion: p.fecha_creacion,
          fecha_modificacion: p.fecha_modificacion,
          usuario_crea: p.usuario_crea,
          usuario_modificacion: p.usuario_modificacion,
        },
      }));

      setPortadas(mapped);

      if (mapped.length > 0) {
        console.log("Ejemplo portada mapeada:", mapped[0]);
      }
    } catch (err) {
      console.error("Error cargando portadas:", err);
      setPortadas([]);
    } finally {
      setLoadingPortadas(false);
    }
  };

  // Cargar todo al inicio
  useEffect(() => {
    const loadInitial = async () => {
      setNetworkError(false);
      try {
        await Promise.all([
          loadCategories(),
          loadProducts(),
          loadPortadasFromApi(),
        ]);
      } catch (error: any) {
        if (error?.isNetworkError) {
          setNetworkError(true);
          if (error?.message) setNetworkErrorMessage(error.message);
        }
      }
    };

    loadInitial();
  }, []);

  // Pull To Refresh
  const onRefresh = async () => {
    setRefreshing(true);
    setNetworkError(false);
    try {
      await Promise.all([
        loadCategories(),
        loadProducts(),
        loadPortadasFromApi(),
      ]);
    } catch (error: any) {
      if (error?.isNetworkError) {
        setNetworkError(true);
        if (error?.message) setNetworkErrorMessage(error.message);
      }
    } finally {
      setRefreshing(false);
    }
  };

  const noDataLoaded =
    !loadingCategories &&
    !loadingProducts &&
    !loadingPortadas &&
    categories.length === 0 &&
    products.length === 0 &&
    portadas.length === 0;

  const showInternetError = networkError || noDataLoaded;

  const productsInStock = products.filter((p: any) => (p.qty ?? 0) > 0);

  // Navegación cuando se presiona una portada
  const handlePressPortada = (portada: Portada) => {
    console.log("Portada clickeada:", portada.id_portada);
    console.log("Navegando hacia:", portada.link_destino);

    if (!portada.link_destino) return;

    router.push(portada.link_destino as any);
  };

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

      {/* Search */}
      <SearchInputMock />

      {/* Banner / Portadas */}
      <CarouselBanner
        portadas={portadas}
        loading={loadingPortadas}
        onPressPortada={handlePressPortada}
      />

      {/* Contenido */}
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
          {showInternetError ? (
            <InternetError
              message={networkErrorMessage}
              onRetry={onRefresh}
            />
          ) : (
            <View>
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
                <ProductSkeleton count={3} />
              ) : (
                <ProductSimilares products={productsInStock}  />
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// ============================================================

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
    flexDirection: "row",
    alignItems: "center",
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
});
