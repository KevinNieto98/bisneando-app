import CardAddress from "@/components/CardAddress";
import ModalDirecciones from "@/components/ModalDirecciones";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AddressListSkeleton } from "@/components";
import { Button } from "@/components/ui/Button";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";
import { Direccion, fetchDireccionesByUid } from "@/services/api";

type Addr = {
  id: number;
  tipo_direccion: number;
  nombre_direccion: string;
  referencia: string ;
  icon: keyof typeof Ionicons.glyphMap;
  isPrincipal?: boolean;
};


export default function AddressScreen() {
  const navigation = useNavigation();

  // ---- uid de auth ----
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUid(data.user?.id ?? null);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUid(session?.user?.id ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // (Opcional) perfil para otros usos
  const { profile } = useProfile(uid ?? undefined);

  // ---- estado UI ----
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addresses, setAddresses] = useState<Addr[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Addr | null>(null);

  const fetchData = async (hard = false) => {
    if (!uid) return;
    if (hard) setIsLoading(true);
    try {
      // Si quieres enviar token (recomendado si tu GET requiere auth):
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;

      const rows: Direccion[] = await fetchDireccionesByUid(uid, {
        token,
        // principalOnly: false,
        // limit: 50,
        // offset: 0,
      });

      // Mapea a la forma que consume tu CardAddress
      const mapped: Addr[] = rows.map((r) => ({
        id: r.id_direccion,
        tipo_direccion: r.tipo_direccion,
        nombre_direccion: r.nombre_direccion ?? "Sin nombre",
        icon:
          r.tipo_direccion === 1
            ? "home-outline"
            : r.tipo_direccion === 2
            ? "briefcase-outline"
            : "location-outline",
        isPrincipal: !!r.isPrincipal,
        referencia: r.referencia ?? "",
      }));

      setAddresses(mapped);
      console.log('addresses', addresses);
      
    } catch (e: any) {
      console.error("fetch direcciones error:", e);
      Alert.alert("Error", e?.message ?? "No se pudieron cargar las direcciones.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (uid) fetchData(true);
  }, [uid]);

  const handleMenuPress = (id: number) => {
    const addr = addresses.find((a) => a.id === id) || null;
    setSelectedAddress(addr);
  };

  const handleTogglePrincipal = async (id: number, next: boolean) => {
    try {
      // UI: asegura una sola principal
      setAddresses((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, isPrincipal: next } : { ...a, isPrincipal: false }
        )
      );

      // TODO: persistir en backend con tu endpoint PATCH/POST para setear principal
      // const { data: session } = await supabase.auth.getSession();
      // await apiSetPrincipal({ id_direccion: id }, session.session?.access_token);

    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo actualizar principal.");
    }
  };

  const empty = !isLoading && addresses.length === 0;

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

      {/* Contenido blanco */}
      <View style={styles.content}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(false); }} />
          }
        >
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

          {/* Skeleton */}
          {isLoading && <AddressListSkeleton count={2} />}

          {/* Vacío */}
          {empty && (
            <View style={{ paddingVertical: 24, alignItems: "center" }}>
              <Ionicons name="location-outline" size={36} color="#9ca3af" />
              <Text style={{ color: "#6b7280", marginTop: 8 }}>
                Aún no tienes direcciones guardadas.
              </Text>
            </View>
          )}

          {/* Lista */}
          {!isLoading &&
            addresses.map((addr) => (
              <CardAddress
                key={addr.id}
                id={addr.id}
                tipo_direccion={addr.tipo_direccion}
                nombre_direccion={addr.nombre_direccion}
                referencia={addr.referencia}
                isPrincipal={!!addr.isPrincipal}
                //onTogglePrincipal={handleTogglePrincipal}
                onPressMenu={(id) => handleMenuPress(id as number)}
              />
            ))}
        </ScrollView>


      {/* Botón flotante centrado abajo */}
      <View style={styles.fabWrap}>
        <Button
          title="Usar"
          iconName="Pin"
          onPress={() => router.push("/set_address")}
          variant="warning"
          style={styles.ctaButton}
        />
      </View>
      </View>

      {/* Modal Direcciones */}
      {selectedAddress && (
        <ModalDirecciones
          isVisible={!!selectedAddress}
          onClose={() => setSelectedAddress(null)}
          tipo={selectedAddress.tipo_direccion}
          referencia={selectedAddress.nombre_direccion}
        />
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFD600" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD600",
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  backButton: { marginRight: 8, padding: 6, borderRadius: 20 },
  content: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1e293b" },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#facc15",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  addButtonText: { color: "#fff", fontWeight: "700", marginLeft: 4, fontSize: 14 },

  /* Botón flotante */
  fabWrap: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 50,
    alignItems: "center",
  },
  ctaButton: {
    width: "100%",
    maxWidth: 420,
  },
});
