import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

export type TipoDireccionId = 1 | 2 | 3; // 1=Casa, 2=Trabajo, 3=Otro

export type CardAddressProps = {
  id: number | string;
  tipo_direccion: TipoDireccionId;     // <-- ahora es numérico
  nombre_direccion: string;
  iconOverride?: keyof typeof Ionicons.glyphMap; // opcional para forzar ícono
  isPrincipal?: boolean;
  onTogglePrincipal?: (id: number | string, next: boolean) => void;
  onPressMenu?: (id: number | string) => void;
};

// 🎨 Colores de marca / UI
const BRAND_YELLOW = "#facc15";
const WORK_BROWN = "#a16207";
const GRAY_ON = "#d4d4d8";

function getTipoMeta(tipo: TipoDireccionId) {
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
  isPrincipal = false,
  onTogglePrincipal,
  onPressMenu,
}) => {
  const meta = getTipoMeta(tipo_direccion);
  const iconName = iconOverride ?? meta.icon;
  const accent = meta.color;

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <Ionicons name={iconName} size={26} color={accent} />
        <View style={styles.texts}>
          <View style={styles.row}>
            <Text style={styles.tipo}>{meta.label}</Text>
            {isPrincipal && (
              <View style={styles.badge}>
                <Ionicons name="star" size={12} color="#fff" />
                <Text style={styles.badgeText}>Principal</Text>
              </View>
            )}
          </View>
          <Text style={styles.nombre} numberOfLines={2}>
            {nombre_direccion}
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        {/* switch (sin texto arriba) */}
        <View style={styles.switchPill}>
          <Switch
            value={isPrincipal}
            onValueChange={(next) => onTogglePrincipal?.(id, next)}
            trackColor={{ false: GRAY_ON, true: BRAND_YELLOW }}
            thumbColor={Platform.OS === "android" ? "#ffffff" : undefined}
            ios_backgroundColor={GRAY_ON}
            style={styles.switch}
            accessibilityLabel="Marcar como principal"
          />
        </View>

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
  switchPill: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    backgroundColor: "#f3f4f6",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  switch: { transform: [{ scale: 0.95 }] },
  menuBtn: { padding: 6, marginLeft: 8, borderRadius: 10 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f59e0b",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: { color: "#fff", fontSize: 10, marginLeft: 4, fontWeight: "700" },
});
