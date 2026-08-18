import { Redirect, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Experience, useAuth } from "@/auth/auth-context";

const APARTADOS = [
  {
    label: "Explorar ofertas",
    detail: "Encuentra oportunidades activas cerca de ti",
    route: "/ofertas" as const,
  },
  {
    label: "Mis aplicaciones",
    detail: "Consulta el estado de tus postulaciones",
    route: "/tabs/applications" as const,
  },
  {
    label: "Publicar oferta",
    detail: "Crea una oportunidad y completa su publicación",
    route: "/ofertas/publicar" as const,
  },
  {
    label: "Mis ofertas publicadas",
    detail: "Revisa y selecciona candidatos",
    route: "/mis-ofertas" as const,
  },
  {
    label: "Mis pagos",
    detail: "Consulta tus cobros y su estado",
    route: "/mis-pagos" as const,
  },
];

export default function DashboardScreen() {
  const { user, isLoading, signOut, getExperiences } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isExperiencesLoading, setIsExperiencesLoading] = useState(true);
  const [feedback, setFeedback] = useState("");

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let active = true;
      setIsExperiencesLoading(true);
      getExperiences()
        .then((data) => {
          if (active) setExperiences(data);
        })
        .catch((error: Error) => {
          if (active) setFeedback(error.message);
        })
        .finally(() => {
          if (active) setIsExperiencesLoading(false);
        });
      return () => {
        active = false;
      };
    }, [user, getExperiences]),
  );

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#0E7490" size="large" />
      </View>
    );
  }
  if (!user) {
    return <Redirect href="/login" />;
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    await signOut();
    router.replace("/login");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>INNOVATECH SOLUTIONS</Text>
          <Text style={styles.overline}>MI CUENTA</Text>
        </View>
        <Pressable
          disabled={isSigningOut}
          onPress={handleSignOut}
          style={({ pressed }) => [
            styles.signOut,
            (pressed || isSigningOut) && styles.pressed,
          ]}
        >
          <Text style={styles.signOutText}>
            {isSigningOut ? "Cerrando..." : "Cerrar sesion"}
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.intro}>
          <Text style={styles.greeting}>Hola, {user.firstName}</Text>
          <Text style={styles.copy}>
            Gestione su perfil profesional y sus experiencias laborales.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Datos de la cuenta</Text>
          <InfoRow
            label="Nombre completo"
            value={`${user.firstName} ${user.lastName}`}
          />
          <InfoRow label="Correo" value={user.email} />
          {user.cedula && <InfoRow label="Cedula" value={user.cedula} />}
          {user.gender && <InfoRow label="Genero" value={user.gender} />}
          {user.birthDate && (
            <InfoRow
              label="Fecha de nacimiento"
              value={user.birthDate.slice(0, 10)}
            />
          )}
          <Pressable
            onPress={() => router.push("/change-password")}
            style={styles.linkButton}
          >
            <Text style={styles.linkButtonText}>Cambiar contrasena</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Mis experiencias</Text>
            <Pressable onPress={() => router.push("/add-experience")}>
              <Text style={styles.linkButtonText}>+ Agregar</Text>
            </Pressable>
          </View>

          {!!feedback && <Text style={styles.error}>{feedback}</Text>}

          {isExperiencesLoading ? (
            <ActivityIndicator color="#0E7490" style={{ marginTop: 12 }} />
          ) : experiences.length === 0 ? (
            <Text style={styles.empty}>Aun no ha agregado experiencias.</Text>
          ) : (
            experiences.map((experience) => (
              <View key={experience.id} style={styles.experienceItem}>
                <Text style={styles.experienceTitle}>{experience.title}</Text>
                <Text style={styles.experienceDescription}>
                  {experience.description}
                </Text>
              </View>
            ))
          )}

          <Pressable
            onPress={() => router.push("/experiences")}
            style={styles.linkButton}
          >
            <Text style={styles.linkButtonText}>
              Ver todas mis experiencias
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Apartados</Text>
          <View style={styles.quickLinks}>
            {APARTADOS.map((apartado) => (
              <Pressable
                key={apartado.route}
                onPress={() => router.push(apartado.route)}
                android_ripple={{ color: "#CFFAFE" }}
                accessibilityRole="button"
                accessibilityLabel={apartado.label}
                style={({ pressed }) => [
                  styles.apartadoButton,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.apartadoCopy}>
                  <Text style={styles.apartadoButtonText}>{apartado.label}</Text>
                  <Text style={styles.apartadoDetail}>{apartado.detail}</Text>
                </View>
                <Text style={styles.apartadoArrow}>›</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F7F8" },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F7F8",
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#D9E2EC",
  },
  brand: {
    color: "#102A43",
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 1.6,
  },
  overline: {
    color: "#B45309",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 4,
  },
  signOut: {
    borderWidth: 1,
    borderColor: "#0E7490",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  signOutText: { color: "#0E7490", fontWeight: "800", fontSize: 14 },
  content: {
    maxWidth: 700,
    width: "100%",
    alignSelf: "center",
    padding: 24,
    paddingBottom: 44,
    gap: 20,
  },
  intro: { marginBottom: 8 },
  greeting: {
    color: "#102A43",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
  },
  copy: { color: "#526B7A", fontSize: 16, lineHeight: 24, marginTop: 10 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D9E2EC",
    padding: 20,
    gap: 12,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: { color: "#102A43", fontSize: 18, fontWeight: "800" },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F4F8",
  },
  infoLabel: { color: "#627D98", fontSize: 14 },
  infoValue: { color: "#243B53", fontSize: 14, fontWeight: "700" },
  linkButton: { marginTop: 8 },
  linkButtonText: { color: "#0E7490", fontSize: 14, fontWeight: "800" },
  empty: { color: "#829AB1", fontSize: 14, marginTop: 8 },
  experienceItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F4F8",
  },
  experienceTitle: { color: "#102A43", fontSize: 15, fontWeight: "700" },
  experienceDescription: { color: "#627D98", fontSize: 13, marginTop: 2 },
  error: { color: "#B91C1C", fontSize: 13, fontWeight: "700" },
  quickLinks: { gap: 10, paddingTop: 4 },
  apartadoButton: {
    minHeight: 68,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D9E2EC",
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    overflow: "hidden",
  },
  apartadoCopy: {
    flex: 1,
    paddingRight: 12,
  },
  apartadoButtonText: {
    color: "#0E7490",
    fontSize: 14,
    fontWeight: "800",
  },
  apartadoDetail: {
    color: "#627D98",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  apartadoArrow: {
    color: "#0E7490",
    fontSize: 28,
    fontWeight: "400",
    includeFontPadding: false,
  },
  pressed: { opacity: 0.65 },
});
