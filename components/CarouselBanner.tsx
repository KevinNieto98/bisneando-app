// CarouselBanner.tsx
import React, { useEffect, useMemo, useRef } from "react";
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { PortadaSkeleton } from ".";

const { width: WINDOW_WIDTH } = Dimensions.get("window");

export interface Portada {
  id_portada: number;
  url_imagen: string;
  link_destino: string | null;
  activo?: boolean;
  metadatos?: any;
}

interface Props {
  portadas: Portada[];
  loading?: boolean;
  itemWidth?: number;              // ancho de cada portada
  gap?: number;                    // separación entre portadas
  onPressPortada?: (portada: Portada, index: number) => void;
  autoplay?: boolean;              // activar / desactivar autoplay
  autoplayIntervalMs?: number;     // intervalo entre slides
}

const HEIGHT = (() => {
  if (WINDOW_WIDTH >= 1024) return 400; // lg
  if (WINDOW_WIDTH >= 768) return 300;  // md
  return 180;                           // base
})();

export const CarouselBanner: React.FC<Props> = ({
  portadas,
  loading = false,
  itemWidth = WINDOW_WIDTH,
  gap = 4,
  onPressPortada,
  autoplay = true,
  autoplayIntervalMs = 4000,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const scrollXRef = useRef(0);
  const contentWidthRef = useRef(0);
  const containerWidthRef = useRef(0);

  const autoplayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Duplicamos para dar sensación de loop visual
  const data = useMemo(
    () => (portadas.length > 0 ? [...portadas, ...portadas] : []),
    [portadas]
  );
  const items = data.length > 0 ? data : portadas;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollXRef.current = e.nativeEvent.contentOffset.x;
  };

  const onContentSizeChange = (w: number) => {
    contentWidthRef.current = w;
  };

  const onLayout = (e: any) => {
    containerWidthRef.current = e.nativeEvent.layout.width;
  };

  const getMaxOffset = () => {
    const maxOffset = contentWidthRef.current - containerWidthRef.current;
    return maxOffset > 0 ? maxOffset : 0;
  };

  const handleNext = () => {
    if (!scrollRef.current) return;
    const delta = itemWidth + gap;
    const maxOffset = getMaxOffset();

    if (maxOffset === 0) return;

    let target = scrollXRef.current + delta;
    if (target > maxOffset) {
      target = 0;
    }

    scrollRef.current.scrollTo({ x: target, animated: true });
    scrollXRef.current = target;
  };

  const startAutoplay = () => {
    if (!autoplay) return;
    if (autoplayTimerRef.current) return;
    if (portadas.length <= 1) return;

    autoplayTimerRef.current = setInterval(() => {
      handleNext();
    }, autoplayIntervalMs);
  };

  const stopAutoplay = () => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  };

  // Control de autoplay
  useEffect(() => {
    if (autoplay) {
      startAutoplay();
    } else {
      stopAutoplay();
    }

    return () => {
      stopAutoplay();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, autoplayIntervalMs, portadas.length, itemWidth, gap]);

  // Estados de carga / vacío
  if (loading || portadas.length === 0) {
    return (
      <View
        style={[
          styles.carouselWrapper,
          { height: HEIGHT, justifyContent: "center", alignItems: "center" },
        ]}
      >
        <PortadaSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.container} onLayout={onLayout}>
      <View style={[styles.carouselWrapper, { height: HEIGHT }]}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={onScroll}
          onContentSizeChange={onContentSizeChange}
          keyboardShouldPersistTaps="always"
          onScrollBeginDrag={stopAutoplay}
          onScrollEndDrag={startAutoplay}
          onTouchStart={stopAutoplay}
          onTouchEnd={startAutoplay}
          decelerationRate="fast"
          snapToInterval={itemWidth + gap}
          snapToAlignment="start"
          contentContainerStyle={[
            styles.track,
            { columnGap: gap, paddingHorizontal: 8 },
          ]}
        >
          {items.map((item, index) => (
            <View
              key={`portada-${item.id_portada}-${index}`}
              style={{ width: itemWidth, height: HEIGHT }}
            >
              <Pressable
                style={{ flex: 1 }}
                onPress={() => {
                  stopAutoplay();
                  onPressPortada?.(item, index);
                  startAutoplay();
                }}
                android_ripple={{ color: "rgba(0,0,0,0.08)" }}
              >
                <Image
                  source={{ uri: item.url_imagen }}
                  accessibilityLabel={`Portada ${item.id_portada}`}
                  style={styles.image}
                  resizeMode="cover"
                />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "99%",
    alignSelf: "center",
  },
  carouselWrapper: {
    width: "100%",
    maxWidth: 1150,
    alignSelf: "center",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "white",
  },
  track: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingVertical: 4,
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
