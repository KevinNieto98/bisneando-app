import AlertModal from "@/components/ui/AlertModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import LoginButton from "@/components/ui/LoginButton";
import LoginInput from "@/components/ui/LoginInput";
import { useBackHandler } from "@/hooks/useBackHandler";
import { otpGenerate } from "@/services/api";
import { useSignupDraft } from "@/store/useSignupDraft";
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

// ======== Helpers de máscara/normalización ========
const norm = (s: string) => s.normalize("NFKC").trim();
const onlyDigits = (s: string) => s.replace(/\D+/g, "");

// quita caracteres invisibles (zero-width) que rompen comparaciones
const stripZeroWidth = (s: string) => s.replace(/[\u200B-\u200D\u2060\uFEFF]/g, "");

// normaliza secretos (passwords): NFKC + sin invisibles + trim bordes
const sanitizeSecret = (s: string) => stripZeroWidth(s.normalize("NFKC")).trim();

// (+504) Honduras — muestra: "+504 9XXX XXXX"
function formatHnPhone(input: string) {
  let d = onlyDigits(input);
  if (d.startsWith("504")) d = d.slice(3);
  if (d.length > 8) d = d.slice(0, 8);
  if (d.length === 0) return "+504 ";
  if (d.length <= 1) return `+504 ${d}`;
  if (d.length <= 4) return `+504 ${d[0]}${d.slice(1)}`;
  return `+504 ${d.slice(0, 1)}${d.slice(1, 4)} ${d.slice(4)}`;
}

export default function RegisterPage() {
  const { handleBack } = useBackHandler();
  const insets = useSafeAreaInsets();

  const [firstName, setFirstName]   = useState("");
  const [lastName, setLastName]     = useState("");
  const [phone, setPhone]           = useState("");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");

  const [isLoading, setIsLoading] = useState(false);

  // Modal de errores e info
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage]   = useState("");

  // Confirmación
  const [confirmVisible, setConfirmVisible] = useState(false);

  // Errores por campo
  const [firstNameError, setFirstNameError] = useState(false);
  const [lastNameError, setLastNameError]   = useState(false);
  const [phoneError, setPhoneError]         = useState(false);
  const [emailError, setEmailError]         = useState(false);
  const [passwordError, setPasswordError]   = useState(false);
  const [confirmError, setConfirmError]     = useState(false);

  const { setDraft } = useSignupDraft();

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

  // 🌟 Validación previa: si pasa, recién mostramos el modal
  const precheckAndMaybeConfirm = () => {
    // limpia flags
    setFirstNameError(false);
    setLastNameError(false);
    setPhoneError(false);
    setEmailError(false);
    setPasswordError(false);
    setConfirmError(false);

    const first = norm(firstName);
    const last  = norm(lastName);
    const mail  = norm(email);

    let telRaw = onlyDigits(phone);
    if (telRaw.startsWith("504")) telRaw = telRaw.slice(3);

    // mínimos
    if (!first || !last || !mail || !telRaw || !password || !confirm) {
      if (!first) setFirstNameError(true);
      if (!last) setLastNameError(true);
      if (!mail) setEmailError(true);
      if (!telRaw) setPhoneError(true);
      if (!password) setPasswordError(true);
      if (!confirm) setConfirmError(true);
      showModal("Por favor, completa todos los campos requeridos.");
      return;
    }

    // teléfono
    if (telRaw.length !== 8) {
      setPhoneError(true);
      showModal("El número de teléfono debe tener 8 dígitos.");
      return;
    }

    // correo
    const { valid, message } = validateEmail(mail);
    if (!valid) {
      setEmailError(true);
      showModal(message || "Correo inválido.");
      return;
    }

    // ⚠️ contraseñas (sanitizadas)
    const pass = sanitizeSecret(password);
    const conf = sanitizeSecret(confirm);
    if (!pass || !conf) {
      setPasswordError(true);
      setConfirmError(true);
      showModal("La contraseña no puede estar vacía.");
      return;
    }
    if (pass !== conf) {
      setPasswordError(true);
      setConfirmError(true);
      showModal("Las contraseñas no coinciden.");
      return;
    }

    // Si todo ok, ahora sí mostrar confirm modal
    setConfirmVisible(true);
  };

  // Valida (de nuevo por seguridad) -> genera OTP -> guarda draft -> navega
  const validateAndGoToOTP = async () => {
    // saneo definitivo (idéntico a arriba)
    const first = norm(firstName);
    const last  = norm(lastName);
    const mail  = norm(email);
    const pass  = sanitizeSecret(password);
    const conf  = sanitizeSecret(confirm);

    let telRaw = onlyDigits(phone);
    if (telRaw.startsWith("504")) telRaw = telRaw.slice(3);

    // por seguridad, recheck rápido
    if (!first || !last || !mail || !telRaw || !pass || !conf) {
      showModal("Por favor, revisa los campos obligatorios.");
      return;
    }
    if (telRaw.length !== 8) {
      showModal("El número de teléfono debe tener 8 dígitos.");
      return;
    }
    if (pass !== conf) {
      showModal("Las contraseñas no coinciden.");
      return;
    }

    try {
      setIsLoading(true);

      const otpRes = await otpGenerate("verify_account", {
        email: mail,
        channel: "email",
        metadata: { telefono: telRaw, nombre: first, apellido: last },
        returnOtpInResponse: __DEV__,
      });

      if (!otpRes?.ok) {
        showModal("No se pudo generar el OTP. Intenta nuevamente.");
        return;
      }

      const eventId = otpRes.id_event;
      const expiresAt = otpRes.expires_at;
      if (!eventId) {
        showModal("No se recibió el identificador del evento OTP.");
        return;
      }

      // draft con TEL RAW
      setDraft({
        nombre: first,
        apellido: last,
        telefono: telRaw,
        correo: mail,
        password: pass,
      });

      router.push({
        pathname: "/(auth)/confirm-otp",
        params: {
          eventId,
          expiresAt,
          email: mail,
          ...(otpRes.otp ? { otpPreview: otpRes.otp } : {}),
        },
      });
    } catch (err) {
      console.error(err);
      showModal("Ocurrió un error al solicitar el OTP. Intenta nuevamente.");
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
                    onChange={(t) => {
                      setPhone(formatHnPhone(t));
                      setPhoneError(false);
                    }}
                    required
                    showError={phoneError}
                    onTyping={() => setPhoneError(false)}
                    keyboardType="phone-pad"
                    textContentType="telephoneNumber"
                    placeholder="+504 9XXX XXXX"
                  />

                  <LoginInput
                    label="Correo"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    required
                    showError={emailError}
                    onTyping={() => setEmailError(false)}
                    autoCapitalize="none"
                    autoCorrect={false}
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
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry
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
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry
                    placeholder="••••••••"
                  />

                  <LoginButton
                    title={isLoading ? "Solicitando OTP..." : "Registrarse"}
                    onPress={precheckAndMaybeConfirm} // 👈 primero valida, luego muestra modal
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
      <AlertModal
        visible={isModalVisible}
        title="Aviso"
        message={modalMessage}
        onClose={handleModalClose}
      />

      <ConfirmModal
        visible={confirmVisible}
        title="Confirmación"
        message="¿Deseas solicitar el código OTP y continuar?"
        icon="help-circle"
        confirmText="Sí, continuar"
        cancelText="Cancelar"
        onConfirm={() => { setConfirmVisible(false); validateAndGoToOTP(); }}
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
