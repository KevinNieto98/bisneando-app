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
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ProductAPI = {
  id_producto: number | string;
  slug?: string;
  nombre_producto: string;
  nombre_marca?: string;
  precio: number | string;
  qty?: number | string;          // stock
  imagenes?: string[];            // urls
  descripcion?: string;
};

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const routeId = id ? Number(id) : undefined;

  const [producto, setProducto] = useState<ProductAPI | null>(null);
  const [loading, setLoading] = useState(true);

  // cantidad con clamp por stock
  const [cantidad, _setCantidad] = useState(1);

  // 🛒 carrito
  const addToCart = useCartStore((s) => s.add);
  const setQtyStore = useCartStore((s) => s.setQty);
  const itemsMap = useCartStore((s) => s.items);
  const totalItems = useCartStore((s) => s.totalItems());
  // 👉 línea del carrito para este producto (si ya fue agregado)
  const cartLine = useCartStore((s) =>
    routeId != null ? s.items[String(routeId)] : undefined
  );

  // Similares (si ya los cargas en AppStore)
  const products = useAppStore((state) => state.products);

  // Toast "agregado"
  const [addedVisible, setAddedVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

        // 🔁 Al cargar, sincroniza cantidad con lo que ya hay en el carrito (si existe)
        const inCartQty = cartLine?.quantity ?? 0;
        const base = inCartQty > 0 ? inCartQty : 1;
        _setCantidad(stock > 0 ? Math.min(base, stock) : 1);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // 🪢 Si cambia la línea del carrito (por ejemplo, desde otra screen), reflejarlo
  useEffect(() => {
    if (!producto) return;
    const stock = Number(producto.qty ?? 0);
    const inCartQty = cartLine?.quantity ?? 0;
    if (inCartQty > 0) {
      _setCantidad(Math.min(inCartQty, stock || inCartQty));
    }
  }, [cartLine?.quantity, producto]);

  if (loading) return <ProductSkeleton />;

  if (!producto) {
    return (
      <View style={styles.centered}>
        <Text>No se encontró el producto</Text>
      </View>
    );
  }

  const stock = Number(producto.qty ?? 0);

  // Helper: mapea el producto del API al formato del carrito
  const mapProductoToCart = (p: ProductAPI) => ({
    id: Number(p.id_producto),
    title: p.nombre_producto,
    price: Number(p.precio),
    images: p.imagenes ?? [],
    inStock: Number(p.qty ?? 0) || undefined,
  });

  const idNum = Number(producto.id_producto);
  const existsInCart = !!itemsMap[String(idNum)];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />
      <ProductHeader totalItems={totalItems} />

      <FlatList
        data={[]}
        keyExtractor={() => "dummy"}
        renderItem={() => null}
        ListHeaderComponent={
          <View style={styles.content}>
            <SuccessToast
              visible={addedVisible}
              text="Agregado al carrito"
              iconName="checkmark-circle-outline"
            />

            <ProductCarousel imagenes={producto.imagenes ?? []} />

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
              precio={Number(producto.precio)}
              qty={stock}
              onAdd={() => {
                if (cantidad > stock || stock <= 0) return;

                // ✅ Si ya existe en carrito, ajusta a la cantidad exacta (no suma)
                if (existsInCart) {
                  setQtyStore(idNum, cantidad);
                } else {
                  addToCart(mapProductoToCart(producto), cantidad);
                }

                triggerAddedToast();
              }}
              onBuy={() => {
                if (cantidad > stock || stock <= 0) return;

                if (existsInCart) {
                  setQtyStore(idNum, cantidad); // exacto
                } else {
                  addToCart(mapProductoToCart(producto), cantidad);
                }

                try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
                router.push("/cart"); // ajusta la ruta si tu archivo vive en otra carpeta
              }}
            />

            <ProductDescription descripcion={producto.descripcion ?? ""} />

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
