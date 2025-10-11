import { fetchActivePortadas } from "@/services/api"
import React, { useEffect, useState } from "react"
import { Dimensions, Image, StyleSheet, View } from "react-native"
import { SwiperFlatList } from "react-native-swiper-flatlist"
import { PortadaSkeleton } from "."

const { width } = Dimensions.get("window")

const HEIGHT = (() => {
  if (width >= 1024) return 400 // lg
  if (width >= 768) return 300  // md
  return 180                    // base
})()

export const CarouselBanner = () => {
  const [index, setIndex] = useState(0)
  const [portadas, setPortadas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivePortadas().then((data) => {

      setPortadas(data)
      
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <View style={[styles.carouselWrapper, { height: HEIGHT, justifyContent: "center", alignItems: "center" }]}>
        <PortadaSkeleton />
      </View>
    )
  }

  if (portadas.length === 0) {
    return (
      <View style={[styles.carouselWrapper, { height: HEIGHT, justifyContent: "center", alignItems: "center" }]}>
        <PortadaSkeleton />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={[styles.carouselWrapper, { height: HEIGHT }]}>
        <SwiperFlatList
          autoplay
          autoplayDelay={2}
          autoplayLoop
          autoplayLoopKeepAnimation
          index={0}
          data={portadas}
          onChangeIndex={({ index: i }) => setIndex(i)}
          renderItem={({ item }) => (
            <View style={[styles.slide, { height: HEIGHT }]}>
              <Image
                source={{ uri: item.url_imagen }}
                accessibilityLabel={`Portada ${item.id_portada}`}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          )}
          keyExtractor={(item) => `banner-${item.id_portada}`}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "99%",
  },
  carouselWrapper: {
    width: "100%",
    maxWidth: 1150,
    alignSelf: "center",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "white",
  },
  slide: {
    width,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
})
