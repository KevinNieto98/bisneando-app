import { Link, router } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.safe}>
          <View style={styles.center}>
            <Image
              source={require("@/assets/images/bisneando.png")}
              style={{ width: 160, height: 80, marginBottom: 24 }}
              resizeMode="contain"
            />

            <View style={styles.card}>
              <Text style={styles.title}>Iniciar Sesión</Text>

              <View style={{ gap: 14 }}>
                <View>
                  <Text style={styles.label}>Correo</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="ejemplo@correo.com"
                    style={styles.input}
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View>
                  <Text style={styles.label}>Contraseña</Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholder="••••••••"
                    style={styles.input}
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <TouchableOpacity onPress={handleSubmit} style={styles.button}>
                  <Text style={styles.buttonText}>Entrar</Text>
                </TouchableOpacity>

                <View style={{ alignItems: "center", marginTop: 4 }}>
                  <Link href="/(auth)/forgot-password" style={styles.link}>
                    ¿Olvidaste tu contraseña?
                  </Link>
                </View>
              </View>

              <Text style={styles.footer}>
                ¿No tienes cuenta?{" "}
                <Link href="/(auth)/register" style={styles.linkBold}>
                  Regístrate
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
  title: { fontSize: 24, fontWeight: "800", color: "#1f2937", textAlign: "center", marginBottom: 18 },
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
    marginTop: 4,
    width: "100%",
    backgroundColor: "#eab308",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "700" },
  link: { color: "#a16207", fontWeight: "600", fontSize: 13 },
  linkBold: { color: "#a16207", fontWeight: "700" },
  footer: { marginTop: 18, textAlign: "center", color: "#6b7280", fontSize: 13 },
});
