import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import Icono from "./ui/Icon.native";

type Category = {
  title: string;
  icon: string;
  slug: string;
};

type Props = {
  categories: Category[];
};

// 🎨 Paleta de colores pastel
const pastelColors = [
  "#FDE68A", // amarillo pastel
 // "#BFDBFE", // azul pastel
 // "#C7D2FE", // morado pastel
  "#BBF7D0", // verde pastel
  "#FBCFE8", // rosado pastel
  "#FECACA", // rojo suave
  "#E9D5FF", // violeta pastel
  "#A5F3FC", // celeste pastel
];

const CategorySection: React.FC<Props> = ({ categories }) => {
  const router = useRouter();

  return (
    <FlatList
      data={categories}
      numColumns={3}
      keyExtractor={(item) => item.slug}
      columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 12 }}
      renderItem={({ item, index }) => {
        const bgColor = pastelColors[index % pastelColors.length]; // 🔄 asigna color automático

        return (
          <Pressable
            // onPress={() => router.push(`/category/${item.slug}`)}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: bgColor, transform: [{ scale: pressed ? 0.96 : 1 }] },
            ]}
          >
            <View style={styles.iconWrapper}>
              <Icono name={item.icon} size={22} color="black" />
            </View>
            <Text style={styles.text}>{item.title}</Text>
          </Pressable>
        );
      }}
    />
  );
};

export default CategorySection;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
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
