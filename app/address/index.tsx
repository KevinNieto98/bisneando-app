// app/(app)/address/AddressScreen.tsx

import ModalDirecciones from "@/components/ModalDirecciones";
import { Button } from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";
import { Direccion, fetchDireccionesByUid } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AddressHeader from "./components/AddressHeader";
import AddressList from "./components/AddressList";
import AddressSuccessBanner from "./components/AddressSuccessBanner";

type Addr = {
  id: number;
  tipo_direccion: number;
  nombre_direccion: string;
  referencia: string;
  isPrincipal?: boolean;
};

export default function AddressScreen() {
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

  // (Opcional) perfil
  useProfile(uid ?? undefined);

  // ---- estado UI/negocio ----
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addresses, setAddresses] = useState<Addr[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Addr | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null); // 👉 seleccionada en UI
  const [successMsg, setSuccessMsg] = useState<string>("");

  // Confirmación del botón "Usar"
  const [showUseConfirm, setShowUseConfirm] = useState(false);

  // solo seleccionar auto en el PRIMER load
  const firstLoadRef = useRef(true);

  // ---- fetch direcciones ----
  const fetchData = async (hard = false) => {
    if (!uid) return;
    if (hard) setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;

      const rows: Direccion[] = await fetchDireccionesByUid(uid, { token });

      const mapped: Addr[] = rows.map((r) => ({
        id: r.id_direccion,
        tipo_direccion: r.tipo_direccion,
        nombre_direccion: r.nombre_direccion ?? "Sin nombre",
        referencia: r.referencia ?? "",
        isPrincipal: !!r.isPrincipal,
      }));

      setAddresses(mapped);

      // ✅ Primer load: seleccionar la principal
      if (firstLoadRef.current) {
        const principal = mapped.find((m) => m.isPrincipal);
        setSelectedId(principal?.id ?? null);
        firstLoadRef.current = false;
      }
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

  // Auto-ocultar banner verde
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(""), 1600);
    return () => clearTimeout(t);
  }, [successMsg]);

  const handlePressCard = (id: number | string) => {
    const n = Number(id);
    setSelectedId((prev) => (prev === n ? null : n));
  };

  const handlePressMenu = (id: number) => {
    const addr = addresses.find((a) => a.id === id) || null;
    setSelectedAddress(addr);
  };

  const handleDeleted = async (_id: number) => {
    setSuccessMsg("Dirección borrada con éxito");
    await fetchData(true);
    setSelectedAddress(null);
    setSelectedId((prev) => (prev === _id ? null : prev));
  };

  // Abrir modal del botón "Usar"
  const openUseConfirm = () => {
    if (selectedId == null) {
      Alert.alert("Selecciona una dirección", "Por favor elige una dirección de la lista.");
      return;
    }
    setShowUseConfirm(true);
  };

  // Confirmación del modal: de momento solo console.log
  const confirmUse = () => {
    if (selectedId != null) {
        // Aquí luego puedes llamar a tu endpoint PATCH para setear principal,
      // y tras éxito hacer fetchData(true)
    }
    setShowUseConfirm(false);
  };

  const empty = !isLoading && addresses.length === 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.push("/(tabs)/profile")} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />


      <View style={styles.content}>
      <AddressHeader onBack={() => router.back()} onAdd={() => router.push("/set_address")} />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchData(false);
              }}
            />
          }
        >
          <AddressSuccessBanner message={successMsg} />

          <AddressList
            isLoading={isLoading}
            empty={empty}
            addresses={addresses}
            selectedId={selectedId}
            onPressCard={handlePressCard}
            onPressMenu={(id) => handlePressMenu(id as number)}
          />
        </ScrollView>

        {/* Botón flotante centrado abajo */}
        <View style={styles.fabWrap}>
          <Button
            title="Usar"
            iconName="Pin"
            onPress={openUseConfirm}     // 👈 abre el ConfirmModal
            variant="warning"
            style={styles.ctaButton}
          />
        </View>
      </View>

      {/* Modal Direcciones (acciones Editar/Eliminar) */}
      {selectedAddress && (
        <ModalDirecciones
          isVisible={!!selectedAddress}
          onClose={() => setSelectedAddress(null)}
          id_direccion={selectedAddress.id}
          tipo={selectedAddress.tipo_direccion}
          nombre_direccion={selectedAddress.nombre_direccion}
          referencia={selectedAddress.referencia}
          onDeleted={handleDeleted}
        />
      )}

      {/* Modal de confirmación al tocar "Usar" */}
      <ConfirmModal
        visible={showUseConfirm}
        title="Confirmación"
        message="¿Estás seguro que deseas cambiar la dirección principal?"
        icon="help-circle"
        confirmText="Sí, cambiar"
        cancelText="Cancelar"
        onConfirm={confirmUse}                // 👈 console.log del id
        onCancel={() => setShowUseConfirm(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFD600" },
  content: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

  // botón flotante
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
    backButton: { marginRight: 8, padding: 6, borderRadius: 20, alignSelf: "flex-start" },
});
