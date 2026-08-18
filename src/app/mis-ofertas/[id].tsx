import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { mensajeDeError } from "@/lib/api/client";
import { actualizarAplicacion, obtenerAplicantes } from "@/lib/api/ofertas";
import type { Application, ApplicationStatus } from "@/lib/api/types";
import { mostrarAlerta } from "@/lib/alert";
import { ScreenHeader } from "@/components/ui/ScreenHeader";

const ETIQUETA_ESTADO: Record<ApplicationStatus, string> = {
  applied: "Aplicó",
  discarded: "Descartado",
  finalist: "Finalista",
  winner: "Ganador",
};

export default function AplicantesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [aplicantes, setAplicantes] = useState<Application[]>([]);
  const [cargando, setCargando] = useState(true);
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/mis-ofertas");
  };

  const cargar = useCallback(() => {
    setCargando(true);
    obtenerAplicantes(id)
      .then(setAplicantes)
      .catch((e) => mostrarAlerta("Error", mensajeDeError(e)))
      .finally(() => setCargando(false));
  }, [id]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Aplicantes" onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {cargando && <Text style={styles.info}>Cargando...</Text>}
        {!cargando && aplicantes.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No hay aplicantes todavía</Text>
            <Text style={styles.info}>Cuando alguien aplique a esta oferta, aparecerá aquí.</Text>
          </View>
        )}

        {aplicantes.map((aplicante) => (
          <AplicanteCard key={aplicante.id} aplicante={aplicante} onCambio={cargar} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function AplicanteCard({ aplicante, onCambio }: { aplicante: Application; onCambio: () => void }) {
  const [guardando, setGuardando] = useState(false);
  const nombre =
    aplicante.applicant?.nombre ||
    [aplicante.applicant?.firstName, aplicante.applicant?.lastName].filter(Boolean).join(" ") ||
    aplicante.applicant?.email ||
    "Aplicante";

  const cambiarEstado = async (status: ApplicationStatus) => {
    setGuardando(true);
    try {
      await actualizarAplicacion(aplicante.id, { status });
      onCambio();
    } catch (e) {
      mostrarAlerta("Error", mensajeDeError(e));
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
      mostrarAlerta("Error", mensajeDeError(e));
    } finally {
      setGuardando(false);
    }
  };

  const esFinal = aplicante.status === "winner" || aplicante.status === "discarded";

  return (
    <View style={styles.card}>
      <Text style={styles.nombre}>{nombre}</Text>
      {aplicante.applicant?.email ? <Text style={styles.info}>{aplicante.applicant.email}</Text> : null}
      {aplicante.comment ? <Text style={styles.comentario}>“{aplicante.comment}”</Text> : null}

      <View style={styles.filaEstrellas}>
        {[1, 2, 3, 4, 5].map((n) => {
          const active = (aplicante.rating ?? 0) >= n;
          return (
            <Pressable key={n} onPress={() => calificar(n)} disabled={guardando} hitSlop={4}>
              <Text style={[styles.estrella, active && styles.estrellaActiva]}>★</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.estadoActual}>
        Estado: {ETIQUETA_ESTADO[aplicante.status] ?? aplicante.status}
      </Text>

      {!esFinal && (
        <View style={styles.filaBotones}>
          <Pressable
            style={({ pressed }) => [styles.boton, styles.botonFinalista, pressed && styles.pressed]}
            onPress={() => cambiarEstado("finalist")}
            disabled={guardando}
          >
            <Text style={styles.botonText}>Finalista</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.boton, styles.botonGanador, pressed && styles.pressed]}
            onPress={() => cambiarEstado("winner")}
            disabled={guardando}
          >
            <Text style={styles.botonText}>Ganador</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.boton, styles.botonDescartar, pressed && styles.pressed]}
            onPress={() => cambiarEstado("discarded")}
            disabled={guardando}
          >
            <Text style={styles.botonText}>Descartar</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F7F8" },
  scroll: { paddingHorizontal: 16, paddingBottom: 28, gap: 10 },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9E2EC",
    borderRadius: 12,
    padding: 16,
    gap: 6,
  },
  emptyTitle: { color: "#102A43", fontSize: 18, fontWeight: "800" },
  info: { color: "#526B7A", fontSize: 14 },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9E2EC",
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  nombre: { color: "#102A43", fontSize: 16, fontWeight: "800" },
  comentario: {
    color: "#486581",
    fontSize: 13,
    fontStyle: "italic",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 8,
  },
  filaEstrellas: { flexDirection: "row", gap: 8, marginTop: 2 },
  estrella: { color: "#94A3B8", fontSize: 20 },
  estrellaActiva: { color: "#F59E0B" },
  estadoActual: { color: "#334E68", marginTop: 4, fontSize: 13, fontWeight: "600" },
  filaBotones: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 6 },
  boton: { borderRadius: 8, minHeight: 36, justifyContent: "center", paddingHorizontal: 12 },
  botonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  botonFinalista: { backgroundColor: "#7C3AED" },
  botonGanador: { backgroundColor: "#16A34A" },
  botonDescartar: { backgroundColor: "#DC2626" },
  pressed: { opacity: 0.75 },
});
