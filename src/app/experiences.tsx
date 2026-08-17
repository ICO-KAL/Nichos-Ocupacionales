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

export default function ExperiencesScreen() {
  const { getExperiences, deleteExperience } = useAuth();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    try {
      await deleteExperience(id);
      setExperiences((current) =>
        current.filter((experience) => experience.id !== id),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible eliminar la experiencia.",
      );
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis experiencias</Text>
        <Pressable
          onPress={() => router.push("/add-experience")}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>+ Agregar</Text>
        </Pressable>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

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
            <Text style={styles.empty}>Aun no ha agregado experiencias.</Text>
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
                <Pressable onPress={() => handleDelete(item.id)}>
                  <Text style={styles.deleteText}>Eliminar</Text>
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
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
  },
  addButtonText: { color: "#FFFFFF", fontWeight: "700" },
  loading: { marginTop: 40 },
  list: { padding: 20, gap: 14 },
  empty: { textAlign: "center", color: "#526B7A", marginTop: 40 },
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
  deleteText: { color: "#9B1C1C", fontWeight: "700", marginTop: 6 },
  error: {
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 6,
    color: "#9B1C1C",
    backgroundColor: "#FDE8E8",
  },
});
