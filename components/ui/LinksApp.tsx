import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icono from "./Icon.native";

interface LinksAppProps {
  name: string; // nombre del icono principal
  title: string;
  onPress: () => void;
}

export default function LinksApp({ name, title, onPress }: LinksAppProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.leftSection}>
        <Icono name={name} size={22} color="#27272a" />
        <Text style={styles.menuText}>{title}</Text>
      </View>

      <Icono name="ChevronRight" size={20} color="#52525b" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuText: {
    fontSize: 16,
    color: "#27272a",
    fontWeight: "500",
  },
});
