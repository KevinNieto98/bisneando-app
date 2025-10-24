// components/ModalDirecciones.tsx
import { eliminarDireccion } from "@/services/api";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";
import ConfirmModal from "./ui/ConfirmModal";
import Icono from "./ui/Icon.native";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  id_direccion: number;
  tipo: number;
  nombre_direccion: string;
  referencia: string;
  iconName?: string;
  /** NUEVO: callback para notificar que se borró */
  onDeleted?: (id: number) => void;
}

type ConfirmAction = "edit" | "delete" | null;

export default function ModalDirecciones({
  isVisible,
  onClose,
  id_direccion,
  tipo,
  nombre_direccion,
  referencia,
  iconName = "MapPin",
  onDeleted, // 👈
}: Props) {
  const [confirm, setConfirm] = React.useState<{ visible: boolean; action: ConfirmAction }>({
    visible: false,
    action: null,
  });

  const openConfirm = (action: ConfirmAction) => setConfirm({ visible: true, action });
  const closeConfirm = () => setConfirm({ visible: false, action: null });

  const handleConfirm = async () => {
    console.log("ID de dirección:", id_direccion);

    if (confirm.action === "edit") {
      router.push("/new_address");
    }

    if (confirm.action === "delete") {
      const res = await eliminarDireccion(id_direccion);
      if (res.ok) {
        console.log("Eliminada:", res.deletedId);
        // 👇 Notifica al padre para refrescar y mostrar banner
        onDeleted?.(res.deletedId);
      } else {
        alert(res.message);
      }
    }

    closeConfirm();
    onClose(); // cerrar el modal
  };

  const isEdit = confirm.action === "edit";
  const confirmTitle = isEdit ? "Editar dirección" : "Eliminar dirección";
  const confirmMessage = isEdit
    ? `¿Deseas editar la dirección "${nombre_direccion}"?`
    : `¿Seguro que deseas eliminar la dirección "${nombre_direccion}"?`;
  const confirmIcon = isEdit ? "create-outline" : "trash-outline";
  const confirmCTA = isEdit ? "Sí, editar" : "Sí, eliminar";

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose} style={styles.modal}>
      <View style={styles.modalContent}>
        <View style={styles.titleRow}>
          <Icono name={iconName} size={22} color="#1e293b" />
          <Text style={styles.title}>{nombre_direccion}</Text>
        </View>

        <Text style={styles.address}>{referencia}</Text>

        <TouchableOpacity onPress={() => openConfirm("edit")} style={styles.option}>
          <Icono name="Pencil" size={18} color="#1e293b" />
          <Text style={styles.optionText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => openConfirm("delete")} style={[styles.option, styles.deleteOption]}>
          <Icono name="Trash2" size={18} color="#dc2626" />
          <Text style={[styles.optionText, styles.deleteText]}>Eliminar</Text>
        </TouchableOpacity>
      </View>

      <ConfirmModal
        visible={confirm.visible}
        title={confirmTitle}
        message={confirmMessage}
        icon={confirmIcon}
        confirmText={confirmCTA}
        cancelText="Cancelar"
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: { justifyContent: "flex-end", margin: 0 },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  titleRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  title: { fontSize: 20, fontWeight: "bold", marginLeft: 8, color: "#1e293b" },
  address: { fontSize: 14, color: "#444", marginBottom: 20 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    marginBottom: 10,
  },
  optionText: { fontSize: 16, marginLeft: 10, color: "#1e293b", fontWeight: "500" },
  deleteOption: { backgroundColor: "#fef2f2" },
  deleteText: { color: "#dc2626", fontWeight: "600" },
});
