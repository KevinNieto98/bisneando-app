import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddressFormScreen() {

  const { lat, lng } = useLocalSearchParams<{ lat?: string; lng?: string }>();

useEffect(() => {
  if (lat && lng) {
    const latitude = Number(lat);
    const longitude = Number(lng);
    // Aquí puedes guardar en estado, prellenar campos, hacer reverse geocoding, etc.
    console.log("coords recibidas:", { latitude, longitude });
  }
}, [lat, lng]);



  const navigation = useNavigation();

  const [tipoDireccion, setTipoDireccion] = useState<"Casa" | "Trabajo" | "Otro">("Casa");
  const [nombreDireccion, setNombreDireccion] = useState("");
  const [colonia, setColonia] = useState("");
  const [referencia, setReferencia] = useState("");

  const handleSave = () => {
    console.log({
      tipoDireccion,
      nombreDireccion,
      colonia,
      referencia,
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />

      {/* Header amarillo solo con back */}
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
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Título dentro del contenido */}
          <Text style={styles.title}>Nueva dirección</Text>

          {/* Tipo de dirección */}
          <Text style={styles.label}>Tipo de dirección</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                tipoDireccion === "Casa" && styles.typeButtonActive,
              ]}
              onPress={() => setTipoDireccion("Casa")}
            >
              <Ionicons
                name="home-outline"
                size={22}
                color={tipoDireccion === "Casa" ? "#fff" : "#1e293b"}
              />
              <Text
                style={[
                  styles.typeText,
                  tipoDireccion === "Casa" && styles.typeTextActive,
                ]}
              >
                Casa
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                tipoDireccion === "Trabajo" && styles.typeButtonActive,
              ]}
              onPress={() => setTipoDireccion("Trabajo")}
            >
              <Ionicons
                name="briefcase-outline"
                size={22}
                color={tipoDireccion === "Trabajo" ? "#fff" : "#1e293b"}
              />
              <Text
                style={[
                  styles.typeText,
                  tipoDireccion === "Trabajo" && styles.typeTextActive,
                ]}
              >
                Oficina
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                tipoDireccion === "Otro" && styles.typeButtonActive,
              ]}
              onPress={() => setTipoDireccion("Otro")}
            >
              <Ionicons
                name="location-outline"
                size={22}
                color={tipoDireccion === "Otro" ? "#fff" : "#1e293b"}
              />
              <Text
                style={[
                  styles.typeText,
                  tipoDireccion === "Otro" && styles.typeTextActive,
                ]}
              >
                Otro
              </Text>
            </TouchableOpacity>
          </View>

          {/* Nombre dirección */}
          <Text style={styles.label}>Nombre de la dirección</Text>
          <TextInput
            style={styles.input}
            placeholder="Ejemplo: Casa mamá, apartamento, oficina principal..."
            placeholderTextColor="#9ca3af"
            value={nombreDireccion}
            onChangeText={setNombreDireccion}
          />

          {/* Colonia */}
          <Text style={styles.label}>Colonia</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => console.log("Seleccionar colonia")}
          >
            <Text style={[styles.selectorText, colonia ? styles.textSelected : {}]}>
              {colonia || "Seleccionar colonia"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6b7280" />
          </TouchableOpacity>

          {/* Referencia */}
          <Text style={styles.label}>Referencia</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={6} // más grande
            placeholder="Ejemplo: Casa verde con portón blanco frente a la pulpería"
            placeholderTextColor="#9ca3af"
            value={referencia}
            onChangeText={setReferencia}
          />

          {/* Botón guardar */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Guardar dirección</Text>
          </TouchableOpacity>
        </ScrollView>
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
    marginRight: 8,
    padding: 6,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 10,
  },
  label: {
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
    marginTop: 16,
  },
  typeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginHorizontal: 4,
  },
  typeButtonActive: {
    backgroundColor: "#facc15",
    borderColor: "#facc15",
  },
  typeText: {
    marginLeft: 6,
    fontWeight: "600",
    color: "#1e293b",
  },
  typeTextActive: {
    color: "#fff",
  },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  selector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectorText: {
    color: "#9ca3af",
    fontSize: 14,
  },
  textSelected: {
    color: "#111827",
  },
  textArea: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
    textAlignVertical: "top",
    minHeight: 130, // más alto
  },
  saveButton: {
    marginTop: 28,
    backgroundColor: "#facc15",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
