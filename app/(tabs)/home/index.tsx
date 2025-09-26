import { CarouselBanner } from "@/components/CarouselBanner";
import CategorySkeleton from "@/components/CategorySkeleton";
import CategorySection from "@/components/CategoySection";
import { ProductSimilares } from "@/components/ProductSimilares";
import Icono from "@/components/ui/Icon.native";
import Title from "@/components/ui/Title.native";
import { useAppStore } from "@/store/useAppStore";
import React, { useEffect } from "react";
import { ActivityIndicator, Platform, StatusBar, StyleSheet, View } from "react-native";
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
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={[styles.container, Platform.OS === "android" && { marginTop: StatusBar.currentHeight }]}>
        <View style={{ marginBottom: 24, paddingHorizontal: 16 }}>
          <CarouselBanner />

          {/* Categorías */}
          <Title icon={<Icono name="Tags" size={20} color="#52525b" />} title="Categorías" />
          {loadingCategories ? <CategorySkeleton /> : <CategorySection categories={categories} />}

          {/* Productos Destacados */}
          <Title icon={<Icono name="Star" size={20} color="#52525b" />} title="Productos Destacados" />
          {loadingProducts ? <ActivityIndicator size="large" color="#000" /> : <ProductSimilares products={products} />}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});
