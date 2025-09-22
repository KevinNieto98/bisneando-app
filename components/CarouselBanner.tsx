import React, { useState } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { SwiperFlatList } from "react-native-swiper-flatlist";

const { width } = Dimensions.get("window");

const HEIGHT = (() => {
  if (width >= 1024) return 400; // lg
  if (width >= 768) return 300;  // md
  return 180;                    // base
})();

const images = [
  { src: require("../assets/images/portadas/1.png"), title: "Banner 1" },
  { src: require("../assets/images/portadas/2.png"), title: "Banner 2" },
  { src: require("../assets/images/portadas/3.png"), title: "Banner 3" },
];

export const CarouselBanner = () => {
  const [index, setIndex] = useState(0);

  return (
    <View style={styles.container}>
      {/* Carrusel con esquinas redondeadas */}
      <View style={[styles.carouselWrapper, { height: HEIGHT }]}>
        <SwiperFlatList
          autoplay
          autoplayDelay={2}
          autoplayLoop
          autoplayLoopKeepAnimation
          index={0}
          data={images}
          onChangeIndex={({ index: i }) => setIndex(i)}
          renderItem={({ item }) => (
            <View style={[styles.slide, { height: HEIGHT }]}>
              <Image
                source={item.src}
                accessibilityLabel={item.title}
                style={styles.image}
                resizeMode="cover" // 👈 usa cover para llenar y respetar borderRadius
              />
            </View>
          )}
          keyExtractor={(_, i) => `banner-${i}`}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "99%",

  },
  carouselWrapper: {
    width: "100%",
    maxWidth: 1150,
    alignSelf: "center",
    borderRadius: 12,     // 👈 redondeo
    overflow: "hidden",   // 👈 obliga a las imágenes a respetar bordes
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
});
