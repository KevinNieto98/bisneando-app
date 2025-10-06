import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Icono from "../ui/Icon.native";

interface PlaceOrderButtonProps {
  disabled: boolean;
  onPress?: () => void;
}

export function PlaceOrderButton({ disabled, onPress }: PlaceOrderButtonProps) {

  const handlePress = () => {
    if (disabled) return;
    if (onPress) {
      onPress();
    } else {
     router.push("/success")
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
      android_ripple={{ color: "#1e3a8a" }}
      onPress={handlePress}
      disabled={disabled}
    >
      <View style={styles.content}>
        <Icono name="ShoppingCart" size={18} color="white" />
        <Text style={styles.text}>Colocar orden</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#2563eb",
    padding: 16,
    marginHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  pressed: {
    backgroundColor: "#1e40af",
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  text: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default PlaceOrderButton;
