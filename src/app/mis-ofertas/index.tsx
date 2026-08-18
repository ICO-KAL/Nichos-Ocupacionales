import { Link, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { mensajeDeError } from "@/lib/api/client";
import { obtenerMisOfertas } from "@/lib/api/ofertas";
import type { Offer } from "@/lib/api/types";
import { mostrarAlerta } from "@/lib/alert";
import { ScreenHeader } from "@/components/ui/ScreenHeader";

export default function MisOfertasScreen() {
  const router = useRouter();
  const [ofertas, setOfertas] = useState<Offer[]>([]);
  const [cargando, setCargando] = useState(true);
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/dashboard");
  };

  const cargar = useCallback(() => {
    setCargando(true);
    obtenerMisOfertas()
      .then(setOfertas)
      .catch((e) => mostrarAlerta("Error", mensajeDeError(e)))
      .finally(() => setCargando(false));
  }, []);

  useFocusEffect(cargar);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargar} />}
      >
        <ScreenHeader
          title="Mis ofertas"
          onBack={handleBack}
          rightSlot={
            <Link href="/ofertas/publicar" asChild>
              <Pressable style={({ pressed }) => [styles.botonNuevo, pressed && styles.pressed]}>
                <Text style={styles.botonNuevoText}>+ Nueva</Text>
              </Pressable>
            </Link>
          }
        />
        {ofertas.length === 0 && !cargando && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No tienes ofertas publicadas</Text>
            <Text style={styles.emptyText}>
              Publica una oferta para recibir aplicaciones de trabajadores.
            </Text>
          </View>
        )}

        {ofertas.map((oferta) => (
          <Pressable
            key={oferta.id}
            style={({ pressed }) => [styles.fila, pressed && styles.pressed]}
            onPress={() => router.push(`/mis-ofertas/${oferta.id}`)}
          >
            <View style={styles.filaInfo}>
              <Text style={styles.ofertaTitulo}>{oferta.jobTypeName || oferta.jobTypeKey}</Text>
              <Text style={styles.desc} numberOfLines={1}>
                {oferta.description}
              </Text>
              <Text style={styles.meta}>
                {oferta.address} · {oferta.active === false ? "Inactiva" : "Activa"}
              </Text>
            </View>
            <View style={styles.contador}>
              <Text style={styles.contadorText}>{oferta.applicationsCount ?? 0}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F7F8" },
  botonNuevo: {
    backgroundColor: "#0E7490",
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  botonNuevoText: { color: "#FFFFFF", fontWeight: "800", fontSize: 13 },
  lista: { gap: 10, paddingHorizontal: 16, paddingBottom: 28 },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9E2EC",
    borderRadius: 12,
    padding: 16,
    gap: 6,
  },
  emptyTitle: { color: "#102A43", fontSize: 18, fontWeight: "800" },
  emptyText: { color: "#526B7A", fontSize: 14, lineHeight: 20 },
  fila: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9E2EC",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
  },
  filaInfo: { flex: 1 },
  ofertaTitulo: { color: "#102A43", fontSize: 16, fontWeight: "800" },
  desc: { color: "#486581", fontSize: 13, marginTop: 2 },
  meta: { color: "#829AB1", fontSize: 12, marginTop: 4 },
  contador: {
    minWidth: 30,
    height: 30,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0E7490",
    paddingHorizontal: 8,
  },
  contadorText: { color: "#FFFFFF", fontWeight: "800", fontSize: 12 },
  pressed: { opacity: 0.75 },
});
