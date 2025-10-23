import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type CardAddressProps = {
  id: number | string;
  tipo_direccion: number;
  nombre_direccion: string;
  iconOverride?: keyof typeof Ionicons.glyphMap;
  isPrincipal?: boolean;
  referencia?: string;
  onTogglePrincipal?: (id: number | string, next: boolean) => void;
  onPressMenu?: (id: number | string) => void;
};

// 🎨 Colores de marca / UI
const BRAND_YELLOW = "#facc15";
const WORK_BROWN = "#a16207";
const GRAY_ON = "#d4d4d8";

function getTipoMeta(tipo: number) {
  switch (tipo) {
    case 1:
      return { label: "Casa", icon: "home-outline" as const, color: BRAND_YELLOW };
    case 2:
      return { label: "Trabajo", icon: "briefcase-outline" as const, color: WORK_BROWN };
    case 3:
    default:
      return { label: "Otro", icon: "location-outline" as const, color: BRAND_YELLOW };
  }
}

const CardAddress: React.FC<CardAddressProps> = ({
  id,
  tipo_direccion,
  nombre_direccion,
  iconOverride,
  referencia,
  isPrincipal = false,
  onTogglePrincipal,
  onPressMenu,
}) => {
  const meta = getTipoMeta(tipo_direccion);

  const iconName = iconOverride ?? meta.icon;

  // Estilos dinámicos para resaltar la tarjeta principal
  const cardStyle = [
    styles.card,
    isPrincipal && {
      backgroundColor: "#fef3c7", // amber-100
      borderColor: "#f59e0b",     // amber-500
      shadowColor: "#f59e0b",
      shadowOpacity: 0.25,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      ...(Platform.OS === "android" ? { elevation: 2 } : null),
    },
  ];

  return (
    <View style={cardStyle}>
      {/* Toca la parte izquierda para marcar como principal */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.left}
        onPress={() => onTogglePrincipal?.(id, true)}
        accessibilityLabel="Marcar esta dirección como principal"
      >
        {/* Icono dentro de círculo amarillo */}
        <View style={[styles.iconCircle, isPrincipal && styles.iconCirclePrincipal]}>
          <Ionicons name={iconName} size={18} color="#111827" /> 
          {/* negro: #111827 */}
        </View>

        <View style={styles.texts}>
          <View style={styles.row}>
            <Text style={styles.tipo}>{nombre_direccion}</Text>
            {isPrincipal && (
              <View style={styles.badge}>
                <Ionicons name="star" size={12} color="#fff" />
                <Text style={styles.badgeText}>Principal</Text>
              </View>
            )}
          </View>
          <Text style={styles.nombre} numberOfLines={2}>
            {referencia}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.right}>
        <TouchableOpacity onPress={() => onPressMenu?.(id)} style={styles.menuBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color="#52525b" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CardAddress;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    justifyContent: "space-between",
  },
  left: { flexDirection: "row", alignItems: "center", flex: 1 },
  texts: { marginLeft: 10, flexShrink: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  tipo: { fontWeight: "700", color: "#1e293b", fontSize: 15 },
  nombre: { color: "#52525b", fontSize: 13, marginTop: 2, flexShrink: 1 },
  right: { flexDirection: "row", alignItems: "center" },
  menuBtn: { padding: 6, marginLeft: 8, borderRadius: 10 },

  // 🔵 Círculo para el icono
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: BRAND_YELLOW,
    alignItems: "center",
    justifyContent: "center",
  },
  // Opcional: cuando es principal, le damos un borde (“ring”) sutil
  iconCirclePrincipal: {
    borderWidth: 2,
    borderColor: "#f59e0b",
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f59e0b",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    marginLeft: 6,
  },
  badgeText: { color: "#fff", fontSize: 10, marginLeft: 4, fontWeight: "700" },
});
