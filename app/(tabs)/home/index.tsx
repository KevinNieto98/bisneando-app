import { CarouselBanner } from "@/components/CarouselBanner"
import CategorySkeleton from "@/components/CategorySkeleton"
import CategorySection from "@/components/CategoySection"
import { ProductSimilares } from "@/components/ProductSimilares"
import Icono from "@/components/ui/Icon.native"
import Title from "@/components/ui/Title.native"
import { fetchCategorias, fetchProductosDestacados } from "@/services/api"
import React, { useEffect, useState } from "react"
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from "react-native"

export default function HomeScreen() {
  const [categories, setCategories] = useState<any[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  const [products, setProducts] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  // 🚀 Cargar categorías
  useEffect(() => {
    fetchCategorias().then((data) => {
      const mapped = data.map((cat: any) => ({
        title: cat.nombre_categoria,
        icon: cat.icono || "Tag",
        slug: `cat-${cat.id_categoria}`,
      }))
      setCategories(mapped)
      setLoadingCategories(false)
    })
  }, [])

  // 🚀 Cargar productos destacados
  useEffect(() => {
    fetchProductosDestacados().then((data) => {
      const mapped = data.map((prod: any) => ({
        slug: prod.slug,
        title: prod.nombre_producto,
        price: prod.precio,
        images: prod.imagenes.map((img: any) => img.url_imagen),
        brand: prod.id_marca ? `Marca ${prod.id_marca}` : undefined, // opcional
      }))
      setProducts(mapped)
      console.log(products);
      
      setLoadingProducts(false)
    })
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ marginBottom: 24, paddingHorizontal: 16 }}>
        <CarouselBanner />

        {/* Categorías */}
        <Title icon={<Icono name="Tags" size={20} color="#52525b" />} title="Categorías" />
        {loadingCategories ? (
          <CategorySkeleton />
        ) : (
          <CategorySection categories={categories} />
        )}

        {/* Productos Destacados */}
        <Title icon={<Icono name="Star" size={20} color="#52525b" />} title="Productos Destacados" />
        {loadingProducts ? (
          <ActivityIndicator size="large" color="#000" />
        ) : (
          <ProductSimilares products={products} />
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  roundedWrap: {
    marginHorizontal: 10,
    borderRadius: 45,
    overflow: "hidden",
    backgroundColor: "white",
  },
})
