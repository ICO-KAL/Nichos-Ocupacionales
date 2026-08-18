import { api, mensajeDeError } from "@/lib/api/client";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { mostrarToast } from "@/components/toast";
import { confirmarAccion } from "@/components/confirmation-dialog";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { Application } from "../../types/offers";

export default function MyApplicationsScreen() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/dashboard");
  };

  const fetchApplications = async () => {
    try {
      setError(null);
      const response = await api.get<Application[]>("/me/applications");
      if (response.data?.ok && Array.isArray(response.data.data)) {
        setApplications(response.data.data);
      } else {
        setApplications([]);
      }
    } catch (requestError) {
      setApplications([]);
      setError(mensajeDeError(requestError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchApplications();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    void fetchApplications();
  };

  const cancelApplication = async (applicationId: string) => {
    setCancellingId(applicationId);
    try {
      await api.delete(`/applications/${applicationId}`);
      setApplications((current) => current.filter((application) => application.id !== applicationId));
      mostrarToast("Postulación cancelada", "La oferta ya no aparecerá en tus aplicaciones.");
    } catch (requestError) {
      mostrarToast("No se pudo cancelar", mensajeDeError(requestError), "error");
    } finally {
      setCancellingId(null);
    }
  };

  const renderStatusBadge = (status: string) => {
    if (status === "winner") return <Text style={[styles.status, styles.winner]}>Ganador</Text>;
    if (status === "finalist")
      return <Text style={[styles.status, styles.finalist]}>Finalista</Text>;
    if (status === "rejected")
      return <Text style={[styles.status, styles.rejected]}>Descartado</Text>;
    return <Text style={[styles.status, styles.applied]}>En revisión</Text>;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0E7490" />
        <Text style={styles.muted}>Cargando tus postulaciones...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={applications}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <ScreenHeader
              title="Mis aplicaciones"
              subtitle="Seguimiento de tus postulaciones"
              onBack={handleBack}
            />
            {error ? (
              <View style={styles.errorCard}>
                <Text style={styles.errorTitle}>No pudimos cargar tus aplicaciones</Text>
                <Text style={styles.errorText}>{error}</Text>
                <Pressable onPress={() => void fetchApplications()} style={styles.retryButton}>
                  <Text style={styles.retryButtonText}>Reintentar</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No tienes aplicaciones</Text>
            <Text style={styles.emptyText}>
              Cuando te postules, aquí se mostrará el estado de cada aplicación.
            </Text>
            <Pressable
              onPress={() => router.push("/ofertas")}
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            >
              <Text style={styles.primaryBtnText}>Explorar ofertas</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => {
          const offer = item.offer;
          if (!offer) return null;

          return (
            <View style={styles.itemWrap}>
              <View style={styles.card}>
                <Pressable
                  onPress={() => router.push(`/ofertas/${offer.id}`)}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <View style={styles.row}>
                    <Image source={{ uri: offer.photo }} style={styles.avatar} contentFit="cover" />
                    <View style={styles.grow}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {offer.jobTypeName || offer.jobTypeKey}
                      </Text>
                      <Text style={styles.price}>
                        {offer.payment?.currency ?? "USD"} ${offer.payment?.amount ?? 0}
                        {offer.payment?.period ? ` / ${offer.payment.period}` : ""}
                      </Text>
                    </View>
                    {renderStatusBadge(item.status)}
                  </View>

                  {!!item.comment && (
                    <View style={styles.commentWrap}>
                      <Text style={styles.comment} numberOfLines={2}>
                        “{item.comment}”
                      </Text>
                    </View>
                  )}

                  <Text style={styles.date}>
                    Postulado el: {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </Pressable>
                {item.status === "applied" ? (
                  <Pressable
                    onPress={() => confirmarAccion({
                      title: "Cancelar postulación",
                      message: "¿Seguro que deseas retirar tu postulación? Esta acción no se puede deshacer.",
                      destructive: true,
                      onConfirm: () => void cancelApplication(item.id),
                    })}
                    disabled={cancellingId === item.id}
                    style={({ pressed }) => [
                      styles.cancelButton,
                      (pressed || cancellingId === item.id) && styles.pressed,
                    ]}
                  >
                    <Text style={styles.cancelButtonText}>
                      {cancellingId === item.id ? "Cancelando..." : "Cancelar postulación"}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F7F8" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F7F8",
  },
  muted: { marginTop: 10, color: "#627D98" },
  list: { paddingBottom: 36 },
  itemWrap: { width: "100%", maxWidth: 720, alignSelf: "center" },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9E2EC",
    borderRadius: 10,
    width: "100%",
    maxWidth: 688,
    alignSelf: "center",
    marginHorizontal: 16,
    padding: 18,
    gap: 10,
  },
  emptyTitle: { color: "#102A43", fontWeight: "800", fontSize: 18 },
  emptyText: { color: "#526B7A", fontSize: 14, lineHeight: 20 },
  primaryBtn: {
    alignSelf: "flex-start",
    minHeight: 42,
    borderRadius: 8,
    backgroundColor: "#0E7490",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  primaryBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  errorCard: {
    width: "100%",
    maxWidth: 688,
    alignSelf: "center",
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
  },
  errorTitle: { color: "#991B1B", fontSize: 16, fontWeight: "800" },
  errorText: { color: "#B91C1C", fontSize: 13, marginTop: 4 },
  retryButton: {
    alignSelf: "flex-start",
    minHeight: 40,
    marginTop: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: "center",
    backgroundColor: "#B91C1C",
  },
  retryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9E2EC",
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 14,
    marginBottom: 12,
  },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
    marginRight: 10,
  },
  grow: { flex: 1 },
  cardTitle: { color: "#102A43", fontSize: 16, fontWeight: "800" },
  price: { color: "#0E7490", fontSize: 13, fontWeight: "700", marginTop: 2 },
  status: {
    overflow: "hidden",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    fontSize: 12,
    fontWeight: "800",
  },
  winner: { backgroundColor: "#DCFCE7", color: "#166534" },
  finalist: { backgroundColor: "#EDE9FE", color: "#5B21B6" },
  rejected: { backgroundColor: "#FEE2E2", color: "#B91C1C" },
  applied: { backgroundColor: "#FEF3C7", color: "#92400E" },
  commentWrap: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  comment: { color: "#526B7A", fontSize: 13, fontStyle: "italic" },
  date: { color: "#829AB1", fontSize: 11, textAlign: "right" },
  cancelButton: {
    alignSelf: "flex-start",
    minHeight: 38,
    marginTop: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 8,
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
  },
  cancelButtonText: { color: "#B91C1C", fontSize: 13, fontWeight: "800" },
  pressed: { opacity: 0.72 },
});
