import { Category } from "@/store/useAppStore";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import Icono from "./ui/Icon.native";

type Props = {
  categories: Category[];
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

const CategorySection: React.FC<Props> = ({ categories }) => {
  const router = useRouter();

  return (
    <View style={{ marginTop: 6, paddingBottom: 5 }}>
      <FlatList
        data={categories}

        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id_categoria.toString()}
        contentContainerStyle={{ paddingHorizontal: 10,  paddingBottom: 1 }}
        renderItem={({ item, index }) => {
          const bgColor = pastelColors[index % pastelColors.length];

          return (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: bgColor,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                },
              ]}
            // onPress={() => router.push(`/category/${item.id_categoria}`)}
            >
              <View style={styles.iconWrapper}>
                <Icono name={item.icono || "Tag"} size={22} color="black" />
              </View>
              <Text style={styles.text}>{item.nombre_categoria}</Text>
            </Pressable>
          );
        }}
        ListFooterComponent={
          <Pressable
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: "#f4f4f5", // gris clarito para diferenciar
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
            onPress={() => {
           
              // router.push("/categories") si quieres navegar
            }}
          >
            <View style={styles.iconWrapper}>
              <Icono name="EllipsisHorizontal" size={22} color="black" />
            </View>
            <Text style={styles.text}>Ver más</Text>
          </Pressable>
        }
      />
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
