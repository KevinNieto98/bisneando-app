import { Category } from "@/store/useAppStore";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Icono from "./ui/Icon.native";

type Props = {
  categories: Category[];
  onGestureStart?: () => void; // avisa al padre que comienza gesto horizontal
  onGestureEnd?: () => void;   // avisa al padre que terminó el gesto
};

// 🎨 Paleta de colores pastel
const pastelColors = [
  "#FDE68A", // amarillo pastel
  "#BBF7D0", // verde pastel
  "#FBCFE8", // rosado pastel
  "#FECACA", // rojo suave
  "#E9D5FF", // violeta pastel
  "#A5F3FC", // celeste pastel
];

const CategorySection: React.FC<Props> = ({
  categories,
  onGestureStart,
  onGestureEnd,
}) => {
  const goToExplore = (categoryId?: number) => {
    router.push({
      pathname: "/(tabs)/explore",
      params: categoryId != null ? { categoryId: String(categoryId) } : {},
    });
  };

  return (
    <View style={{ marginTop: 6, paddingBottom: 5 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 1 }}
        directionalLockEnabled     // iOS: respeta la dirección del gesto
        // 👇 coordina con el padre para que no “robe” el gesto/pull-to-refresh
        onScrollBeginDrag={onGestureStart}
        onMomentumScrollBegin={onGestureStart}
        onScrollEndDrag={onGestureEnd}
        onMomentumScrollEnd={onGestureEnd}
        onTouchStart={onGestureStart}
        onTouchEnd={onGestureEnd}
      >
        {categories.map((item, index) => {
          const bgColor = pastelColors[index % pastelColors.length];

          return (
            <Pressable
              key={item.id_categoria}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: bgColor,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                },
              ]}
              // 👇 robustecer el tap contra micro-desplazamientos
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              pressRetentionOffset={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => goToExplore(item.id_categoria)}
            >
              <View style={styles.iconWrapper}>
                <Icono name={item.icono || "Tag"} size={22} color="black" />
              </View>
              <Text style={styles.text}>{item.nombre_categoria}</Text>
            </Pressable>
          );
        })}

        {/* Footer: Ver más */}
        <Pressable
          style={({ pressed }) => [
            styles.card,
            {
              backgroundColor: "#f4f4f5",
              transform: [{ scale: pressed ? 0.95 : 1 }],
            },
          ]}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          pressRetentionOffset={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={() => goToExplore()} // sin categoría => “Todo”
        >
          <View style={styles.iconWrapper}>
            <Icono name="EllipsisHorizontal" size={22} color="black" />
          </View>
          <Text style={styles.text}>Ver más</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

export default CategorySection;

const styles = StyleSheet.create({
  card: {
    width: 100,
    marginRight: 12,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  iconWrapper: {
    marginBottom: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
    color: "black",
    textAlign: "center",
  },
});
