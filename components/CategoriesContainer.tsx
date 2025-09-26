import { Category } from "@/store/useAppStore"; // ✅ usa el mismo tipo
import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface CategoriesContainerProps {
  categories: Category[];
}

export const CategoriesContainer: React.FC<CategoriesContainerProps> = ({
  categories,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    setAtStart(contentOffset.x <= 0);
    setAtEnd(contentOffset.x + layoutMeasurement.width >= contentSize.width - 1);
  };

  const scrollBy = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ x: offset, animated: true });
    }
  };

  return (
    <View style={styles.container}>
      {!atStart && (
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => scrollBy(-100)}
        >
          <Ionicons name="chevron-back" size={20} color="#444" />
        </TouchableOpacity>
      )}

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((cat) => (
          <View key={cat.id_categoria} style={styles.chip}>
            <Text style={styles.chipText}>{cat.nombre_categoria}</Text>
          </View>
        ))}
      </ScrollView>

      {!atEnd && (
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => scrollBy(100)}
        >
          <Ionicons name="chevron-forward" size={20} color="#444" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    marginHorizontal: 10,
  },
  navButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 4,
  },
  scrollContent: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#FFD600", // amarillo
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
});
