import { router } from "expo-router";
import { useState } from "react";

import { useAuth } from "@/auth/auth-context";
import {
  AuthScreen,
  ErrorMessage,
  FormField,
  PrimaryButton,
  TextAction,
} from "@/components/auth-ui";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    setError(null);
    if (!email || !password) {
      setError("Ingrese su correo y contrasena.");
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/dashboard");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible iniciar sesion.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthScreen
      description="Acceda a sus calculos y presupuestos desde un espacio personal."
      eyebrow="ACCESO SEGURO"
      footer={
        <>
          <TextAction
            title="Olvide mi contrasena"
            onPress={() => router.push("/forgot-password")}
          />
          <TextAction
            title="Crear una cuenta"
            onPress={() => router.push("/register")}
          />
        </>
      }
      title="Bienvenido de nuevo"
    >
      <FormField
        autoComplete="email"
        label="Correo electronico"
        onChangeText={setEmail}
        placeholder="tu@correo.com"
        value={email}
      />
      <FormField
        autoComplete="password"
        label="Contrasena"
        onChangeText={setPassword}
        placeholder="Tu contrasena"
        secureTextEntry
        value={password}
      />
      <ErrorMessage message={error} />
      <PrimaryButton
        isLoading={isLoading}
        onPress={handleLogin}
        title="Iniciar sesion"
      />
    </AuthScreen>
  );
}
