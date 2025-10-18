// components/ui/LoginInput.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from "react-native";

type Kind = "text" | "email" | "password" | "phone";

export interface LoginInputProps
  extends Omit<TextInputProps, "value" | "onChangeText" | "onChange"> {
  label: string;
  type?: Kind;
  value: string;
  onChange: (text: string) => void;
  required?: boolean;
  showError?: boolean;
  onTyping?: () => void;
  containerStyle?: any;
}

export default function LoginInput({
  label,
  type = "text",
  value,
  onChange,
  required,
  showError,
  onTyping,
  placeholder,
  containerStyle,
  ...rest // aquí vendrán autoCapitalize, autoCorrect, etc.
}: LoginInputProps) {
  const isPassword = type === "password";
  const [revealed, setRevealed] = useState(false);

  // Defaults por tipo (si el caller no los pasa)
  const defaultKeyboardType: TextInputProps["keyboardType"] =
    type === "email" ? "email-address" : type === "phone" ? "phone-pad" : "default";

  const defaultAutoCap: TextInputProps["autoCapitalize"] =
    type === "email" || type === "password" || type === "phone" ? "none" : "sentences";

  // secureTextEntry efectivo (controlado por el ojito si es password)
  const effectiveSecure = isPassword ? !revealed : !!rest.secureTextEntry;

  // Evita que secureTextEntry del caller pise nuestro control del ojito
  const { secureTextEntry: _ignoredSecure, ...restProps } = rest;

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>
        {label} {required ? <Text style={styles.required}>*</Text> : null}
      </Text>

      <View style={[styles.inputWrapper, showError && styles.inputWrapperError]}>
        <TextInput
          value={value}
          onChangeText={(t) => {
            onChange(t);
            onTyping?.();
          }}
          placeholder={placeholder}
          style={[styles.input, isPassword && styles.inputWithIcon]}
          // Defaults solo si el caller NO los pasó
          keyboardType={rest.keyboardType ?? defaultKeyboardType}
          autoCapitalize={rest.autoCapitalize ?? defaultAutoCap}
          autoCorrect={rest.autoCorrect ?? false}
          secureTextEntry={effectiveSecure}
          // Para iOS, ayuda al autocompletado de contraseñas
          textContentType={isPassword ? (rest.textContentType ?? "password") : rest.textContentType}
          {...restProps}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setRevealed((v) => !v)}
            style={styles.eyeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel={revealed ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            <Ionicons name={revealed ? "eye-off" : "eye"} size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {showError ? <Text style={styles.helperError}>Campo requerido o inválido</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%" },
  label: { fontSize: 14, color: "#374151", marginBottom: 6, fontWeight: "600" },
  required: { color: "#dc2626" },

  inputWrapper: {
    position: "relative",
    height: 48,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    justifyContent: "center",
  },
  inputWrapperError: {
    borderColor: "#dc2626",
  },

  input: {
    height: "100%",
    paddingHorizontal: 14,
    fontSize: 16,
  },
  inputWithIcon: {
    paddingRight: 44, // deja espacio para el ojito
  },

  eyeButton: {
    position: "absolute",
    right: 12,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },

  helperError: { marginTop: 6, color: "#dc2626", fontSize: 12 },
});
