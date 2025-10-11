import FloatingInput from "@/components/ui/FloatingInput";
import LinksApp from "@/components/ui/LinksApp";
import TitleForm from "@/components/ui/TitleForm";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icono from "../../components/ui/Icon.native";

export default function ProfileScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />

      {/* Header amarillo con botón back */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Contenido principal */}
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
        <LinksApp
          name="KeyRound"
          title="Cambiar Contraseña"
          onPress={() => console.log("Cambiar Contraseña presionado")}
        />

        {/* ⚡ Botones mitad y mitad */}
        <View style={styles.buttonsRow}>
          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => console.log("Eliminar Cuenta")}
              activeOpacity={0.8}
            >
              <Icono name="Trash" size={20} color="#dc2626" />
              <Text style={styles.deleteText}>Eliminar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonWrapper}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => console.log("Guardar Cambios presionado")}
              activeOpacity={0.8}
            >
              <Icono name="Check" size={20} color="#fff" />
              <Text style={styles.saveText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFD600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD600",
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  backButton: {
    padding: 6,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#facc15",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
  },
  userInfo: {
    flexDirection: "column",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  userEmail: {
    fontSize: 14,
    color: "#52525b",
    marginTop: 4,
  },

  // ⚡ Botones perfectamente iguales
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 10,
  },
  buttonWrapper: {
    flex: 1,
  },
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
  deleteText: {
    color: "#dc2626",
    fontWeight: "600",
    fontSize: 15,
  },
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
  saveText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
