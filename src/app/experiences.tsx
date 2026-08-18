import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Experience, useAuth } from "@/auth/auth-context";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { mostrarToast } from "@/components/toast";
import { confirmarAccion } from "@/components/confirmation-dialog";

export default function ExperiencesScreen() {
  const { getExperiences, deleteExperience } = useAuth();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadExperiences = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const data = await getExperiences();
      setExperiences(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible cargar sus experiencias.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [getExperiences]);

  useFocusEffect(
    useCallback(() => {
      loadExperiences();
    }, [loadExperiences]),
  );

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteExperience(id);
      setExperiences((current) =>
        current.filter((experience) => experience.id !== id),
      );
      mostrarToast("Experiencia eliminada", "El registro se eliminó correctamente.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible eliminar la experiencia.",
      );
      setDeletingId(null);
    }
  }

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/dashboard");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title="Mis experiencias"
        onBack={handleBack}
        rightSlot={
          <Pressable
            onPress={() => router.push("/add-experience")}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>+ Agregar</Text>
          </Pressable>
        }
      />

      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.error}>{error}</Text>
          <Pressable onPress={() => void loadExperiences()} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </Pressable>
        </View>
      )}

      {isLoading ? (
        <ActivityIndicator
          color="#0E7490"
          size="large"
          style={styles.loading}
        />
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={experiences}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Aún no tienes experiencias</Text>
              <Text style={styles.empty}>
                Agrega tu experiencia laboral y, si lo tienes, su certificado en imagen.
              </Text>
              <Pressable onPress={() => router.push("/add-experience")} style={styles.emptyAction}>
                <Text style={styles.emptyActionText}>Agregar experiencia</Text>
              </Pressable>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.certificateImage ? (
                <Image
                  source={{ uri: item.certificateImage }}
                  style={styles.image}
                />
              ) : null}
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
                <Pressable
                  disabled={deletingId === item.id}
                  onPress={() => confirmarAccion({
                    title: "Eliminar experiencia",
                    message: "Esta acción no se puede deshacer. ¿Deseas continuar?",
                    destructive: true,
                    onConfirm: () => void handleDelete(item.id),
                  })}
                  style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
                >
                  <Text style={styles.deleteText}>
                    {deletingId === item.id ? "Eliminando..." : "Eliminar"}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F6F8FB" },
  header: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: { fontSize: 24, fontWeight: "800", color: "#102A43" },
  addButton: {
    backgroundColor: "#0E7490",
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
  },
  addButtonText: { color: "#FFFFFF", fontWeight: "700" },
  loading: { marginTop: 40 },
  list: { width: "100%", maxWidth: 720, alignSelf: "center", padding: 20, gap: 14 },
  emptyCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 24,
  },
  emptyTitle: { color: "#102A43", fontSize: 18, fontWeight: "800" },
  empty: { textAlign: "center", color: "#526B7A", lineHeight: 20, marginTop: 8 },
  emptyAction: {
    minHeight: 44,
    marginTop: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0E7490",
  },
  emptyActionText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  image: { width: 88, height: 88 },
  cardContent: { flex: 1, padding: 12, gap: 4 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#102A43" },
  cardDescription: { fontSize: 14, color: "#526B7A" },
  deleteButton: { alignSelf: "flex-start", minHeight: 36, justifyContent: "center" },
  deleteText: { color: "#9B1C1C", fontWeight: "700" },
  errorCard: {
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 6,
    backgroundColor: "#FDE8E8",
  },
  error: {
    color: "#9B1C1C",
    lineHeight: 20,
  },
  retryButton: {
    alignSelf: "flex-start",
    minHeight: 36,
    marginTop: 8,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  retryButtonText: {
    color: "#9B1C1C",
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.7,
  },
});
