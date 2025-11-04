// SetAddressScreen.tsx
import { MapSkeleton } from "@/components";
import AlertModal from "@/components/ui/AlertModal";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal"; // 👈 importa tu modal
import { fetchDireccionById } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

type Params = { isEdit?: string; id_direccion?: string };

type Prefill = {
  id_direccion: number;
  id_colonia: number | null;
  nombre_direccion: string | null;
  referencia: string | null;
  tipo_direccion: number;
  latitude: number;
  longitude: number;
} | null;

export default function SetAddressScreen() {
  const navigation = useNavigation();
  const mapRef = useRef<MapView | null>(null);
  const { isEdit, id_direccion } = useLocalSearchParams<Params>();

  const [loading, setLoading] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false); // 👈 para el ConfirmModal

  const [prefill, setPrefill] = useState<Prefill>(null);

  // Región visible del mapa (fallback inicial)
  const [region, setRegion] = useState<Region>({
    latitude: 14.0723,
    longitude: -87.1921,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Coordenadas del centro del mapa (pin fijo)
  const [selectedCoord, setSelectedCoord] = useState<{ latitude: number; longitude: number } | null>(null);

  const editMode =
    isEdit === "1" || isEdit?.toLowerCase() === "true" || isEdit === "yes";

  // Centrar mapa y fijar pin
  const centerMap = (lat: number, lng: number, animate = true) => {
    const close: Region = {
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.0035,
      longitudeDelta: 0.0035,
    };
    setRegion(close);
    setSelectedCoord({ latitude: lat, longitude: lng });
    if (animate) requestAnimationFrame(() => mapRef.current?.animateToRegion(close, 400));
  };

  // Carga inicial
  useEffect(() => {
    (async () => {
      try {
        const idNum = id_direccion ? Number(id_direccion) : NaN;

        if (editMode && Number.isFinite(idNum) && idNum > 0) {
          const dir = await fetchDireccionById(idNum);
          if (dir?.latitude != null && dir?.longitude != null) {
            centerMap(Number(dir.latitude), Number(dir.longitude));
            setPrefill({
              id_direccion: idNum,
              id_colonia: dir.id_colonia != null ? Number(dir.id_colonia) : null,
              nombre_direccion: dir.nombre_direccion ?? null,
              referencia: dir.referencia ?? null,
              tipo_direccion: Number(dir.tipo_direccion),
              latitude: Number(dir.latitude),
              longitude: Number(dir.longitude),
            });
            setLoading(false);
            setShowInstructions(true);
            return;
          }
        }

        // Fallback: ubicación del usuario
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLoading(false);
          setShowInstructions(true);
          return;
        }

        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        centerMap(pos.coords.latitude, pos.coords.longitude);
        setLoading(false);
        setShowInstructions(true);
      } catch {
        setLoading(false);
        setShowInstructions(true);
      }
    })();
  }, [editMode, id_direccion]);

  const handleRegionChangeComplete = (r: Region) => {
    setRegion(r);
    setSelectedCoord({ latitude: r.latitude, longitude: r.longitude });
  };

  const { lastPage } = useLocalSearchParams<{ lastPage?: string }>();


  const handleContinue = () => {
    if (!selectedCoord) return;




    
    const params: Record<string, string> = {
      lat: String(selectedCoord.latitude),
      lng: String(selectedCoord.longitude),
      isEdit: editMode ? "1" : "0",

    };

    if (editMode && prefill) {
      params.id_direccion = String(prefill.id_direccion);
      if (prefill.nombre_direccion != null) params.nombre_direccion = String(prefill.nombre_direccion);
      if (prefill.referencia != null) params.referencia = String(prefill.referencia);
      params.tipo_direccion = String(prefill.tipo_direccion);
      if (prefill.id_colonia != null && Number.isFinite(prefill.id_colonia)) {
        params.id_colonia = String(prefill.id_colonia);
      }
    }

 router.push({
  pathname: "/new_address",
  params: {
    ...params, // lo que ya estabas enviando
    ...(lastPage === "checkout" ? { lastPage: "checkout" } : {}),
  },
});
  };

  // Back: abre confirmación en vez de goBack()
  const onPressBack = () => {
    setShowExitConfirm(true);
  };

  // Confirmar salida
  const confirmExit = () => {
    setShowExitConfirm(false);
    // navega a /address (reemplaza para evitar volver a este screen con back)
    router.replace("/address");
  };

  // Cancelar salida
  const cancelExit = () => {
    setShowExitConfirm(false);
  };

  const PIN_SIZE = 44;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onPressBack}           // 👈 abre confirmación
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        {loading ? (
          <MapSkeleton />
        ) : (
          <>
            <MapView
              ref={mapRef}
              style={StyleSheet.absoluteFillObject}
              initialRegion={region}
              onRegionChangeComplete={handleRegionChangeComplete}
              showsUserLocation
            />

            {/* Pin fijo centrado */}
            <View pointerEvents="none" style={styles.centerPinContainer}>
              <View style={[styles.pinShadow, { width: PIN_SIZE, height: PIN_SIZE }]} />
              <Ionicons
                name="location-sharp"
                size={PIN_SIZE}
                color="#ff3b30"
                style={styles.centerPin}
              />
            </View>

            {/* Título/ayuda */}
            <View style={styles.overlayTitle}>
              <Text style={styles.text}>¿Dónde llevamos tu pedido?</Text>
              <Text style={styles.textLight}>Coloca el pin en la dirección exacta</Text>
            </View>

            {/* Botón */}
            <View style={styles.fabWrap}>
              <Button
                title="Continuar"
                iconName="ChevronRight"
                onPress={handleContinue}
                isDisabled={!selectedCoord}
                variant="warning"
                style={styles.ctaButton}
              />
            </View>
          </>
        )}
      </View>

      {/* Modal de instrucciones */}
      <AlertModal
        visible={showInstructions}
        onClose={() => setShowInstructions(false)}
        title="Instrucciones"
        message={
          "Mueve el mapa para posicionar el marcador a la dirección deseada.\n\nTu pedido será entregado en la dirección que indiques."
        }
      />

      {/* Confirmación de salida */}
      <ConfirmModal
        visible={showExitConfirm}
        title="¿Salir de esta pantalla?"
        message="Si regresas ahora perderás los cambios no guardados."
        icon="alert-circle"
        confirmText="Sí, salir"
        cancelText="Cancelar"
        onConfirm={confirmExit}
        onCancel={cancelExit}
      />
    </SafeAreaView>
  );
}

/* =========================
   Estilos
   ========================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFD600" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD600",
    paddingHorizontal: 10,
    paddingVertical: 12,
    zIndex: 2,
  },
  backButton: { padding: 6, borderRadius: 20 },

  content: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },

  overlayTitle: {
    position: "absolute",
    top: 16,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  text: { fontSize: 18, fontWeight: "600", color: "#1e293b", textAlign: "center" },
  textLight: { fontSize: 16, fontWeight: "400", color: "#475569", textAlign: "center", marginTop: 2 },

  /* Pin fijo */
  centerPinContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -22, // la mitad de PIN_SIZE
    marginTop: -44,  // compensa la altura del icono para que la punta quede en el centro
    alignItems: "center",
    justifyContent: "center",
  },
  centerPin: {
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  pinShadow: {
    position: "absolute",
    bottom: -6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.12)",
    transform: [{ scaleX: 1.2 }, { scaleY: 0.35 }],
  },

  /* Botón flotante */
  fabWrap: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 18,
    alignItems: "center",
  },
  ctaButton: {
    width: "100%",
    maxWidth: 420,
  },
});
