import {
  DarkTheme,
  DefaultTheme,
  Redirect,
  Stack,
  ThemeProvider,
  usePathname,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import {
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";

import { AuthProvider, useAuth } from "@/auth/auth-context";
import { AnimatedSplashOverlay } from "@/components/animated-icon";

SplashScreen.preventAutoHideAsync();

const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

function AuthGate() {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#0E7490" size="large" />
      </View>
    );
  }

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isIndexRoute = pathname === "/";
  const isCompleteProfileRoute = pathname === "/complete-profile";

  if (isIndexRoute) {
    return <Stack screenOptions={{ headerShown: false }} />;
  }

  if (!user && !isAuthRoute) {
    return <Redirect href="/login" />;
  }
  if (user && isAuthRoute) {
    return (
      <Redirect
        href={user.profileCompleted ? "/dashboard" : "/complete-profile"}
      />
    );
  }
  if (user && !user.profileCompleted && !isCompleteProfileRoute) {
    return <Redirect href="/complete-profile" />;
  }
  if (user && user.profileCompleted && isCompleteProfileRoute) {
    return <Redirect href="/dashboard" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6F8FB",
  },
});
