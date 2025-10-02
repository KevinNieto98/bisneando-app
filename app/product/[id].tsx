import { ProductActions } from "@/components/product/ProductActions";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { ProductDescription } from "@/components/product/ProductDescription";
import { ProductGridSimilares } from "@/components/product/ProductGridSimilares";
import { ProductHeader } from "@/components/product/ProductHeader";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductPriceBox } from "@/components/product/ProductPriceBox";
import { fetchProductoById } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [producto, setProducto] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [cantidad, setCantidad] = useState(1);

  const products = useAppStore((state) => state.products);

  useEffect(() => {
    if (!id) return;
    const loadProduct = async () => {
      const data = await fetchProductoById(Number(id));
      setProducto(data);
      setLoading(false);
    };
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text>Cargando producto...</Text>
      </View>
    );
  }

  if (!producto) {
    return (
      <View style={styles.centered}>
        <Text>No se encontró el producto</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />
      <ProductHeader />

      {/* ✅ FlatList como contenedor */}
      <FlatList
        data={[]} // no necesitamos data, usamos solo el header
        keyExtractor={() => "dummy"}
        renderItem={null}
        ListHeaderComponent={
          <View style={styles.content}>
            <ProductCarousel imagenes={producto.imagenes} />
            <ProductInfo marca={producto.marca} nombre={producto.nombre_producto} />
            <ProductActions
              cantidad={cantidad}
              setCantidad={setCantidad}
              onWhatsApp={() => {}}
              onShare={() => {}}
            />
            <ProductPriceBox
              precio={producto.precio}
              qty={producto.qty}
              onAdd={() => {}}
              onBuy={() => {}}
            />
            <ProductDescription descripcion={producto.descripcion} />

            {/* Similares */}
            {products && products.length > 0 && (
              <View style={{ marginTop: 20 }}>
                <Text style={styles.similaresTitle}>Productos Similares</Text>
                <ProductGridSimilares products={products} />
              </View>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFD600" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  similaresTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
    color: "#111",
  },
});
