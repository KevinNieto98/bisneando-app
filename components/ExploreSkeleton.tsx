import React from "react";
import { Dimensions, FlatList, ScrollView, StyleSheet, View } from "react-native";

const { width } = Dimensions.get("window");
const CARD_MARGIN = 4;
const CARD_WIDTH = (width - CARD_MARGIN * 2 * 3 - 32) / 4;

const ExploreSkeleton = () => {
  // placeholders para las tarjetas
  const placeholders = Array.from({ length: 6 }).map((_, i) => ({ id: i.toString() }));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 🔹 Chips (categorías) */}
      <View style={styles.chipsRow}>
        {[...Array(5)].map((_, idx) => (
          <View key={idx} style={styles.chip} />
        ))}
      </View>

      {/* 🔹 Grid de productos */}
      <FlatList
        data={placeholders}
        numColumns={3}
        keyExtractor={(item) => item.id}
        scrollEnabled={false} // importante: ScrollView ya maneja el scroll
        renderItem={() => <View style={styles.card} />}
        contentContainerStyle={styles.grid}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  content: {
    padding: 16,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    width: 80,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e5e7eb",
  },
  grid: {
    paddingBottom: 20,
  },
  card: {
    width: CARD_WIDTH,
    height: 180,
    borderRadius: 10,
    backgroundColor: "#e5e7eb",
    margin: CARD_MARGIN,
  },
});

export default ExploreSkeleton;
