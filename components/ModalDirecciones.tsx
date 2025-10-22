// components/ModalDirecciones.tsx
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";
import Icono from "./ui/Icon.native";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  tipo: number;
  referencia: string;
  iconName?: string; // 👈 nuevo prop para el icono
}

export default function ModalDirecciones({
  isVisible,
  onClose,
  tipo,
  referencia,
  iconName = "MapPin", // fallback
}: Props) {
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modal}
    >
      <View style={styles.modalContent}>
        {/* Encabezado con icono + tipo */}
        <View style={styles.titleRow}>
          <Icono name={iconName} size={22} color="#1e293b" />
          <Text style={styles.title}>{tipo}</Text>
        </View>

        {/* Dirección */}
        <Text style={styles.address}>{referencia}</Text>

        {/* Botón Editar */}
        <TouchableOpacity 
            onPress={() => router.push("/new_address")}
            style={styles.option}
        >
          <Icono name="Pencil" size={18} color="#1e293b" />
          <Text style={styles.optionText}>Editar</Text>
        </TouchableOpacity>

        {/* Botón Eliminar */}
        <TouchableOpacity style={[styles.option, styles.deleteOption]}>
          <Icono name="Trash2" size={18} color="#dc2626" />
          <Text style={[styles.optionText, styles.deleteText]}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8, // espacio entre icono y texto
    color: "#1e293b",
  },
  address: {
    fontSize: 14,
    color: "#444",
    marginBottom: 20,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: "#f9fafb", // gris suave
    borderRadius: 10,
    marginBottom: 10,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 10,
    color: "#1e293b",
    fontWeight: "500",
  },
  deleteOption: {
    backgroundColor: "#fef2f2", // rojo suave
  },
  deleteText: {
    color: "#dc2626",
    fontWeight: "600",
  },
});
