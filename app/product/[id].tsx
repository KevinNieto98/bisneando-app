import { ProductSkeleton } from "@/components";
import { ProductActions } from "@/components/product/ProductActions";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { ProductDescription } from "@/components/product/ProductDescription";
import { ProductGridSimilares } from "@/components/product/ProductGridSimilares";
import { ProductHeader } from "@/components/product/ProductHeader";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductPriceBox } from "@/components/product/ProductPriceBox";
import SuccessToast from "@/components/ui/SuccessToast";
import { fetchProductoById } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { useCartStore } from "@/store/useCartStore";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [producto, setProducto] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // cantidad con clamp por stock
  const [cantidad, _setCantidad] = useState(1);
  const products = useAppStore((state) => state.products);

  // Toast "agregado"
  const [addedVisible, setAddedVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addToCart = useCartStore((s) => s.add);

  const triggerAddedToast = (msg = "Agregado al carrito") => {
    try { Haptics.selectionAsync(); } catch {}
    setAddedVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setAddedVisible(false), 1400);
  };

  const setCantidad = (next: number) => {
    const stock = Number(producto?.qty ?? 0);
    const clamped = Math.max(1, Math.min(stock || 1, next));
    _setCantidad(clamped);
  };

  useEffect(() => {
    if (!id) return;
    const loadProduct = async () => {
      try {
        const data = await fetchProductoById(Number(id));
        setProducto(data);
        const stock = Number(data?.qty ?? 0);
        _setCantidad((prev) => (stock > 0 ? Math.min(prev, stock) : 1));
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [id]);

  if (loading) return <ProductSkeleton />;

  if (!producto) {
    return (
      <View style={styles.centered}>
        <Text>No se encontró el producto</Text>
      </View>
    );
  }

  const stock = Number(producto.qty ?? 0);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />
      <ProductHeader />

      {/* Toast flotante */}
      <SuccessToast visible={addedVisible} text="Agregado al carrito" autoHide autoHideMs={1400} onHide={() => setAddedVisible(false)} />

      {/* Contenido */}
      <FlatList
        data={[]}
        keyExtractor={() => "dummy"}
        renderItem={null}
        ListHeaderComponent={
          <View style={styles.content}>
            <ProductCarousel imagenes={producto.imagenes} />

            <ProductInfo
              marca={producto.nombre_marca?.toUpperCase?.() || ""}
              nombre={producto.nombre_producto}
            />

            <ProductActions
              cantidad={cantidad}
              setCantidad={setCantidad}
              maxQty={stock}
              onWhatsApp={() => {}}
              onShare={() => {}}
            />

            <ProductPriceBox
              precio={producto.precio}
              qty={stock}
              onAdd={() => {
                if (cantidad > stock || stock <= 0) return;

                addToCart(
                  {
                    id: Number(producto.id),
                    slug: producto.slug || String(producto.id),
                    title: producto.nombre_producto,
                    price: Number(producto.precio),
                    image: producto.imagenes?.[0] ?? null,
                    maxQty: stock,
                  },
                  cantidad
                );

                triggerAddedToast();
              }}
              onBuy={() => {
                if (cantidad > stock || stock <= 0) return;
                // TODO: compra directa (ej. navegar a checkout con producto + cantidad)
              }}
            />

            <ProductDescription descripcion={producto.descripcion} />

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
