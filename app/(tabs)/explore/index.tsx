import { ExploreSkeleton } from "@/components";
import { CategoriesContainer } from "@/components/CategoriesContainer";
import { ProductGrid } from "@/components/ProductGrid";
import type { Product } from "@/components/ProductSlideItem";
import { Search } from "@/components/ui/Search";
import { useAppStore } from "@/store/useAppStore";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Platform, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Selected = number | "all";

// Helper (por si tu producto cambia de nombre de campo)
const getProductCategoryId = (p: any): number | undefined => {
  if (!p || typeof p !== "object") return undefined;
  return (
    (typeof p.id_categoria === "number" ? p.id_categoria : undefined) ??
    (typeof p.categoryId === "number" ? p.categoryId : undefined) ??
    (typeof p.categoria_id === "number" ? p.categoria_id : undefined)
  );
};

export default function ExploreScreen() {
  const {
    categories,
    loadingCategories,
    products,
    loadingProducts,
    loadCategories,
    loadProducts,
  } = useAppStore();

  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();

  const [selectedCat, setSelectedCat] = useState<Selected>("all");

  // 🔎 resultados aplicados al grid después de darle Enter / Search
  const [searchResults, setSearchResults] = useState<Product[] | null>(null);

  // Cargar data
  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  // Inicializa selección desde el parámetro de la ruta
  useEffect(() => {
    if (categoryId != null && categoryId !== "") {
      const idNum = Number(categoryId);
      setSelectedCat(Number.isFinite(idNum) ? idNum : "all");
    } else {
      setSelectedCat("all");
    }
  }, [categoryId]);

  // Si cambio la categoría, reseteo la búsqueda aplicada
  useEffect(() => {
    setSearchResults(null);
  }, [selectedCat]);

  const loading = loadingCategories || loadingProducts;

  // Filtra productos según la categoría seleccionada
  const filteredProducts = useMemo(() => {
    if (selectedCat === "all") return products;
    return products.filter((p) => getProductCategoryId(p) === selectedCat);
  }, [products, selectedCat]);

  // Productos que se muestran en el grid
  const gridProducts = useMemo(() => {
    if (searchResults && searchResults.length > 0) return searchResults;
    if (searchResults && searchResults.length === 0) return []; // búsqueda sin matches pero aplicada
    return filteredProducts;
  }, [filteredProducts, searchResults]);

  const hasActiveSearch = searchResults !== null;
  const noMatches = hasActiveSearch && searchResults?.length === 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />

      {/* 🔍 Busca SOLO dentro de filteredProducts (categoría seleccionada) */}
      <Search
        products={filteredProducts}
        onSelect={() => {}}
        onSubmitSearch={({
          query,
          results,
        }: {
          query: string;
          results: Product[];
        }) => {
          if (!query || query.trim().length < 3) {
            setSearchResults(null); // sin búsqueda aplicada
          } else {
            // results ya viene filtrado por categoría porque Search recibe filteredProducts
            setSearchResults(results);
          }
        }}
      />

      <View
        style={[
          styles.productsContainer,
          Platform.OS === "android" && { marginTop: StatusBar.currentHeight },
        ]}
      >
        {loading ? (
          <ExploreSkeleton />
        ) : (
          <>
            <CategoriesContainer
              categories={categories}
              selectedId={selectedCat}
              onSelect={(id) => setSelectedCat(id)}
            />

            {noMatches ? (
              <View style={styles.noMatchesBox}>
                <Text style={styles.noMatchesText}>
                  No se encontraron coincidencias en esta categoría
                </Text>
              </View>
            ) : (
              <ProductGrid products={gridProducts} />
            )}
          </>
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
  productsContainer: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    marginTop: -8, // reduce el espacio entre el buscador y las categorías
  },
  noMatchesBox: {
    marginTop: 32,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    alignItems: "center",
    justifyContent: "center",
  },
  noMatchesText: {
    fontSize: 15,
    color: "#4b5563",
    textAlign: "center",
    fontWeight: "500",
  },
});
