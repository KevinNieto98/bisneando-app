import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

type InputType = "text" | "password" | "phone" | "email";

interface LoginInputProps {
  label: string;
  value: string;
  onChange: (text: string) => void;
  type?: InputType;
  required?: boolean;
  disabled?: boolean;
  showError?: boolean; // 🔴 Controlado por el padre
  onTyping?: () => void; // 👈 Nuevo callback para limpiar error al escribir
}

const LoginInput: React.FC<LoginInputProps> = ({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
  showError = false,
  onTyping,
}) => {
  const handleChange = (text: string) => {
    if (type === "phone" && !text.startsWith("+504")) {
      text = "+504 " + text.replace(/^\+504\s?/, "");
    }

    // Cuando el usuario empieza a escribir, avisamos al padre
    if (onTyping) onTyping();

    onChange(text);
  };

  const getKeyboardType = (): TextInputProps["keyboardType"] => {
    switch (type) {
      case "phone":
        return "phone-pad";
      case "email":
        return "email-address";
      default:
        return "default";
    }
  };

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={handleChange}
        editable={!disabled}
        secureTextEntry={type === "password"}
        keyboardType={getKeyboardType()}
        autoCapitalize="none"
        placeholder={
          type === "password"
            ? "••••••••"
            : type === "phone"
            ? "+504 9XXXXXXX"
            : "Ingrese texto"
        }
        style={[
          styles.input,
          disabled && { backgroundColor: "#f3f4f6", color: "#9ca3af" },
          showError && { borderColor: "red" },
        ]}
        placeholderTextColor="#9ca3af"
      />

      {showError && (
        <Text style={styles.errorText}>Este campo es obligatorio</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    marginTop: 6,
    width: "100%",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});

export default LoginInput;
