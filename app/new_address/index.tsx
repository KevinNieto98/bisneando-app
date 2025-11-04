// app/address/form.tsx  (ajusta la ruta si difiere)
import AddressTypeSelector from "@/components/AddressSelector";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";
import {
  actualizarDireccion,
  Colonia,
  crearDireccion,
  fetchColoniasActivasConCobertura,
} from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
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
  const router = useRouter();
  const navigation = useNavigation();

  // --- params desde /new_address ---
  const {
    lat,
    lng,
    isEdit,
    id_direccion,
    nombre_direccion: pNombreDir,
    referencia: pReferencia,
    tipo_direccion: pTipoDir,
    id_colonia: pIdColonia, // viene desde set_address
  } = useLocalSearchParams<{
    lat?: string;
    lng?: string;
    isEdit?: string;
    id_direccion?: string;
    nombre_direccion?: string;
    referencia?: string;
    tipo_direccion?: string;
    id_colonia?: string;
  }>();

  const editMode =
    isEdit === "1" || isEdit?.toLowerCase() === "true" || isEdit === "yes";

  const targetColoniaId = useMemo(() => {
    const n = pIdColonia ? Number(pIdColonia) : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [pIdColonia]);

  // --- coords desde params ---
  const coords = useMemo(() => {
    const latitude = lat ? Number(lat) : undefined;
    const longitude = lng ? Number(lng) : undefined;
    return { latitude, longitude };
  }, [lat, lng]);

  useEffect(() => {
    if (coords.latitude != null && coords.longitude != null) {
    
    }
  }, [coords]);

  // --- auth: obtener uid de Supabase ---
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!mounted) return;
      if (error) {
        console.warn("No se pudo obtener usuario:", error.message);
        setUserId(undefined);
      } else {
        setUserId(data.user?.id);
      }
    };
    getUser();

    const { data: authSub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id);
    });

    return () => {
      mounted = false;
      authSub.subscription.unsubscribe();
    };
  }, []);

  // --- perfil del cliente ---
  const { profile } = useProfile(userId);

  // --- estado del formulario ---
  const [nombreDireccion, setNombreDireccion] = useState("");
  const [colonia, setColonia] = useState("");
  const [coloniaId, setColoniaId] = useState<number | null>(null);
  const [referencia, setReferencia] = useState("");
  const [tipoDireccion, setTipoDireccion] = useState(1); // 1=Casa

  // ✅ Prefill si isEdit = '1'
  useEffect(() => {
    if (editMode) {
      if (typeof pNombreDir === "string") setNombreDireccion(pNombreDir);
      if (typeof pReferencia === "string") setReferencia(pReferencia);
      if (typeof pTipoDir === "string") {
        const t = Number(pTipoDir);
        if (Number.isFinite(t) && t > 0) setTipoDireccion(t);
      }
    }
  }, [editMode, pNombreDir, pReferencia, pTipoDir]);

  // Setear coloniaId desde params (nombre se resuelve al cargar lista)
  useEffect(() => {
    if (targetColoniaId && !coloniaId) {
      setColoniaId(targetColoniaId);
    }
  }, [targetColoniaId, coloniaId]);

  // --- selector de colonias ---
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [items, setItems] = useState<Colonia[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 30;

  const flatListRef = useRef<FlatList<Colonia> | null>(null);

  // control anti-duplicado de requests
  const lastQueryRef = useRef<string>("");

  // Prefetch al entrar (una sola vez)
  useEffect(() => {
    (async () => {
      if (items.length > 0) return;
      await loadColonias(0, "", true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- confirm modal / saving ---
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
const { lastPage } = useLocalSearchParams<{ lastPage?: string }>();
  // --- confirmación al salir ---
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const onPressBack = () => {
    if (saving) return;
    setShowExitConfirm(true);
  };
  const confirmExit = () => {
    setShowExitConfirm(false);
    router.replace({
  pathname: "/address",
  params: lastPage === "checkout" ? { lastPage: "checkout" } : {},
});
  };
  const cancelExit = () => setShowExitConfirm(false);

  // debounce search
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onChangeSearch = (txt: string) => {
    setSearch(txt);
    setAutoFinding(false); // evita seguir autopaginando si el user escribe
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setOffset(0);
      setItems([]);
      setHasMore(true);
      loadColonias(0, txt, true);
    }, 350);
  };

  const loadColonias = useCallback(
    async (nextOffset?: number, term?: string, replace = false) => {
      // evita llamadas duplicadas para la misma key mientras está cargando
      const key = JSON.stringify({ term: term ?? search, nextOffset: nextOffset ?? offset, replace });
      if (lastQueryRef.current === key && loading) return;
      lastQueryRef.current = key;

      if (loading || (!hasMore && !replace)) return;
      setLoading(true);
      setErrorMsg(null);
      try {
        const data = await fetchColoniasActivasConCobertura({
          search: term ?? search,
          limit: pageSize,
          offset: nextOffset ?? offset,
          orderBy: "nombre_colonia",
          orderDir: "asc",
        });
        const newItems = Array.isArray(data) ? data : [];
        setItems((prev) => (replace ? newItems : [...prev, ...newItems]));
        setHasMore(newItems.length === pageSize);
        setOffset((prev) => (nextOffset ?? prev) + newItems.length);
      } catch (e: any) {
        console.error("loadColonias error:", e);
        setErrorMsg(e?.message || "No se pudieron cargar las colonias.");
      } finally {
        setLoading(false);
      }
    },
    [loading, hasMore, offset, search]
  );

  // Auto-asignar colonia y nombre cuando aparezca en items
  const [autoFinding, setAutoFinding] = useState(false);
  useEffect(() => {
    // ⚠️ No autopaginar si el selector está abierto o si hay búsqueda activa
    if (!coloniaId || selectorOpen || (search && search.trim().length > 0)) return;

    const found = items.find((c) => c.id_colonia === coloniaId);
    if (found) {
      if (!colonia) setColonia(found.nombre_colonia);
      return;
    }

    if (!loading && hasMore && !autoFinding) {
      setAutoFinding(true);
      setTimeout(async () => {
        await loadColonias(offset);
        setAutoFinding(false);
      }, 0);
    }
  }, [
    items,
    coloniaId,
    hasMore,
    loading,
    offset,
    colonia,
    referencia,
    loadColonias,
    autoFinding,
    selectorOpen,
    search,
  ]);

  // 🆕 Al abrir el selector NO hagas fetch, solo limpia la búsqueda para mostrar lo que ya hay
  useEffect(() => {
    if (!selectorOpen) return;
    setSearch("");
  }, [selectorOpen]);

  // Cuando items cambie y el selector esté abierto, intenta scrollear al seleccionado
  useEffect(() => {
    if (!selectorOpen || !coloniaId) return;
    const idx = items.findIndex((c) => c.id_colonia === coloniaId);
    if (idx >= 0 && flatListRef.current) {
      requestAnimationFrame(() => {
        try {
          flatListRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.5 });
        } catch {}
      });
    }
  }, [items, selectorOpen, coloniaId]);

  const handleSelectColonia = (item: Colonia) => {
    if (saving) return;
    setColonia(item.nombre_colonia);
    setColoniaId(item.id_colonia);
    if (!referencia && item.referencia) setReferencia(item.referencia);
    setSelectorOpen(false);
  };

  // --- abrir modal de confirmación desde el botón Guardar ---
  const handleSave = () => {
    if (saving) return;
    setShowConfirm(true);
  };

  // --- acción confirmada: CREA o ACTUALIZA y navega ---
  const confirmAndCreate = async () => {
    if (saving) return;
    setSaving(true);

    try {
      const uid = userId ?? null;
      const latitud = coords.latitude ?? null;
      const longitud = coords.longitude ?? null;

      if (!uid) throw new Error("No hay usuario autenticado (uid).");
      if (latitud == null || longitud == null) {
        throw new Error("Coordenadas inválidas: latitude/longitude requeridas.");
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const idNum = id_direccion ? Number(id_direccion) : NaN;

      if (editMode && Number.isFinite(idNum) && idNum > 0) {
        // 🔄 Actualizar
        const res = await actualizarDireccion(
          {
            id_direccion: idNum,
            nombre_direccion: nombreDireccion || null,
            latitude: latitud,
            longitude: longitud,
            referencia: referencia || null,
            tipo_direccion: tipoDireccion,
            id_colonia: coloniaId ?? null,
          },
          token
        );

        if (!res.ok) {
          throw new Error(res.message || "No se pudo actualizar la dirección.");
        }
      } else {
        // 🆕 Crear
        const res = await crearDireccion(
          {
            uid,
            latitude: latitud,
            longitude: longitud,
            id_colonia: coloniaId ?? null,
            nombre_direccion: nombreDireccion || null,
            isPrincipal: true,
            referencia: referencia || null,
            enforceSinglePrincipal: true,
            tipo_direccion: tipoDireccion,
          },
          token
        );

        if (!res.ok) {
          throw new Error(res.message || "No se pudo crear la dirección.");
        }
      }

      setShowConfirm(false);
      router.replace({
  pathname: "/address",
  params: lastPage === "checkout" ? { lastPage: "checkout" } : {},
});
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Ocurrió un error al guardar la dirección.");
    } finally {
      setSaving(false);
    }
  };

  // --- teclado: evita que tape "Referencia" ---
  const keyboardOffset = (Platform.OS === "ios" ? 16 : 0) + 60;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar backgroundColor="#FFD600" barStyle="dark-content" />

      {/* Header amarillo solo con back */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, saving && { opacity: 0.5 }]}
          onPress={onPressBack}   // 👈 usar modal en vez de goBack
          activeOpacity={0.7}
          disabled={saving}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* KeyboardAvoidingView */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={keyboardOffset}
      >
        {/* Contenido principal */}
        <View style={styles.content}>
          {/* Bloquea toques mientras guarda */}
          <View style={{ flex: 1 }} pointerEvents={saving ? "none" : "auto"}>
            <ScrollView
              contentContainerStyle={styles.scroll}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.title}>
                {editMode ? "Editar dirección" : "Nueva dirección"}
              </Text>

              <AddressTypeSelector
                value={tipoDireccion}
                onChange={(next) => !saving && setTipoDireccion(next)}
                disabled={saving}
              />

              {/* Nombre dirección */}
              <Text style={styles.label}>Nombre de la dirección</Text>
              <TextInput
                style={[styles.input, saving && { opacity: 0.6 }]}
                placeholder="Ejemplo: Casa mamá, apartamento, oficina principal..."
                placeholderTextColor="#9ca3af"
                value={nombreDireccion}
                onChangeText={setNombreDireccion}
                returnKeyType="next"
                editable={!saving}
              />

              {/* Colonia */}
              <Text style={styles.label}>Colonia</Text>
              <TouchableOpacity
                style={[styles.selector, saving && { opacity: 0.6 }]}
                onPress={() => !saving && setSelectorOpen(true)}
                disabled={saving}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.selectorText,
                    colonia ? styles.textSelected : {},
                  ]}
                >
                  {colonia || "Seleccionar colonia"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#6b7280" />
              </TouchableOpacity>

              {/* Referencia */}
              <Text style={styles.label}>Referencia</Text>
              <TextInput
                style={[styles.textArea, saving && { opacity: 0.6 }]}
                multiline
                numberOfLines={6}
                placeholder="Ejemplo: Casa verde con portón blanco frente a la pulpería"
                placeholderTextColor="#9ca3af"
                value={referencia}
                onChangeText={setReferencia}
                textAlignVertical="top"
                blurOnSubmit={false}
                editable={!saving}
              />

              {/* Botón guardar */}
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  saving && { opacity: 0.7 },
                ]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editMode ? "Guardar cambios" : "Guardar dirección"}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Overlay bloqueante mientras saving */}
          {saving && (
            <View style={styles.blockOverlay}>
              <ActivityIndicator size="large" />
              <Text style={styles.blockText}>Guardando…</Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* -------- Modal selector de colonias -------- */}
      <Modal
        visible={selectorOpen}
        animationType="slide"
        onRequestClose={() => setSelectorOpen(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          {/* Header modal */}
          <View style={{ flexDirection: "row", alignItems: "center", padding: 12 }}>
            <TouchableOpacity onPress={() => setSelectorOpen(false)} style={{ padding: 6 }}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "700", marginLeft: 8, color: "#111827" }}>
              Seleccionar colonia
            </Text>
          </View>

          {/* Buscador */}
          <View style={{ paddingHorizontal: 12, marginBottom: 8 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#f9fafb",
                borderWidth: 1,
                borderColor: "#e5e7eb",
                borderRadius: 12,
                paddingHorizontal: 12,
              }}
            >
              <Ionicons name="search" size={18} color="#6b7280" />
              <TextInput
                style={{ flex: 1, paddingVertical: 10, marginLeft: 6, color: "#111827" }}
                placeholder="Buscar colonia..."
                placeholderTextColor="#9ca3af"
                value={search}
                onChangeText={onChangeSearch}
                autoFocus
                returnKeyType="search"
              />
              {search.length > 0 && (
                <Pressable onPress={() => onChangeSearch("")}>
                  <Ionicons name="close-circle" size={18} color="#9ca3af" />
                </Pressable>
              )}
            </View>
          </View>

          {/* Lista */}
          {errorMsg ? (
            <View style={{ padding: 16 }}>
              <Text style={{ color: "#b91c1c" }}>{errorMsg}</Text>
              <TouchableOpacity
                onPress={() => loadColonias(0, search, true)}
                style={{
                  marginTop: 12,
                  backgroundColor: "#facc15",
                  borderRadius: 10,
                  paddingVertical: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={items}
              extraData={coloniaId}
              keyExtractor={(item) => String(item.id_colonia)}
              contentContainerStyle={{ paddingBottom: 20 }}
              ItemSeparatorComponent={() => (
                <View style={{ height: 1, backgroundColor: "#f3f4f6", marginLeft: 12 }} />
              )}
              renderItem={({ item }) => {
                const isSelected = item.id_colonia === coloniaId;
                return (
                  <Pressable
                    onPress={() => handleSelectColonia(item)}
                    style={({ pressed }) => [
                      {
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        backgroundColor: pressed
                          ? "#f9fafb"
                          : isSelected
                          ? "#fffbeb"
                          : "#fff",
                        borderLeftWidth: isSelected ? 3 : 0,
                        borderLeftColor: isSelected ? "#f59e0b" : "transparent",
                      },
                    ]}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#111827",
                          fontWeight: "600",
                          flex: 1,
                        }}
                        numberOfLines={1}
                      >
                        {item.nombre_colonia}
                      </Text>

                      {isSelected && (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: "#fef3c7",
                            borderColor: "#fde68a",
                            borderWidth: 1,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 999,
                          }}
                        >
                          <Ionicons name="checkmark-circle" size={16} color="#f59e0b" />
                          <Text style={{ marginLeft: 4, fontSize: 12, color: "#92400e", fontWeight: "700" }}>
                            Seleccionada
                          </Text>
                        </View>
                      )}
                    </View>

                    {item.referencia ? (
                      <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }} numberOfLines={2}>
                        {item.referencia}
                      </Text>
                    ) : null}
                  </Pressable>
                );
              }}
              ListFooterComponent={
                <View style={{ paddingVertical: 16 }}>
                  {loading ? (
                    <ActivityIndicator />
                  ) : hasMore ? (
                    <TouchableOpacity
                      onPress={() => loadColonias(offset)}
                      style={{
                        alignSelf: "center",
                        backgroundColor: "#f3f4f6",
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: "#e5e7eb",
                      }}
                    >
                      <Text style={{ color: "#111827", fontWeight: "600" }}>Cargar más</Text>
                    </TouchableOpacity>
                  ) : items.length === 0 ? (
                    <Text style={{ textAlign: "center", color: "#6b7280" }}>
                      No hay resultados
                    </Text>
                  ) : (
                    <Text style={{ textAlign: "center", color: "#6b7280" }}>
                      Fin de la lista
                    </Text>
                  )}
                </View>
              }
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* -------- Modal de confirmación GUARDAR -------- */}
      <ConfirmModal
        visible={showConfirm}
        title={editMode ? "Confirmar cambios" : "Confirmar nueva dirección"}
        message={
          editMode
            ? "¿Deseas guardar los cambios de esta dirección como principal?"
            : "¿Deseas guardar esta dirección como principal?"
        }
        icon="help-circle"
        confirmText={saving ? "Guardando..." : editMode ? "Sí, guardar cambios" : "Sí, guardar"}
        cancelText="Cancelar"
        onCancel={() => !saving && setShowConfirm(false)}
        onConfirm={confirmAndCreate}
      />

      {/* -------- Modal de confirmación SALIR -------- */}
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
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 60 },
  title: { fontSize: 20, fontWeight: "700", color: "#1e293b", marginBottom: 10 },
  label: { fontWeight: "600", color: "#1e293b", marginBottom: 8, marginTop: 16 },
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
  selectorText: { color: "#9ca3af", fontSize: 14 },
  textSelected: { color: "#111827" },
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
    minHeight: 130,
  },
  saveButton: {
    marginTop: 28,
    backgroundColor: "#facc15",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  blockOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  blockText: { color: "#111827", fontWeight: "700" },
});
