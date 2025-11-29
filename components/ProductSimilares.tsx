import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  PressableStateCallbackType,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import { ProductSlideItem } from "./ProductSlideItem";
import Icono from "./ui/Icon.native";

export interface Product {
  id: number;
  slug: string;
  title: string;
  price: number;
  images: string[];
  brand?: string;
}

interface Props {
  products: Product[];
  itemWidth?: number; 
  gap?: number;       
  autoplaySpeed?: number; 
  resumeDelayMs?: number; 
}

export const ProductSimilares: React.FC<Props> = ({
  // *** CAMBIO 1: Reducir el valor por defecto de gap de 8 a 4 ***
  products,
  itemWidth = 140, // Asumiendo el valor ajustado anteriormente (antes 180)
  gap = 4,         // *** REDUCIDO: Menos separación entre productos ***
  autoplaySpeed = 0.6,
  resumeDelayMs = 2000,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const containerWidthRef = useRef(0);
  const [paused, setPaused] = useState(false);

  // Duplicamos para loop infinito
  const data = useMemo(() => [...products, ...products], [products]);

  // Medimos contenido para saber cuándo “reiniciar”
  const contentWidthRef = useRef(0);
  const halfWidthRef = useRef(0);
  const scrollXRef = useRef(0);

  // Control del autoplay con RAF
  const rafIdRef = useRef<number | null>(null);

  const startAutoplay = () => {
    if (rafIdRef.current != null) return;

    const loop = () => {
      if (!paused && scrollRef.current) {
        const nextX = scrollXRef.current + autoplaySpeed;

        if (nextX >= halfWidthRef.current) {
          scrollRef.current.scrollTo({ x: 0, animated: false });
          scrollXRef.current = 0;
        } else {
          scrollRef.current.scrollTo({ x: nextX, animated: false });
          scrollXRef.current = nextX;
        }
      }
      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);
  };

  const stopAutoplay = () => {
    if (rafIdRef.current != null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  };

  useEffect(() => {
    startAutoplay();
    return () => {
      stopAutoplay();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, autoplaySpeed, products]);

  const resumeLater = () => {
    setPaused(true);
    setTimeout(() => setPaused(false), resumeDelayMs);
  };

  const handlePrev = () => {
    if (!scrollRef.current) return;
    setPaused(true);
    // Usamos itemWidth + gap para el salto exacto
    const delta = itemWidth + gap; 
    const target = Math.max(scrollXRef.current - delta, 0);
    scrollRef.current.scrollTo({ x: target, animated: true });
    scrollXRef.current = target;
    resumeLater();
  };

  const handleNext = () => {
    if (!scrollRef.current) return;
    setPaused(true);
    // Usamos itemWidth + gap para el salto exacto
    const delta = itemWidth + gap;
    let target = scrollXRef.current + delta;

    if (target >= halfWidthRef.current) target = 0;
    scrollRef.current.scrollTo({ x: target, animated: true });
    scrollXRef.current = target;
    resumeLater();
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollXRef.current = e.nativeEvent.contentOffset.x;
  };

  const onContentSizeChange = (w: number) => {
    contentWidthRef.current = w;
    halfWidthRef.current = w / 2;
  };

  const onLayout = (e: LayoutChangeEvent) => {
    containerWidthRef.current = e.nativeEvent.layout.width;
  };

  return (
    <View style={styles.root} onLayout={onLayout}>
      
      {/* Botón Anterior */}
      <Pressable
        onPressIn={handlePrev} 
        style={({ pressed }: PressableStateCallbackType) => [
          styles.arrow,
          styles.leftArrow,
          { 
            zIndex: 11,
            transform: [{ scale: pressed ? 0.95 : 1 }] 
          }
        ]}
        accessibilityRole="button"
        accessibilityLabel="Anterior"
      >
        <Icono name="ChevronLeft" size={22} color="#27272a" />
      </Pressable>

      {/* Carrusel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
        onContentSizeChange={(w) => onContentSizeChange(w)}
        keyboardShouldPersistTaps="always"
        onScrollBeginDrag={() => setPaused(true)}
        onScrollEndDrag={resumeLater}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={resumeLater}
        // Usamos columnGap que recibe el valor de la prop 'gap' (ahora 4 por defecto)
        contentContainerStyle={[styles.track, { columnGap: gap, paddingHorizontal: 8 }]} 
      >
        {data.map((product, index) => (
          <View
            key={`${product.slug}-${index}`}
            style={{ width: itemWidth }}
          >
            <ProductSlideItem product={product} />
          </View>
        ))}
      </ScrollView>

      {/* Botón Siguiente */}
      <Pressable
        onPressIn={handleNext} 
        style={({ pressed }: PressableStateCallbackType) => [
          styles.arrow,
          styles.rightArrow,
          { 
            zIndex: 11,
            transform: [{ scale: pressed ? 0.95 : 1 }] 
          }
        ]}
        accessibilityRole="button"
        accessibilityLabel="Siguiente"
      >
        <Icono name="ChevronRight" size={22} color="#27272a" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    position: "relative",
  },
  track: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingVertical: 4,
  },
  arrow: {
    position: "absolute",
    top: "42%",
    zIndex: 10, 
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 999,
    padding: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  leftArrow: {
    left: 4,
  },
  rightArrow: {
    right: 4,
  },
});