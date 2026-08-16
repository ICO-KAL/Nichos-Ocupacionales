// src/app/mis-ofertas/index.tsx
// Ruta: /mis-ofertas — GET /me/offers
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { mensajeDeError } from '@/lib/api/client';
import { obtenerMisOfertas } from '@/lib/api/ofertas';
import type { Offer } from '@/lib/api/types';
import { mostrarAlerta } from '@/lib/alert';

export default function MisOfertasScreen() {
  const router = useRouter();
  const [ofertas, setOfertas] = useState<Offer[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(() => {
    setCargando(true);
    obtenerMisOfertas()
      .then(setOfertas)
      .catch((e) => mostrarAlerta('Error', mensajeDeError(e)))
      .finally(() => setCargando(false));
  }, []);

  useFocusEffect(cargar);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.titulo}>
          Mis ofertas
        </ThemedText>
        <Link href="/ofertas/publicar" asChild>
          <Pressable style={styles.botonNuevo}>
            <ThemedText themeColor="background" type="smallBold">
              + Nueva
            </ThemedText>
          </Pressable>
        </Link>
      </ThemedView>

      <ScrollView
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargar} />}>
        {ofertas.length === 0 && !cargando && (
          <ThemedText type="small" themeColor="textSecondary">
            Aún no has publicado ninguna oferta.
          </ThemedText>
        )}
        {ofertas.map((oferta) => (
          <Pressable key={oferta.id} style={styles.fila} onPress={() => router.push(`/mis-ofertas/${oferta.id}`)}>
            <ThemedView style={styles.filaInfo}>
              <ThemedText type="default">{oferta.jobTypeKey}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                {oferta.description}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {oferta.address} · {oferta.active === false ? 'Inactiva' : 'Activa'}
              </ThemedText>
            </ThemedView>
            {typeof oferta.applicationsCount === 'number' && (
              <ThemedView style={styles.contador}>
                <ThemedText type="smallBold" themeColor="background">
                  {oferta.applicationsCount}
                </ThemedText>
              </ThemedView>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingHorizontal: Spacing.four },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  titulo: { fontSize: 28, lineHeight: 32 },
  botonNuevo: {
    backgroundColor: '#3c87f7',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
  },
  lista: { gap: Spacing.one, paddingBottom: Spacing.five },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#8888',
  },
  filaInfo: { gap: 2, flex: 1, paddingRight: Spacing.two },
  contador: {
    backgroundColor: '#3c87f7',
    borderRadius: 999,
    minWidth: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.one,
  },
});
