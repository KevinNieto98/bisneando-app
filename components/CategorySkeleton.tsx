// CategorySkeleton.tsx
import React from "react";
import { FlatList, View } from "react-native";

const skeletonItems = Array.from({ length: 6 }) // mostramos 6 placeholders

const CategorySkeleton = () => {
  return (
    <FlatList
      data={skeletonItems}
      numColumns={3}
      keyExtractor={(_, index) => `skeleton-${index}`}
      columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 16 }}
      renderItem={() => (
        <View
          style={{
            flex: 1,
            marginHorizontal: 6,
            borderRadius: 16,
            padding: 16,
            backgroundColor: "white",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowOffset: { width: 0, height: 1 },
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          {/* Círculo/ícono */}
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              backgroundColor: "#e5e7eb", // gris
              marginBottom: 8,
            }}
          />
          {/* Texto */}
          <View
            style={{
              width: 60,
              height: 14,
              borderRadius: 4,
              backgroundColor: "#e5e7eb",
            }}
          />
        </View>
      )}
    />
  )
}

export default CategorySkeleton
