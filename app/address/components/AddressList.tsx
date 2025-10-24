import { AddressListSkeleton } from "@/components";
import CardAddress from "@/components/CardAddress";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Addr = {
  id: number;
  tipo_direccion: number;
  nombre_direccion: string;
  referencia: string;
  isPrincipal?: boolean;
};

type Props = {
  isLoading: boolean;
  empty: boolean;
  addresses: Addr[];
  selectedId: number | null;
  onPressCard: (id: number | string) => void;
  onPressMenu: (id: number | string) => void;
};

export default function AddressList({
  isLoading,
  empty,
  addresses,
  selectedId,
  onPressCard,
  onPressMenu,
}: Props) {
  if (isLoading) return <AddressListSkeleton count={2} />;

  if (empty)
    return (
      <View style={{ paddingVertical: 24, alignItems: "center" }}>
        <Ionicons name="location-outline" size={36} color="#9ca3af" />
        <Text style={{ color: "#6b7280", marginTop: 8 }}>
          Aún no tienes direcciones guardadas.
        </Text>
      </View>
    );

  return (
    <View style={styles.listWrap}>
      {addresses.map((addr) => (
        <CardAddress
          key={addr.id}
          id={addr.id}
          tipo_direccion={addr.tipo_direccion}
          nombre_direccion={addr.nombre_direccion}
          referencia={addr.referencia}
          // 👉 solo se pinta por selección (no por principal)
          isPrincipal={false}
          isSelected={addr.id === selectedId}
          onPressCard={onPressCard}
          onPressMenu={onPressMenu}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  listWrap: { paddingTop: 0 },
});
