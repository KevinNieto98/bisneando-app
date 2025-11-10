// components/checkout/PlaceOrderButton.tsx
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import Icono from "../ui/Icon.native";

type Variant = "primary" | "warning" | "success" | "danger";

interface PlaceOrderButtonProps {
  disabled?: boolean;
  loading?: boolean;              // ⬅️ NUEVO: muestra spinner y bloquea el botón
  onPress?: () => void;
  title?: string;
  titleWhileLoading?: string;     // ⬅️ NUEVO: texto mientras carga
  iconName?: string;
  variant?: Variant;
  style?: ViewStyle;
}

const COLORS: Record<Variant, { bg: string; pressed: string; ripple: string }> = {
  primary: { bg: "#2563eb", pressed: "#1e40af", ripple: "#1e3a8a" },
  warning: { bg: "#f59e0b", pressed: "#d97706", ripple: "#a16207" },
  success: { bg: "#16a34a", pressed: "#15803d", ripple: "#065f46" },
  danger:  { bg: "#dc2626", pressed: "#b91c1c", ripple: "#7f1d1d" },
};

export function PlaceOrderButton({
  disabled = false,
  loading = false,                       // ⬅️ default
  onPress,
  title = "Colocar orden",
  titleWhileLoading = "Colocando orden...",
  iconName = "ShoppingCart",
  variant = "primary",
  style,
}: PlaceOrderButtonProps) {
  const isDisabled = disabled || loading;

  const handlePress = () => {
    if (isDisabled) return;
    if (onPress) onPress();
    else router.push("/success");
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor:
            pressed && !isDisabled ? COLORS[variant].pressed : COLORS[variant].bg,
        },
        isDisabled && styles.disabled,
        style,
      ]}
      android_ripple={isDisabled ? undefined : { color: COLORS[variant].ripple }}
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Icono name={iconName as any} size={18} color="white" />
        )}
        <Text style={styles.text}>
          {loading ? titleWhileLoading : title}
        </Text>
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
  disabled: { opacity: 0.6 },
  content: { flexDirection: "row", alignItems: "center", gap: 8 },
  text: { color: "white", fontWeight: "700", fontSize: 16 },
});

export default PlaceOrderButton;
