import ModalDirecciones from "@/components/ModalDirecciones";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddressScreen() {
  const navigation = useNavigation();

  const [addresses] = useState([
    {
      id: 1,
      tipo_direccion: "Casa",
      referencia: "Colonia Kennedy, Tegucigalpa",
      icon: "home-outline",
    },
    {
      id: 2,
      tipo_direccion: "Trabajo",
      referencia: "Boulevard Suyapa, Edificio Torre Metrópolis",
      icon: "briefcase-outline",
    },
  ]);

  const [selectedAddress, setSelectedAddress] = useState<any>(null);

  const handleMenuPress = (addr: any) => {
    setSelectedAddress(addr);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />

      {/* Header amarillo */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Contenido blanco redondeado */}
      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Encabezado con título + botón agregar */}
          <View style={styles.topRow}>
            <Text style={styles.headerTitle}>Mis direcciones</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/set_address")}
            >
              <Ionicons name="add-outline" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Agregar</Text>
            </TouchableOpacity>
          </View>

          {/* Lista de direcciones */}
          {addresses.map((addr) => (
            <View key={addr.id} style={styles.card}>
              <View style={styles.cardLeft}>
                <Ionicons
                  name={addr.icon as any}
                  size={26}
                  color={
                    addr.tipo_direccion === "Trabajo" ? "#a16207" : "#eab308"
                  }
                />
                <View style={styles.textContainer}>
                  <Text style={styles.tipoDireccion}>{addr.tipo_direccion}</Text>
                  <Text style={styles.referencia}>{addr.referencia}</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => handleMenuPress(addr)}
                style={styles.menuButton}
              >
                <Ionicons name="ellipsis-vertical" size={20} color="#52525b" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Modal Direcciones */}
      {selectedAddress && (
        <ModalDirecciones
          isVisible={!!selectedAddress}
          onClose={() => setSelectedAddress(null)}
          tipo={selectedAddress.tipo_direccion}
          referencia={selectedAddress.referencia}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFD600", // amarillo superior
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD600",
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  backButton: {
    marginRight: 8,
    padding: 6,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#facc15",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 4,
    fontSize: 14,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  textContainer: {
    marginLeft: 10,
    flexShrink: 1,
  },
  tipoDireccion: {
    fontWeight: "700",
    color: "#1e293b",
    fontSize: 15,
  },
  referencia: {
    color: "#52525b",
    fontSize: 13,
    marginTop: 2,
  },
  menuButton: {
    padding: 4,
  },
});
