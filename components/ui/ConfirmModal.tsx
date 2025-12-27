import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface ConfirmModalProps {
  visible: boolean;
  title?: string;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title = "Confirmación",
  message,
  icon = "help-circle",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent={Platform.OS === "android"}
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Ionicons name={icon} size={56} color="#22c55e" />
          {title ? <Text style={styles.title}>{title}</Text> : null}
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={onCancel} style={[styles.btn, styles.btnGhost]} activeOpacity={0.9}>
              <Text style={[styles.btnText, styles.btnGhostText]}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onConfirm} style={[styles.btn, styles.btnPrimary]} activeOpacity={0.9}>
              <Text style={styles.btnPrimaryText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginTop: 12,
    textAlign: "center",
  },
  message: {
    textAlign: "center",
    color: "#4b5563",
    fontSize: 15,
    marginTop: 8,
    marginBottom: 18,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 120,
    alignItems: "center",
  },
  btnGhost: { backgroundColor: "#f3f4f6" },
  btnGhostText: { color: "#374151" },
  btnPrimary: { backgroundColor: "#22c55e" },
  btnPrimaryText: { color: "white", fontWeight: "700", fontSize: 16 },
  btnText: { fontWeight: "700", fontSize: 16 },
});

export default ConfirmModal;
