// CategorySection.tsx
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import Icono from "./ui/Icon.native";

type Category = {
  title: string;
  icon: string; // ahora es un string con el nombre del icono
  slug: string;
};

type Props = {
  categories: Category[];
};

const CategorySection: React.FC<Props> = ({ categories }) => {
  const router = useRouter();

  return (
    <FlatList
      data={categories}
      numColumns={3}
      keyExtractor={(item) => item.slug}
      columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 16 }}
      renderItem={({ item }) => (
        <Pressable
         // onPress={() => router.push(`/category/${item.slug}`)}
          style={({ pressed }) => [
            {
              flex: 1,
              marginHorizontal: 6,
              borderRadius: 16,
              padding: 16,
              backgroundColor: "white",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 4,
              elevation: 3,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
          ]}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              backgroundColor: "#facc15", // amarillo
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Icono name={item.icon} size={28} color="white" />
          </View>
          <Text style={{ fontSize: 14, fontWeight: "500", color: "#1f2937" }}>
            {item.title}
          </Text>
        </Pressable>
      )}
    />
  );
};

export default CategorySection;
