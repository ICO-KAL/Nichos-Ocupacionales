import { router } from "expo-router";
import { useState } from "react";

import { useAuth } from "@/auth/auth-context";
import {
  AuthScreen,
  ErrorMessage,
  FormField,
  PrimaryButton,
  SuccessMessage,
  TextAction,
} from "@/components/auth-ui";

export default function ForgotPasswordScreen() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [referralMatricula, setReferralMatricula] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleReset() {
    setError(null);
    setSuccess(null);

    if (!email.trim() || !referralMatricula.trim()) {
      setError("Ingrese su correo y matricula.");
      return;
    }

    setIsLoading(true);
    try {
      const message = await requestPasswordReset(
        email.trim(),
        referralMatricula.trim(),
      );
      setSuccess(message || "Revisa tu correo para continuar el proceso.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible procesar la solicitud.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthScreen
      title="Recuperar contrasena"
      eyebrow="ACCESO"
      description="Te enviaremos las instrucciones para recuperar el acceso."
      footer={
        <TextAction
          title="Volver a iniciar sesion"
          onPress={() => router.replace("/login")}
        />
      }>
      <FormField
        autoComplete="email"
        label="Correo electronico"
        onChangeText={setEmail}
        placeholder="tu@correo.com"
        value={email}
      />
      <FormField
        label="Matricula"
        onChangeText={setReferralMatricula}
        placeholder="Ej. 2026-0001"
        value={referralMatricula}
      />
      <ErrorMessage message={error} />
      <SuccessMessage message={success} />
      <PrimaryButton
        title="Enviar solicitud"
        onPress={handleReset}
        isLoading={isLoading}
      />
    </AuthScreen>
  );
}
