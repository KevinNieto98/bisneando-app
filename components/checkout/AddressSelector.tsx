import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import EditButton from "../ui/EditButton";
import Icono from "../ui/Icon.native";

export function AddressSelector({ addresses, selectedId, onSelect }: any) {
  const getIconName = (tipo: string) => {
    const lower = tipo.toLowerCase();
    if (lower.includes("casa")) return "Home";
    if (lower.includes("oficina") || lower.includes("trabajo")) return "Building2";
    return "MapPin";
  };

  // ✅ Mostrar máximo 3 direcciones
  const visibleAddresses = addresses.slice(0, 3);

  return (
    <View style={styles.section}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Dirección de entrega</Text>
        <EditButton/>
      </View>

      {/* Grid de direcciones */}
      <View style={styles.grid}>
        {visibleAddresses.map((addr: any) => {
          const isSelected = selectedId === addr.id;
          return (
            <Pressable
              key={addr.id}
              onPress={() => onSelect(addr.id)}
              style={({ pressed }) => [
                styles.card,
                isSelected && styles.selected,
                pressed && { transform: [{ scale: 0.97 }] },
              ]}
            >
              <View style={styles.iconRow}>
                <View
                  style={[
                    styles.iconContainer,
                    isSelected && styles.iconContainerSelected,
                  ]}
                >
                  <Icono
                    name={getIconName(addr.tipo_direccion)}
                    size={20}
                    color={isSelected ? "#fff" : "#2563eb"}
                  />
                </View>
                <Text
                  style={[
                    styles.tipoDireccion,
                    isSelected && { color: "#2563eb" },
                  ]}
                >
                  {addr.tipo_direccion}
                </Text>
              </View>

              <View style={styles.infoContainer}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={styles.nombre}
                >
                  {addr.nombre_direccion}
                </Text>
                {addr.telefono && (
                  <Text style={styles.telefono}>{addr.telefono}</Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: "700", color: "#111827" },

  // ✨ Botón de editar mejorado
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  editText: {
    color: "#2563eb",
    fontWeight: "600",
    fontSize: 13,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    height: 95,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#f9fafb",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 8,
    justifyContent: "space-between",
  },
  selected: {
    borderColor: "#2563eb",
    backgroundColor: "#f0f9ff",
    shadowColor: "#2563eb",
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconContainer: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "#e0e7ff",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainerSelected: {
    backgroundColor: "#2563eb",
  },
  tipoDireccion: {
    fontWeight: "600",
    fontSize: 13,
    color: "#374151",
  },
  infoContainer: {
    marginTop: 6,
  },
  nombre: {
    fontSize: 13,
    fontWeight: "500",
    color: "#111827",
  },
  telefono: {
    fontSize: 12,
    color: "#6b7280",
  },
});
