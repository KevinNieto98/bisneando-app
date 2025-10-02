import { CategoriesContainer } from "@/components/CategoriesContainer";
import ExploreSkeleton from "@/components/ExploreSkeleton";
import { ProductGrid } from "@/components/ProductGrid";
import { Search } from "@/components/ui/Search";
import { useAppStore } from "@/store/useAppStore";
import { useEffect } from "react";
import { Platform, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExploreScreen() {
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
    
  }, []);

  const loading = loadingCategories || loadingProducts; // ✅ unificar estado

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />
      <Search products={products} onSelect={(product) => {}} />

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
            <CategoriesContainer categories={categories} />
            <ProductGrid products={products} />
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
