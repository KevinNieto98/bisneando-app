import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import Icono from "./Icon.native";

type EditButtonProps = {
  label?: string;
  onPress?: () => void;
  style?: ViewStyle;
  iconName?: string;
  iconColor?: string;
  iconSize?: number;
};

export const EditButton: React.FC<EditButtonProps> = ({
  label = "Editar",
  onPress,
  style,
  iconName = "Edit3",
  iconColor = "#2563eb",
  iconSize = 16,
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
  
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.editButton,
        pressed && { backgroundColor: "#e0e7ff" },
        style,
      ]}
      android_ripple={{ color: "#e0e7ff", borderless: true }}
      onPress={handlePress}
    >
      <Icono name={iconName} size={iconSize} color={iconColor} />
      <Text style={[styles.editText, { color: iconColor }]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  editText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export default EditButton;
