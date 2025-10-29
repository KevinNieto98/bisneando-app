// components/checkout/PlaceOrderButton.tsx
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import Icono from "../ui/Icon.native";

type Variant = "primary" | "warning" | "success" | "danger";

interface PlaceOrderButtonProps {
  disabled?: boolean;
  onPress?: () => void;
  title?: string;                 // 👈 nuevo
  iconName?: string;              // 👈 nuevo (para Icono)
  variant?: Variant;              // 👈 nuevo
  style?: ViewStyle;              // 👈 nuevo (para ajustar ancho/márgenes)
}

const COLORS: Record<Variant, { bg: string; pressed: string; ripple: string }> = {
  primary: { bg: "#2563eb", pressed: "#1e40af", ripple: "#1e3a8a" },
  warning: { bg: "#f59e0b", pressed: "#d97706", ripple: "#a16207" },
  success: { bg: "#16a34a", pressed: "#15803d", ripple: "#065f46" },
  danger:  { bg: "#dc2626", pressed: "#b91c1c", ripple: "#7f1d1d" },
};

export function PlaceOrderButton({
  disabled = false,
  onPress,
  title = "Colocar orden",
  iconName = "ShoppingCart",
  variant = "primary",
  style,
}: PlaceOrderButtonProps) {
  const handlePress = () => {
    if (disabled) return;
    if (onPress) onPress();
    else router.push("/success");
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: pressed && !disabled ? COLORS[variant].pressed : COLORS[variant].bg },
        disabled && styles.disabled,
        style,
      ]}
      android_ripple={{ color: COLORS[variant].ripple }}
      onPress={handlePress}
      disabled={disabled}
    >
      <View style={styles.content}>
        <Icono name={iconName as any} size={18} color="white" />
        <Text style={styles.text}>{title}</Text>
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
  disabled: { opacity: 0.5 },
  content: { flexDirection: "row", alignItems: "center", gap: 8 },
  text: { color: "white", fontWeight: "700", fontSize: 16 },
});

export default PlaceOrderButton;
