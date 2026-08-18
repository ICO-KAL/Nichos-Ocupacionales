import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { mensajeDeError } from "@/lib/api/client";
import { actualizarAplicacion, obtenerAplicantes } from "@/lib/api/ofertas";
import type { Application, ApplicationStatus } from "@/lib/api/types";
import { mostrarAlerta } from "@/lib/alert";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { mostrarToast } from "@/components/toast";
import { confirmarAccion } from "@/components/confirmation-dialog";

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
  const [error, setError] = useState<string | null>(null);
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/mis-ofertas");
  };

  const cargar = useCallback(() => {
    setCargando(true);
    setError(null);
    obtenerAplicantes(id)
      .then(setAplicantes)
      .catch((e) => {
        const message = mensajeDeError(e);
        setError(message);
        mostrarAlerta("Error", message);
      })
      .finally(() => setCargando(false));
  }, [id]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title="Aplicantes"
        subtitle="Gestiona las postulaciones de tu oferta"
        onBack={handleBack}
        rightSlot={
          <Pressable onPress={cargar} disabled={cargando} style={({ pressed }) => [styles.refreshButton, pressed && styles.pressed]}>
            <Text style={styles.refreshButtonText}>{cargando ? "Actualizando..." : "Actualizar"}</Text>
          </Pressable>
        }
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargar} />}
      >
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCount}>{aplicantes.length}</Text>
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryTitle}>Aplicantes recibidos</Text>
            <Text style={styles.summaryText}>Actualiza la lista para consultar los cambios más recientes.</Text>
          </View>
        </View>
        {cargando && aplicantes.length === 0 ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color="#0E7490" />
            <Text style={styles.info}>Cargando aplicantes...</Text>
          </View>
        ) : null}
        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>No pudimos cargar los aplicantes</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={cargar} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </Pressable>
          </View>
        ) : null}
        {!cargando && !error && aplicantes.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No hay aplicantes todavía</Text>
            <Text style={styles.info}>Cuando alguien aplique a esta oferta, aparecerá aquí.</Text>
          </View>
        )}

        {!error && aplicantes.map((aplicante) => (
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
    confirmarAccion({
      title: "Actualizar estado",
      message: `¿Deseas cambiar el estado del aplicante a ${ETIQUETA_ESTADO[status].toLowerCase()}?`,
      onConfirm: () => void guardarEstado(status),
    });
  };

  const guardarEstado = async (status: ApplicationStatus) => {
    setGuardando(true);
    try {
      await actualizarAplicacion(aplicante.id, { status });
      mostrarToast(
        "Estado actualizado",
        `El aplicante ahora figura como ${ETIQUETA_ESTADO[status].toLowerCase()}.`,
      );
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
      mostrarToast("Calificación guardada", `Asignaste ${rating} de 5 estrellas.`);
      onCambio();
    } catch (e) {
      mostrarAlerta("Error", mensajeDeError(e));
    } finally {
      setGuardando(false);
    }
  };

  const esFinal = aplicante.status === "winner" || aplicante.status === "discarded";
  const initial = nombre.charAt(0).toUpperCase();
  const statusStyle =
    aplicante.status === "winner"
      ? styles.statusWinner
      : aplicante.status === "finalist"
        ? styles.statusFinalist
        : aplicante.status === "discarded"
          ? styles.statusDiscarded
          : styles.statusApplied;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.applicantInfo}>
          <Text style={styles.nombre}>{nombre}</Text>
          {aplicante.applicant?.email ? <Text style={styles.info}>{aplicante.applicant.email}</Text> : null}
        </View>
        <View style={[styles.statusChip, statusStyle]}>
          <Text style={styles.statusText}>{ETIQUETA_ESTADO[aplicante.status] ?? aplicante.status}</Text>
        </View>
      </View>
      {aplicante.comment ? <Text style={styles.comentario}>“{aplicante.comment}”</Text> : null}

      <View style={styles.ratingSection}>
        <Text style={styles.ratingLabel}>Calificación</Text>
        <View style={styles.filaEstrellas}>
          {[1, 2, 3, 4, 5].map((n) => {
           const active = (aplicante.rating ?? 0) >= n;
           return (
             <Pressable
               key={n}
               onPress={() => confirmarAccion({
                 title: "Actualizar calificación",
                 message: `¿Deseas guardar ${n} de 5 estrellas para este aplicante?`,
                 onConfirm: () => void calificar(n),
               })}
               disabled={guardando}
               hitSlop={4}
             >
               <Text style={[styles.estrella, active && styles.estrellaActiva]}>★</Text>
             </Pressable>
           );
          })}
        </View>
      </View>

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
  scroll: { width: "100%", maxWidth: 720, alignSelf: "center", paddingHorizontal: 16, paddingBottom: 28, gap: 12 },
  refreshButton: { minHeight: 38, paddingHorizontal: 12, borderRadius: 8, justifyContent: "center", backgroundColor: "#0E7490" },
  refreshButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#BAE6FD",
    backgroundColor: "#ECFEFF",
  },
  summaryCount: { color: "#0E7490", fontSize: 30, fontWeight: "800", marginRight: 14 },
  summaryCopy: { flex: 1 },
  summaryTitle: { color: "#102A43", fontSize: 16, fontWeight: "800" },
  summaryText: { color: "#486581", fontSize: 13, lineHeight: 18, marginTop: 2 },
  stateCard: { minHeight: 112, alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 12, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#D9E2EC" },
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
  errorCard: { borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#FECACA", backgroundColor: "#FEF2F2" },
  errorTitle: { color: "#991B1B", fontSize: 16, fontWeight: "800" },
  errorText: { color: "#B91C1C", fontSize: 14, lineHeight: 20, marginTop: 4 },
  retryButton: { alignSelf: "flex-start", minHeight: 40, marginTop: 12, paddingHorizontal: 14, borderRadius: 8, justifyContent: "center", backgroundColor: "#B91C1C" },
  retryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9E2EC",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 22, backgroundColor: "#CFFAFE", marginRight: 10 },
  avatarText: { color: "#0E7490", fontSize: 18, fontWeight: "800" },
  applicantInfo: { flex: 1 },
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
  statusChip: { paddingVertical: 5, paddingHorizontal: 9, borderRadius: 999 },
  statusText: { fontSize: 11, fontWeight: "800" },
  statusApplied: { backgroundColor: "#FEF3C7" },
  statusFinalist: { backgroundColor: "#EDE9FE" },
  statusWinner: { backgroundColor: "#DCFCE7" },
  statusDiscarded: { backgroundColor: "#FEE2E2" },
  ratingSection: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#E2E8F0", paddingTop: 10 },
  ratingLabel: { color: "#486581", fontSize: 13, fontWeight: "700" },
  filaEstrellas: { flexDirection: "row", gap: 8 },
  estrella: { color: "#94A3B8", fontSize: 22 },
  estrellaActiva: { color: "#F59E0B" },
  filaBotones: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 6 },
  boton: { borderRadius: 8, minHeight: 36, justifyContent: "center", paddingHorizontal: 12 },
  botonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  botonFinalista: { backgroundColor: "#7C3AED" },
  botonGanador: { backgroundColor: "#16A34A" },
  botonDescartar: { backgroundColor: "#DC2626" },
  pressed: { opacity: 0.75 },
});
