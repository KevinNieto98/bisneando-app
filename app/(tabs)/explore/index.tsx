import { ExploreSkeleton } from "@/components";
import { CategoriesContainer } from "@/components/CategoriesContainer";
import { ProductGrid } from "@/components/ProductGrid";
import { Search } from "@/components/ui/Search";
import { useAppStore } from "@/store/useAppStore";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Platform, StatusBar, StyleSheet, View } from "react-native";
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

  // 🚩 lee el parámetro ?categoryId=123
  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();

  const [selectedCat, setSelectedCat] = useState<Selected>("all");

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

  const loading = loadingCategories || loadingProducts;

  // Filtra productos según la categoría seleccionada
  const filteredProducts = useMemo(() => {
    if (selectedCat === "all") return products;
    return products.filter((p) => getProductCategoryId(p) === selectedCat);
  }, [products, selectedCat]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />
      <Search products={filteredProducts} onSelect={() => {}} />

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
              selectedId={selectedCat}       // ✅ marca la píldora seleccionada
              onSelect={(id) => setSelectedCat(id)}
            />
            <ProductGrid products={filteredProducts} />
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
  },
});
