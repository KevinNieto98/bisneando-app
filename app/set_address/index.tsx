// SetAddressScreen.tsx
import AlertModal from "@/components/ui/AlertModal";
import Button from "@/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { router } from "expo-router";
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

export default function SetAddressScreen() {
  const navigation = useNavigation();
  const mapRef = useRef<MapView | null>(null);

  const [loading, setLoading] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);

  // Región visible del mapa
  const [region, setRegion] = useState<Region>({
    latitude: 14.0723,
    longitude: -87.1921,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Coordenadas del centro del mapa (pin fijo)
  const [selectedCoord, setSelectedCoord] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLoading(false);
        setShowInstructions(true);
        return;
      }

      try {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const { latitude, longitude } = pos.coords;

        const close: Region = {
          latitude,
          longitude,
          latitudeDelta: 0.0035, // zoom cerca
          longitudeDelta: 0.0035,
        };

        setRegion(close);
        setSelectedCoord({ latitude, longitude });
        setLoading(false);
        setShowInstructions(true);

        requestAnimationFrame(() => mapRef.current?.animateToRegion(close, 400));
      } catch {
        setLoading(false);
        setShowInstructions(true);
      }
    })();
  }, []);

  const handleRegionChangeComplete = (r: Region) => {
    setRegion(r);
    setSelectedCoord({ latitude: r.latitude, longitude: r.longitude });

  };

const handleContinue = () => {
  if (!selectedCoord) return;

  router.push({
    pathname: "/new_address",
    params: {
      lat: String(selectedCoord.latitude),
      lng: String(selectedCoord.longitude),
    },
  });
};

  const PIN_SIZE = 44; // ajusta el tamaño del pin si lo quieres más grande/pequeño

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />

      {/* Header (siempre visible) */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.skeletonContainer}>
            <View style={styles.skeletonMap} />
            <View style={styles.skeletonBadges}>
              <View style={[styles.skeletonBar, { width: 220 }]} />
              <View style={[styles.skeletonBar, { width: 260, marginTop: 8 }]} />
            </View>
          </View>
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

            {/* Título/ayuda arriba */}
            <View style={styles.overlayTitle}>
              <Text style={styles.text}>¿Dónde llevamos tu pedido?</Text>
              <Text style={styles.textLight}>Coloca el pin en la dirección exacta</Text>
            </View>

            {/* Botón flotante centrado abajo */}
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

  /* Skeleton */
  skeletonContainer: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  skeletonMap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#e2e8f0",
  },
  skeletonBadges: {
    position: "absolute",
    top: 16,
    alignSelf: "center",
    alignItems: "center",
  },
  skeletonBar: {
    height: 16,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
  },

  /* Pin fijo */
  centerPinContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -22, // la mitad de PIN_SIZE (ajusta si cambias PIN_SIZE)
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
