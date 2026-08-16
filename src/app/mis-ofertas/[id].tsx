// src/app/mis-ofertas/[id].tsx
// Ruta: /mis-ofertas/:id
// HU "Mis ofertas publicadas": ver aplicantes, calificarlos, descartarlos
// y seleccionar finalista/ganador.

import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { mostrarAlerta } from '@/lib/alert';
import { mensajeDeError } from '@/lib/api/client';
import { actualizarAplicacion, obtenerAplicantes } from '@/lib/api/ofertas';
import type { Application, ApplicationStatus } from '@/lib/api/types';

const ETIQUETA_ESTADO: Record<ApplicationStatus, string> = {
  applied: 'Aplicó',
  discarded: 'Descartado',
  finalist: 'Finalista',
  winner: 'Ganador',
};

export default function AplicantesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [aplicantes, setAplicantes] = useState<Application[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(() => {
    setCargando(true);
    obtenerAplicantes(id)
      .then(setAplicantes)
      .catch((e) => mostrarAlerta('Error', mensajeDeError(e)))
      .finally(() => setCargando(false));
  }, [id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="title" style={styles.titulo}>
          Aplicantes
        </ThemedText>

        {cargando && (
          <ThemedText type="small" themeColor="textSecondary">
            Cargando...
          </ThemedText>
        )}
        {!cargando && aplicantes.length === 0 && (
          <ThemedText type="small" themeColor="textSecondary">
            Todavía no hay aplicantes para esta oferta.
          </ThemedText>
        )}

        {aplicantes.map((aplicante) => (
          <AplicanteCard key={aplicante.id} aplicante={aplicante} onCambio={cargar} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// Componente propio (no un bloque suelto dentro del .map del padre) para
// que cada tarjeta maneje su propio estado de "guardando" sin romper las
// Rules of Hooks — mismo patrón usado en TareaFila del otro proyecto.
function AplicanteCard({ aplicante, onCambio }: { aplicante: Application; onCambio: () => void }) {
  const [guardando, setGuardando] = useState(false);

  const nombre =
    aplicante.applicant?.nombre ||
    [aplicante.applicant?.firstName, aplicante.applicant?.lastName].filter(Boolean).join(' ') ||
    aplicante.applicant?.email ||
    'Aplicante';

  const cambiarEstado = async (status: ApplicationStatus) => {
    setGuardando(true);
    try {
      await actualizarAplicacion(aplicante.id, { status });
      onCambio();
    } catch (e) {
      mostrarAlerta('Error', mensajeDeError(e));
    } finally {
      setGuardando(false);
    }
  };

  const calificar = async (rating: number) => {
    setGuardando(true);
    try {
      await actualizarAplicacion(aplicante.id, { rating });
      onCambio();
    } catch (e) {
      mostrarAlerta('Error', mensajeDeError(e));
    } finally {
      setGuardando(false);
    }
  };

  const esFinal = aplicante.status === 'winner' || aplicante.status === 'discarded';

  return (
    <ThemedView style={styles.card}>
      <ThemedText type="default">{nombre}</ThemedText>
      {aplicante.applicant?.email && (
        <ThemedText type="small" themeColor="textSecondary">
          {aplicante.applicant.email}
        </ThemedText>
      )}
      <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: Spacing.one }}>
        {aplicante.comment}
      </ThemedText>

      <ThemedView style={styles.filaEstrellas}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => calificar(n)} disabled={guardando} hitSlop={4}>
            <ThemedText type="default" themeColor={(aplicante.rating ?? 0) >= n ? 'text' : 'textSecondary'}>
              ★
            </ThemedText>
          </Pressable>
        ))}
      </ThemedView>

      <ThemedText type="small" style={styles.estadoActual}>
        Estado: {ETIQUETA_ESTADO[aplicante.status] ?? aplicante.status}
      </ThemedText>

      {!esFinal && (
        <ThemedView style={styles.filaBotones}>
          <Pressable style={styles.botonChico} onPress={() => cambiarEstado('finalist')} disabled={guardando}>
            <ThemedText type="small" themeColor="background">
              Finalista
            </ThemedText>
          </Pressable>
          <Pressable
            style={[styles.botonChico, styles.botonVerde]}
            onPress={() => cambiarEstado('winner')}
            disabled={guardando}>
            <ThemedText type="small" themeColor="background">
              Ganador
            </ThemedText>
          </Pressable>
          <Pressable
            style={[styles.botonChico, styles.botonRojo]}
            onPress={() => cambiarEstado('discarded')}
            disabled={guardando}>
            <ThemedText type="small" themeColor="background">
              Descartar
            </ThemedText>
          </Pressable>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, minHeight: 0 },
  scroll: { padding: Spacing.four, gap: Spacing.two, paddingBottom: Spacing.six },
  titulo: { fontSize: 24, lineHeight: 28, marginBottom: Spacing.two },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#8888',
    borderRadius: Spacing.two,
    padding: Spacing.three,
    gap: 2,
  },
  filaEstrellas: { flexDirection: 'row', gap: Spacing.one, marginTop: Spacing.two },
  estadoActual: { marginTop: Spacing.two },
  filaBotones: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two, flexWrap: 'wrap' },
  botonChico: {
    backgroundColor: '#3c87f7',
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.two,
  },
  botonVerde: { backgroundColor: '#16a34a' },
  botonRojo: { backgroundColor: '#dc2626' },
});
