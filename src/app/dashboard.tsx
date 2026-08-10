import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/auth/auth-context';

export default function DashboardScreen() {
  const { user, isLoading, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (isLoading) {
    return <View style={styles.loading}><ActivityIndicator color="#0E7490" size="large" /></View>;
  }
  if (!user) {
    return <Redirect href="/login" />;
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    await signOut();
    router.replace('/login');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>PRESUPUESTO</Text>
          <Text style={styles.overline}>PANEL PRINCIPAL</Text>
        </View>
        <Pressable disabled={isSigningOut} onPress={handleSignOut} style={({ pressed }) => [styles.signOut, (pressed || isSigningOut) && styles.pressed]}>
          <Text style={styles.signOutText}>{isSigningOut ? 'Cerrando...' : 'Cerrar sesion'}</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={styles.greeting}>Hola, {user.name}</Text>
        <Text style={styles.copy}>Su sesion esta activa. Desde aqui podra administrar sus calculos y presupuestos.</Text>
        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.status}>Acceso verificado para {user.email}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F7F8' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F7F8' },
  header: { padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#D9E2EC' },
  brand: { color: '#102A43', fontWeight: '800', fontSize: 13, letterSpacing: 1.6 },
  overline: { color: '#B45309', fontSize: 11, fontWeight: '800', letterSpacing: 1, marginTop: 4 },
  signOut: { borderWidth: 1, borderColor: '#0E7490', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10 },
  signOutText: { color: '#0E7490', fontWeight: '800', fontSize: 14 },
  content: { flex: 1, maxWidth: 620, width: '100%', alignSelf: 'center', justifyContent: 'center', padding: 24 },
  greeting: { color: '#102A43', fontSize: 32, lineHeight: 38, fontWeight: '800' },
  copy: { color: '#526B7A', fontSize: 17, lineHeight: 26, marginTop: 14 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 34 },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#16A34A' },
  status: { color: '#243B53', fontSize: 14, fontWeight: '700', flexShrink: 1 },
  pressed: { opacity: 0.65 },
});