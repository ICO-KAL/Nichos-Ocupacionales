// src/app/mis-pagos.tsx
// Ruta: /mis-pagos — GET /me/payments
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { mostrarAlerta } from '@/lib/alert';
import { mensajeDeError } from '@/lib/api/client';
import { obtenerMisPagos } from '@/lib/api/pagos';
import type { Payment } from '@/lib/api/types';

export default function MisPagosScreen() {
  const [pagos, setPagos] = useState<Payment[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(() => {
    setCargando(true);
    obtenerMisPagos()
      .then(setPagos)
      .catch((e) => mostrarAlerta('Error', mensajeDeError(e)))
      .finally(() => setCargando(false));
  }, []);

  useFocusEffect(cargar);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedText type="title" style={styles.titulo}>
        Mis pagos
      </ThemedText>

      <ScrollView
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargar} />}>
        {!cargando && pagos.length === 0 && (
          <ThemedText type="small" themeColor="textSecondary">
            Aún no tienes pagos registrados.
          </ThemedText>
        )}
        {pagos.map((pago) => (
          <ThemedView key={pago.id} style={styles.fila}>
            <ThemedView style={{ gap: 2 }}>
              <ThemedText type="default">
                {pago.amount != null ? `$${pago.amount.toFixed(2)}` : 'Monto no disponible'}{' '}
                {pago.currency ?? ''}
              </ThemedText>
              {pago.createdAt && (
                <ThemedText type="small" themeColor="textSecondary">
                  {new Date(pago.createdAt).toLocaleString()}
                </ThemedText>
              )}
            </ThemedView>
            <ThemedView
              style={[
                styles.estadoChip,
                pago.status === 'approved' ? styles.estadoAprobado : styles.estadoRechazado,
              ]}>
              <ThemedText type="small" themeColor="background">
                {pago.status === 'approved' ? 'Aprobado' : pago.status ?? 'Desconocido'}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingHorizontal: Spacing.four },
  titulo: { fontSize: 28, lineHeight: 32, paddingVertical: Spacing.three },
  lista: { gap: Spacing.one, paddingBottom: Spacing.five },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#8888',
  },
  estadoChip: { paddingVertical: 4, paddingHorizontal: Spacing.two, borderRadius: 12 },
  estadoAprobado: { backgroundColor: '#16a34a' },
  estadoRechazado: { backgroundColor: '#dc2626' },
});
