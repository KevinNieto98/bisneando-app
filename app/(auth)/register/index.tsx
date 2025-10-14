import AlertModal from "@/components/ui/AlertModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
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

/**
 * Registro clásico con password. Sin OTP.
 * Al registrarse correctamente, redirige a /(tabs)/home con ?welcome=1
 * para que el banner se muestre en Home y no aquí.
 */
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

  // Modal de errores
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
    // marcar campos vacíos tras cerrar
    setFirstNameError(!firstName.trim());
    setLastNameError(!lastName.trim());
    setPhoneError(!phone.trim());
    setEmailError(!email.trim());
    setPasswordError(!password.trim());
    setConfirmError(!confirm.trim());
  };

  const handleSubmit = async () => {
    // reiniciar errores antes de validar
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

    // Validar correo
    const { valid, message } = validateEmail(email);
    if (!valid) {
      setEmailError(true);
      showModal(message || "Correo inválido.");
      return;
    }

    // Validar contraseñas iguales
    if (password !== confirm) {
      setPasswordError(true);
      setConfirmError(true);
      showModal("Las contraseñas no coinciden.");
      return;
    }

    try {
      setIsLoading(true);

      // Registro con Supabase (clásico con password)
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            phone: phone.trim(),
          },
        },
      });

      if (error) {
        const msg = error.message?.toLowerCase() || "";
        if (msg.includes("user already registered") || msg.includes("already exists")) {
          showModal("Este correo ya está registrado. Intenta iniciar sesión.");
        } else {
          showModal(error.message);
        }
        return;
      }

      // Si la sesión existe, mandamos a home con welcome=1 para mostrar el banner allá
      if (data?.session) {
        router.replace("/(tabs)/home?welcome=1");
        return;
      }

      // Si no hay sesión, probablemente requiera verificación de correo
      showModal("Registro creado. Revisa tu correo para verificar tu cuenta.");
    } catch (err: any) {
      console.error(err);
      showModal("Ocurrió un error al registrarte. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}   // 👈 Android ya no se tapa
        keyboardVerticalOffset={insets.top + 56}                  // 👈 ajusta según tu header
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.safe}>
          {/* Volver */}
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

              {/* 👇 scroll para que el teclado no tape los inputs */}
              <ScrollView
                contentContainerStyle={{ paddingBottom: 16 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={{ gap: 14 }}>
                  <LoginInput
                    label="Nombre"
                    type="text"
                    value={firstName}
                    onChange={setFirstName}
                    required
                    showError={firstNameError}
                    onTyping={() => setFirstNameError(false)}
                    placeholder="Tu nombre"
                  />

                  <LoginInput
                    label="Apellido"
                    type="text"
                    value={lastName}
                    onChange={setLastName}
                    required
                    showError={lastNameError}
                    onTyping={() => setLastNameError(false)}
                    placeholder="Tu apellido"
                  />

                  <LoginInput
                    label="Número de Teléfono"
                    type="phone"
                    value={phone}
                    onChange={setPhone}
                    required
                    showError={phoneError}
                    onTyping={() => setPhoneError(false)}
                    placeholder="+504 9XXXXXXX"
                  />

                  <LoginInput
                    label="Correo"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    required
                    showError={emailError}
                    onTyping={() => setEmailError(false)}
                    placeholder="correo@ejemplo.com"
                  />

                  <LoginInput
                    label="Contraseña"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    required
                    showError={passwordError}
                    onTyping={() => setPasswordError(false)}
                    placeholder="••••••••"
                  />

                  <LoginInput
                    label="Confirmar Contraseña"
                    type="password"
                    value={confirm}
                    onChange={setConfirm}
                    required
                    showError={confirmError}
                    onTyping={() => setConfirmError(false)}
                    placeholder="••••••••"
                  />

                  <LoginButton
                    title={isLoading ? "Creando cuenta..." : "Registrarse"}
                    onPress={() => setConfirmVisible(true)}
                    disabled={isLoading}
                  />

                  <Text style={styles.footer}>
                    ¿Ya tienes cuenta?{" "}
                    <Link href="/(auth)/login" style={styles.linkBold}>
                      Inicia sesión
                    </Link>
                  </Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>

      {/* Modales */}
      <AlertModal
        visible={isModalVisible}
        title="Aviso"
        message={modalMessage}
        onClose={handleModalClose}
      />

      <ConfirmModal
        visible={confirmVisible}
        title="Confirmación"
        message="¿Estás seguro que deseas crear una cuenta?"
        icon="help-circle"
        confirmText="Sí, crear"
        cancelText="Cancelar"
        onConfirm={() => {
          setConfirmVisible(false);
          handleSubmit();
        }}
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
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 18,
  },
  linkBold: { color: "#a16207", fontWeight: "700" },
  footer: { marginTop: 18, color: "#6b7280", fontSize: 13 },
});
