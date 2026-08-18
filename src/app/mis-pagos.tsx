import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { mensajeDeError } from "@/lib/api/client";
import { obtenerMisPagos } from "@/lib/api/pagos";
import type { Payment } from "@/lib/api/types";
import { ScreenHeader } from "@/components/ui/ScreenHeader";

export default function MisPagosScreen() {
  const router = useRouter();
  const [pagos, setPagos] = useState<Payment[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/dashboard");
  };

  const cargar = useCallback(() => {
    setCargando(true);
    setError(null);
    obtenerMisPagos()
      .then(setPagos)
      .catch((e) => setError(mensajeDeError(e)))
      .finally(() => setCargando(false));
  }, []);

  useFocusEffect(cargar);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargar} />}
      >
        <ScreenHeader title="Mis pagos" onBack={handleBack} />
        {cargando && pagos.length === 0 ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateText}>Cargando historial de pagos...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>No pudimos cargar tus pagos</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={cargar} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </Pressable>
          </View>
        ) : pagos.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No tienes pagos registrados</Text>
            <Text style={styles.emptyText}>
              Cuando realices transacciones, las verás listadas aquí.
            </Text>
          </View>
        ) : null}

        {!error && pagos.map((pago) => (
          <View key={pago.id} style={styles.fila}>
            <View style={styles.info}>
              <Text style={styles.monto}>
                {pago.amount != null ? `$${pago.amount.toFixed(2)}` : "Monto no disponible"}{" "}
                {pago.currency ?? ""}
              </Text>
              {pago.createdAt && (
                <Text style={styles.fecha}>{new Date(pago.createdAt).toLocaleString()}</Text>
              )}
            </View>

            <View
              style={[
                styles.estadoChip,
                pago.status === "approved" ? styles.estadoAprobado : styles.estadoPendiente,
              ]}
            >
              <Text style={styles.estadoText}>
                {pago.status === "approved" ? "Aprobado" : pago.status ?? "Pendiente"}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F7F8" },
  lista: { gap: 10, width: "100%", maxWidth: 720, alignSelf: "center", paddingHorizontal: 16, paddingBottom: 28 },
  stateCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9E2EC",
    borderRadius: 12,
    padding: 16,
  },
  stateText: { color: "#526B7A", fontSize: 14, textAlign: "center" },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9E2EC",
    borderRadius: 12,
    padding: 16,
    gap: 6,
  },
  emptyTitle: { color: "#102A43", fontWeight: "800", fontSize: 18 },
  emptyText: { color: "#526B7A", fontSize: 14, lineHeight: 20 },
  errorCard: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    padding: 16,
  },
  errorTitle: { color: "#991B1B", fontSize: 16, fontWeight: "800" },
  errorText: { color: "#B91C1C", fontSize: 14, lineHeight: 20, marginTop: 4 },
  retryButton: {
    alignSelf: "flex-start",
    minHeight: 40,
    marginTop: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: "center",
    backgroundColor: "#B91C1C",
  },
  retryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  fila: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9E2EC",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  info: { flex: 1, paddingRight: 10 },
  monto: { color: "#102A43", fontSize: 16, fontWeight: "800" },
  fecha: { color: "#829AB1", fontSize: 12, marginTop: 4 },
  estadoChip: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 999 },
  estadoAprobado: { backgroundColor: "#DCFCE7" },
  estadoPendiente: { backgroundColor: "#FEF3C7" },
  estadoText: { color: "#1F2937", fontSize: 12, fontWeight: "800" },
});
