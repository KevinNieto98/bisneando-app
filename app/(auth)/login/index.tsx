import AlertModal from "@/components/ui/AlertModal";
import LoginButton from "@/components/ui/LoginButton";
import LoginInput from "@/components/ui/LoginInput";
import { useBackHandler } from "@/hooks/useBackHandler";
import { supabase } from "@/lib/supabase";
import { validateEmail } from "@/utils/validations";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function LoginPage() {
  const { handleBack } = useBackHandler();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Modal
  const [isModalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // Estados para borde rojo
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const showModal = (message: string) => {
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    // Reiniciar errores antes de validar
    setEmailError(false);
    setPasswordError(false);

    let hasError = false;

    if (!email.trim()) hasError = true;
    if (!password.trim()) hasError = true;

    if (hasError) {
      showModal("Por favor, completa todos los campos requeridos.");
      return;
    }

    // Validar correo
    const { valid, message } = validateEmail(email);
    if (!valid) {
      showModal(message || "Correo inválido.");
      return;
    }

    try {
      setIsLoading(true);

      // ✅ Autenticación con Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          showModal("Correo o contraseña incorrectos.");
        } else {
          showModal(error.message);
        }
        return;
      }

      const { session } = data;
      if (!session) {
        showModal("No se pudo iniciar sesión. Intenta nuevamente.");
        return;
      }

      // ✅ Redirigir al home
      router.replace("/(tabs)/home");
    } catch (err: any) {
      showModal("Ocurrió un error al iniciar sesión.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    // Marcar los campos vacíos como erróneos
    setEmailError(!email.trim());
    setPasswordError(!password.trim());
  };

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"} // 👈 Android ya no se tapa
        keyboardVerticalOffset={insets.top + 56}                // 👈 ajusta según tu header
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.safe}>
          <TouchableOpacity
            onPress={() => handleBack()}
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
              style={{ width: 160, height: 80, marginBottom: 24 }}
              resizeMode="contain"
            />

            <View style={styles.card}>
              <Text style={styles.title}>Iniciar Sesión</Text>

              {/* 👇 Scroll para que no tape el teclado (especialmente password) */}
              <ScrollView
                contentContainerStyle={{ paddingBottom: 12 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={{ gap: 14 }}>
                  <LoginInput
                    label="Correo"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    required
                    showError={emailError}
                    onTyping={() => setEmailError(false)}
                  />

                  <LoginInput
                    label="Contraseña"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    required
                    showError={passwordError}
                    onTyping={() => setPasswordError(false)}
                  />

                  <LoginButton
                    title="Entrar"
                    onPress={handleSubmit}
                    disabled={isLoading}
                  />

                  <View style={{ alignItems: "center", marginTop: 4 }}>
                    <Link href="/(auth)/forgot-password" style={styles.link}>
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>

      <AlertModal
        visible={isModalVisible}
        title="Ups!"
        message={modalMessage}
        onClose={handleModalClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#facc15" },
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
  link: { color: "#a16207", fontWeight: "600", fontSize: 13 },
  linkBold: { color: "#a16207", fontWeight: "700" },
  footer: {
    marginTop: 18,
    textAlign: "center",
    color: "#6b7280",
    fontSize: 13,
  },
});
