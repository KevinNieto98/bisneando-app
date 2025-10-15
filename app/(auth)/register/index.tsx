import AlertModal from "@/components/ui/AlertModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import LoginButton from "@/components/ui/LoginButton";
import LoginInput from "@/components/ui/LoginInput";
import { useBackHandler } from "@/hooks/useBackHandler";
// 👈 usa el caller actualizado
import { supabase } from "@/lib/supabase"; // 👈 para setSession local
import { signupRequest } from "@/services/api";
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

export default function RegisterPage() {
  const { handleBack } = useBackHandler();
  const insets = useSafeAreaInsets();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  // Modal de errores e info
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // Confirmación
  const [confirmVisible, setConfirmVisible] = useState(false);

  // Errores por campo
  const [firstNameError, setFirstNameError] = useState(false);
  const [lastNameError, setLastNameError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmError, setConfirmError] = useState(false);

  const showModal = (message: string) => {
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setFirstNameError(!firstName.trim());
    setLastNameError(!lastName.trim());
    setPhoneError(!phone.trim());
    setEmailError(!email.trim());
    setPasswordError(!password.trim());
    setConfirmError(!confirm.trim());
  };

  const handleSubmit = async () => {
    setFirstNameError(false);
    setLastNameError(false);
    setPhoneError(false);
    setEmailError(false);
    setPasswordError(false);
    setConfirmError(false);

    let hasError = false;
    if (!firstName.trim()) { setFirstNameError(true); hasError = true; }
    if (!lastName.trim())  { setLastNameError(true);  hasError = true; }
    if (!phone.trim())     { setPhoneError(true);     hasError = true; }
    if (!email.trim())     { setEmailError(true);     hasError = true; }
    if (!password.trim())  { setPasswordError(true);  hasError = true; }
    if (!confirm.trim())   { setConfirmError(true);   hasError = true; }

    if (hasError) {
      showModal("Por favor, completa todos los campos requeridos.");
      return;
    }

    const { valid, message } = validateEmail(email);
    if (!valid) {
      setEmailError(true);
      showModal(message || "Correo inválido.");
      return;
    }

    if (password !== confirm) {
      setPasswordError(true);
      setConfirmError(true);
      showModal("Las contraseñas no coinciden.");
      return;
    }

    try {
      setIsLoading(true);

      // Llamada a tu API /api/signup
      const res = await signupRequest({
        nombre: firstName.trim(),
        apellido: lastName.trim(),
        telefono: phone.trim(),
        correo: email.trim(),
        password: password.trim(),
        id_perfil: 1, // ajusta según tu lógica
      });

      if (!res.ok) {
        showModal(res.message ?? "No se pudo crear la cuenta.");
        return;
      }

      if (res.status === "created") {
        // Hidratar sesión local para que useAuth funcione
        const at = res.tokens?.access_token;
        const rt = res.tokens?.refresh_token;

        if (at && rt) {
          const { error: setErr } = await supabase.auth.setSession({
            access_token: at,
            refresh_token: rt,
          });

          if (setErr) {
            console.error("setSession error:", setErr);
            showModal("Cuenta creada, pero no se pudo establecer la sesión local.");
            return;
          }
        }

        router.replace("/(tabs)/home?welcome=1");
        return;
      }

      // pending_confirmation
      showModal("Registro creado. Revisa tu correo para verificar tu cuenta.");
    } catch (err) {
      console.error(err);
      showModal("Ocurrió un error al registrarte. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={insets.top + 56}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.safe}>
          <TouchableOpacity
            onPress={() => handleBack()}
            style={{ position: "absolute", top: insets.top + 8, left: 16, zIndex: 10, padding: 8 }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={28} color="#374151" />
          </TouchableOpacity>

          <View style={styles.center}>
            <Image
              source={require("@/assets/images/bisneando.png")}
              style={{ width: 160, height: 80, marginBottom: 8 }}
              resizeMode="contain"
            />

            <View style={styles.card}>
              <Text style={styles.title}>Crear Cuenta</Text>

              <ScrollView
                contentContainerStyle={{ paddingBottom: 16 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={{ gap: 14 }}>
                  <LoginInput label="Nombre" type="text" value={firstName} onChange={setFirstName}
                    required showError={firstNameError} onTyping={() => setFirstNameError(false)} placeholder="Tu nombre" />

                  <LoginInput label="Apellido" type="text" value={lastName} onChange={setLastName}
                    required showError={lastNameError} onTyping={() => setLastNameError(false)} placeholder="Tu apellido" />

                  <LoginInput label="Número de Teléfono" type="phone" value={phone} onChange={setPhone}
                    required showError={phoneError} onTyping={() => setPhoneError(false)} placeholder="+504 9XXXXXXX" />

                  <LoginInput label="Correo" type="email" value={email} onChange={setEmail}
                    required showError={emailError} onTyping={() => setEmailError(false)} placeholder="correo@ejemplo.com" />

                  <LoginInput label="Contraseña" type="password" value={password} onChange={setPassword}
                    required showError={passwordError} onTyping={() => setPasswordError(false)} placeholder="••••••••" />

                  <LoginInput label="Confirmar Contraseña" type="password" value={confirm} onChange={setConfirm}
                    required showError={confirmError} onTyping={() => setConfirmError(false)} placeholder="••••••••" />

                  <LoginButton
                    title={isLoading ? "Creando cuenta..." : "Registrarse"}
                    onPress={() => setConfirmVisible(true)}
                    disabled={isLoading}
                  />

                  <Text style={styles.footer}>
                    ¿Ya tienes cuenta?{" "}
                    <Link href="/(auth)/login" style={styles.linkBold}>Inicia sesión</Link>
                  </Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>

      {/* Modales */}
      <AlertModal visible={isModalVisible} title="Aviso" message={modalMessage} onClose={handleModalClose} />

      <ConfirmModal
        visible={confirmVisible}
        title="Confirmación"
        message="¿Estás seguro que deseas crear una cuenta?"
        icon="help-circle"
        confirmText="Sí, crear"
        cancelText="Cancelar"
        onConfirm={() => { setConfirmVisible(false); handleSubmit(); }}
        onCancel={() => setConfirmVisible(false)}
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
  title: { fontSize: 24, fontWeight: "800", color: "#1f2937", textAlign: "center", marginBottom: 18 },
  linkBold: { color: "#a16207", fontWeight: "700" },
  footer: { marginTop: 18, color: "#6b7280", fontSize: 13 },
});
