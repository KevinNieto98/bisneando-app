import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function RegisterPage() {
  const insets = useSafeAreaInsets();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [phone, setPhone]         = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");

  const handleSubmit = () => {
    if (!firstName || !lastName || !phone || !email || !password || !confirm) {
      Alert.alert("Campos incompletos", "Por favor, completa todos los campos.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Contraseñas no coinciden", "Verifica tu contraseña.");
      return;
    }

    // TODO: Lógica real de registro (API)
    // Si todo OK, redirige a tabs (o a login si prefieres)
    router.replace("/(tabs)/home");
  };

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
          {/* Botón volver (a login) respetando notch */}
          <TouchableOpacity
            onPress={() => router.replace("/(auth)/login")}
            style={{
              position: "absolute",
              top: insets.top + 8,
              left: 16,
              zIndex: 10,
              padding: 8,
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={28} color="#374151" />
          </TouchableOpacity>

          <View style={styles.center}>
            <Image
              source={require("@/assets/images/bisneando.png")}
              style={{ width: 160, height: 80, marginBottom: 4 }}
              resizeMode="contain"
            />

            <View style={styles.card}>
              <Text style={styles.title}>Crear Cuenta</Text>

              <View style={{ gap: 12 }}>
                <View>
                  <Text style={styles.label}>Nombre</Text>
                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Tu nombre"
                    style={styles.input}
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="words"
                  />
                </View>

                <View>
                  <Text style={styles.label}>Apellido</Text>
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Tu apellido"
                    style={styles.input}
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="words"
                  />
                </View>

                <View>
                  <Text style={styles.label}>Número de Teléfono</Text>
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="+504 9999-9999"
                    style={styles.input}
                    placeholderTextColor="#9ca3af"
                    keyboardType="phone-pad"
                  />
                </View>

                <View>
                  <Text style={styles.label}>Correo</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="ejemplo@correo.com"
                    style={styles.input}
                    placeholderTextColor="#9ca3af"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View>
                  <Text style={styles.label}>Contraseña</Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    style={styles.input}
                    placeholderTextColor="#9ca3af"
                    secureTextEntry
                  />
                </View>

                <View>
                  <Text style={styles.label}>Confirmar Contraseña</Text>
                  <TextInput
                    value={confirm}
                    onChangeText={setConfirm}
                    placeholder="••••••••"
                    style={styles.input}
                    placeholderTextColor="#9ca3af"
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity onPress={handleSubmit} style={styles.button}>
                  <Text style={styles.buttonText}>Registrarse</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.footer}>
                ¿Ya tienes cuenta?{" "}
                <Link href="/(auth)/login" style={styles.linkBold}>
                  Inicia sesión
                </Link>
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#facc15" }, // bg-yellow-400
  safe: { flex: 1, paddingHorizontal: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 18,
  },
  label: { fontWeight: "600", color: "#374151" },
  input: {
    marginTop: 6,
    width: "100%",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  button: {
    marginTop: 6,
    width: "100%",
    backgroundColor: "#eab308",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "700" },
  linkBold: { color: "#a16207", fontWeight: "700" },
  footer: { marginTop: 18, textAlign: "center", color: "#6b7280", fontSize: 13 },
});
