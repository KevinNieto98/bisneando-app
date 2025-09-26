import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Searchbar } from "react-native-paper";
import { Product } from "../ProductSlideItem";

interface Props {
  products: Product[];
  onSelect: (product: Product) => void;
  onBack?: () => void;
}

export const Search: React.FC<Props> = ({ products, onSelect, onBack }) => {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState<Product[]>([]);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (text.length >= 3) {
      const results = products.filter((p) =>
        p.title.toLowerCase().includes(text.toLowerCase())
      );
      setFiltered(results);
    } else {
      setFiltered([]);
    }
  };

  return (
    <View>
      {/* 🔙 Container amarillo con flecha + buscador */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Searchbar
          placeholder="Buscar producto..."
          onChangeText={handleSearch}
          value={query}
          style={styles.searchbar}
          icon="magnify"
        />
      </View>

      {query.length > 0 && query.length < 3 && (
        <Text style={styles.message}>Debes escribir al menos 3 caracteres</Text>
      )}

      {query.length >= 3 && filtered.length === 0 && (
        <Text style={styles.message}>No hay resultados</Text>
      )}

      {filtered.length > 0 && (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.slug}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => onSelect(item)}
            >
              <Text>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD600", // ✅ amarillo
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  backButton: {
    marginRight: 8,
    padding: 6,
    borderRadius: 20,
  },
  searchbar: {
    flex: 1, // ✅ ocupa el resto del espacio
    borderRadius: 25,
  },
  message: {
    marginHorizontal: 12,
    marginVertical: 4,
    color: "gray",
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});
