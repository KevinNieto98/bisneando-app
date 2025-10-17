// ProfileScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";
import { SafeAreaView } from "react-native-safe-area-context";

import FloatingInput from "@/components/ui/FloatingInput";
import Icono from "@/components/ui/Icon.native";
import LinksApp from "@/components/ui/LinksApp";
import TitleForm from "@/components/ui/TitleForm";

// 👇 Asegúrate que esta ruta apunte AL ARCHIVO que exporta `default AlertModal`
import AlertModal from "@/components/ui/AlertModal";
import { supabase } from "@/lib/supabase"; // ajusta si tu ruta es distinta
import { otpGenerate, otpVerify } from "@/services/api";

export default function ProfileScreen() {
  const navigation = useNavigation();

  // ---- Alert modal state ----
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertIcon, setAlertIcon] =
    useState<keyof typeof Ionicons.glyphMap>("alert-circle");

  const showAlert = (
    title: string,
    message: string,
    icon: keyof typeof Ionicons.glyphMap = "alert-circle"
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertIcon(icon);
    setAlertVisible(true);
  };

  // ---- OTP modal state ----
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);

  // Generar OTP
  const handleVerifyAccount = async () => {
    if (loadingGenerate) return; // auto-bloqueo sin usar disabled
    try {
      setLoadingGenerate(true);

      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token ?? null;
      if (!token) {
        showAlert(
          "Sesión requerida",
          "Inicia sesión para verificar tu cuenta.",
          "lock-closed"
        );
        return;
      }

      const res = await otpGenerate("verify_account", {
        ttlSeconds: 300,
        returnOtpInResponse: __DEV__,
        token,
      });

      if (__DEV__ && res?.otp) {
        showAlert("OTP de desarrollo", `Código: ${res.otp}`, "construct");
      } else {
        showAlert(
          "Código enviado",
          "Revisa tu email o SMS para el código.",
          "mail"
        );
      }

      setOtpCode("");
      setOtpModalVisible(true);
    } catch (e: any) {
      showAlert(
        "No se pudo generar el código",
        e?.message ?? "Intenta de nuevo.",
        "warning"
      );
    } finally {
      setLoadingGenerate(false);
    }
  };

  // Verificar OTP
  const handleSubmitOtp = async () => {
    if (!otpCode || otpCode.length < 4) {
      showAlert(
        "Código incompleto",
        "Ingresa tu código de verificación.",
        "alert-circle"
      );
      return;
    }
    try {
      setLoadingVerify(true);

      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token ?? null;
      if (!token) {
        showAlert(
          "Sesión requerida",
          "Inicia sesión para verificar tu cuenta.",
          "lock-closed"
        );
        return;
      }

      const res = await otpVerify("verify_account", otpCode, token);
      if (res.ok) {
        setOtpModalVisible(false);
        showAlert(
          "¡Cuenta verificada!",
          "Tu verificación se completó con éxito.",
          "checkmark-circle"
        );
      } else {
        showAlert(
          "Código inválido",
          res?.reason ?? "Verifica tu código e intenta nuevamente.",
          "close-circle"
        );
      }
    } catch (e: any) {
      showAlert("Error al verificar", e?.message ?? "Intenta de nuevo.", "warning");
    } finally {
      setLoadingVerify(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Perfil */}
        <View style={styles.userRow}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>JD</Text>
            </View>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>Juan Díaz</Text>
            <Text style={styles.userEmail}>juan.diaz@example.com</Text>
          </View>
        </View>

        {/* Formulario */}
        <TitleForm text="Editar Perfil" size="md" />
        <FloatingInput label="Nombre" value="Juan Díaz" />
        <FloatingInput label="Telefono" value="+(504) 9201-1070" />
        <FloatingInput label="Correo Electrónico" value="nieto.lei@prueba.com" disabled />

        <TitleForm text="Seguridad" size="md" />
        <LinksApp name="KeyRound" title="Cambiar Contraseña" onPress={() => {}} />

        <LinksApp
          name="Verified"
          title={loadingGenerate ? "Generando código..." : "Verificar Cuenta"}
          // sin prop `disabled`; bloqueamos lógicamente
          onPress={() => {
            if (!loadingGenerate) handleVerifyAccount();
          }}
        />

        {/* Botones mitad y mitad */}
        <View style={styles.buttonsRow}>
          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {}}
              activeOpacity={0.8}
            >
              <Icono name="Trash" size={20} color="#dc2626" />
              <Text style={styles.deleteText}>Eliminar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => {}}
              activeOpacity={0.8}
            >
              <Icono name="Check" size={20} color="#fff" />
              <Text style={styles.saveText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Modal OTP */}
      <Modal
        isVisible={otpModalVisible}
        onBackdropPress={() => setOtpModalVisible(false)}
        onBackButtonPress={() => setOtpModalVisible(false)}
        backdropOpacity={0.35}
        animationIn="zoomIn"
        animationOut="zoomOut"
      >
        <View style={styles.otpModal}>
          <Ionicons name="key" size={48} color="#eab308" />
          <Text style={styles.otpTitle}>Ingresa tu código</Text>
          <Text style={styles.otpSubtitle}>Te enviamos un código de 6 dígitos.</Text>

          <TextInput
            style={styles.otpInput}
            placeholder="••••••"
            placeholderTextColor="#9ca3af"
            keyboardType="number-pad"
            maxLength={6}
            value={otpCode}
            onChangeText={setOtpCode}
            secureTextEntry={false}
            textAlign="center"
          />

          <View style={styles.otpActions}>
            <TouchableOpacity
              style={[styles.otpButton, styles.otpCancel]}
              onPress={() => setOtpModalVisible(false)}
              disabled={loadingVerify}
            >
              <Text style={styles.otpCancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.otpButton, styles.otpConfirm]}
              onPress={handleSubmitOtp}
              disabled={loadingVerify}
            >
              {loadingVerify ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.otpConfirmText}>Verificar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* AlertModal */}
      <AlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        icon={alertIcon}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFD600" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD600",
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  backButton: { padding: 6, borderRadius: 20 },
  content: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  userRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  avatarContainer: { marginRight: 16 },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#facc15",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#fff", fontSize: 26, fontWeight: "bold" },
  userInfo: { flexDirection: "column" },
  userName: { fontSize: 18, fontWeight: "bold", color: "#1e293b" },
  userEmail: { fontSize: 14, color: "#52525b", marginTop: 4 },

  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 10,
  },
  buttonWrapper: { flex: 1 },
  deleteButton: {
    width: "100%",
    height: 45,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fee2e2",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  deleteText: { color: "#dc2626", fontWeight: "600", fontSize: 15 },
  saveButton: {
    width: "100%",
    height: 45,
    backgroundColor: "#22c55e",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  saveText: { color: "#fff", fontWeight: "600", fontSize: 15 },

  otpModal: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  otpTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginTop: 10,
  },
  otpSubtitle: {
    textAlign: "center",
    color: "#4b5563",
    fontSize: 14,
    marginTop: 6,
    marginBottom: 14,
  },
  otpInput: {
    width: "65%",
    height: 52,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    fontSize: 22,
    letterSpacing: 6,
    color: "#111827",
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  otpActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 6,
  },
  otpButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  otpCancel: { backgroundColor: "#f3f4f6" },
  otpCancelText: { color: "#111827", fontWeight: "700" },
  otpConfirm: { backgroundColor: "#22c55e" },
  otpConfirmText: { color: "white", fontWeight: "700" },
});
