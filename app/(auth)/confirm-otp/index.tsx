import AlertModal from "@/components/ui/AlertModal";
import LoginButton from "@/components/ui/LoginButton";
import { supabase } from "@/lib/supabase";
import { signupRequest } from "@/services/api";
import { useSignupDraft } from "@/store/useSignupDraft";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ConfirmOTPPage() {
  const { draft, clearDraft } = useSignupDraft();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMsg, setModalMsg] = useState("");

  const show = (m: string) => { setModalMsg(m); setModalVisible(true); };

  const verifyOtp = async () => {
    if (!otp.trim()) {
      show("Ingresa el código OTP.");
      return;
    }
    if (!draft) {
      show("No hay información de registro. Vuelve a la pantalla anterior.");
      return;
    }

    try {
      setIsLoading(true);

      // TODO: Aquí deberías validar el OTP contra tu backend/servicio
      // Ejemplo simulado: OTP de 6 dígitos "123456"
      const isValid = otp.trim() === "123456";
      if (!isValid) {
        show("Código OTP inválido.");
        return;
      }

      // OTP OK -> ahora sí creamos la cuenta
      const res = await signupRequest({
        nombre: draft.nombre,
        apellido: draft.apellido,
        telefono: draft.telefono,
        correo: draft.correo,
        password: draft.password,
        id_perfil: 1,
      });

      if (!res.ok) {
        show(res.message ?? "No se pudo crear la cuenta.");
        return;
      }

      if (res.status === "created") {
        const at = res.tokens?.access_token;
        const rt = res.tokens?.refresh_token;

        if (at && rt) {
          const { error: setErr } = await supabase.auth.setSession({
            access_token: at,
            refresh_token: rt,
          });
          if (setErr) {
            show("Cuenta creada, pero no se pudo establecer la sesión local.");
            return;
          }
        }

        clearDraft();
        router.replace("/(tabs)/home?welcome=1");
        return;
      }

      // pending_confirmation
      show("Registro creado. Revisa tu correo para verificar tu cuenta.");
    } catch (err) {
      console.error(err);
      show("Ocurrió un error al registrarte. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Confirma tu OTP</Text>
        <Text style={styles.subtitle}>
          Ingresa el código que enviamos a tu correo {draft?.correo ? `(${draft.correo})` : ""}.
        </Text>

        <TextInput
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          placeholder="••••••"
          style={styles.input}
          maxLength={6}
        />

        <LoginButton
          title={isLoading ? "Verificando..." : "Confirmar código"}
          onPress={verifyOtp}
          disabled={isLoading}
        />
      </View>

      <AlertModal
        visible={modalVisible}
        title="Aviso"
        message={modalMsg}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#facc15" },
  container: {
    flex: 1, padding: 20, gap: 16,
    alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 24, fontWeight: "800", color: "#1f2937", textAlign: "center" },
  subtitle: { fontSize: 14, color: "#374151", textAlign: "center" },
  input: {
    width: 160, height: 56, backgroundColor: "white",
    borderRadius: 12, paddingHorizontal: 16, fontSize: 20, textAlign: "center",
  },
});
