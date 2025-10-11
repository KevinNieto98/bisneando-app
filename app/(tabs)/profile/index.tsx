import Icono from '@/components/ui/Icon.native';
import useAuth from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AccountScreen() {
  const navigation = useNavigation();
  const { user, loading } = useAuth();

  // ✅ mover la redirección a un efecto
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/(auth)/login');
    }
  }, [loading, user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (!user) {
    // ya estamos redirigiendo, evita renderizar nada aquí
    return null;
  }

  // Si hay usuario → mostrar pantalla de cuenta
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Zona amarilla */}
      <View style={styles.yellowSection}>
        {/* Header con botón de volver */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#1e293b" />
            <Text style={styles.backText}>Volver</Text>
          </TouchableOpacity>
        </View>

        {/* Perfil */}
        <View style={styles.profileSection}>
          {user.user_metadata?.avatar_url ? (
            <Image source={{ uri: user.user_metadata.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person-circle-outline" size={80} color="#a16207" />
            </View>
          )}

          <Text style={styles.userName}>
            {user.user_metadata?.name || 'Usuario sin nombre'}
          </Text>

          {user.email && <Text style={styles.emailText}>{user.email}</Text>}
        </View>
      </View>

      {/* Contenido blanco */}
      <View style={styles.whiteSection}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/edit_profile')}
        >
          <Ionicons name="person-outline" size={22} color="#27272a" />
          <Text style={styles.menuText}>Editar Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/address')}
        >
          <Ionicons name="location-outline" size={22} color="#27272a" />
          <Text style={styles.menuText}>Mis direcciones</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/orders')}
        >
          <Icono name="Tag" size={22} color="#27272a" />
          <Text style={styles.menuText}>Mis pedidos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/legal_information')}
        >
          <Ionicons name="document-text-outline" size={22} color="#27272a" />
          <Text style={styles.menuText}>Información legal</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => router.replace('/(auth)/login')}
        >
          <Ionicons name="log-out-outline" size={22} color="#dc2626" />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Versión 1.0.1</Text>
          <Text style={styles.footerText}>
            Powered by DDG Soluciones Digitales 2025
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: { fontSize: 16, color: '#52525b' },
  yellowSection: {
    backgroundColor: '#facc15',
    paddingTop: 50,
    paddingBottom: 40,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: { marginBottom: 20 },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  backText: { color: '#1e293b', marginLeft: 6, fontWeight: '600' },
  profileSection: { alignItems: 'center', marginBottom: 10 },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#a16207',
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#fef9c3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#a16207',
  },
  userName: { marginTop: 10, fontSize: 18, fontWeight: '700', color: '#1e293b' },
  emailText: { marginTop: 4, fontSize: 14, color: '#3f3f46' },
  whiteSection: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 24 },
  separator: { height: 1, backgroundColor: '#e4e4e7', marginVertical: 16 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  menuText: { fontSize: 16, color: '#27272a' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fef2f2',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fee2e2',
    marginTop: 8,
  },
  logoutText: { color: '#dc2626', fontWeight: '600', fontSize: 16 },
  footer: { marginTop: 20, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#9ca3af' },
});
