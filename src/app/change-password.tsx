import { router } from "expo-router";
import { useState } from "react";

import { useAuth } from "@/auth/auth-context";
import { mostrarToast } from "@/components/toast";
import { confirmarAccion } from "@/components/confirmation-dialog";
import {
  AuthScreen,
  ErrorMessage,
  FormField,
  PrimaryButton,
} from "@/components/auth-ui";

const passwordRequirements = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function ChangePasswordScreen() {
  const { changePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleChange() {
    setError(null);
    if (!passwordRequirements.test(password)) {
      setError(
        "La contrasena debe tener 8 caracteres, una mayuscula, una minuscula y un numero.",
      );
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden.");
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(password);
      mostrarToast("Contraseña actualizada", "Tu contraseña se cambió correctamente.");
      router.back();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible cambiar la contrasena.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthScreen
      description="Establezca una nueva contrasena para su cuenta."
      eyebrow="SEGURIDAD"
      title="Cambiar contrasena"
    >
      <FormField
        autoComplete="new-password"
        label="Nueva contrasena"
        onChangeText={setPassword}
        placeholder="Minimo 8 caracteres"
        secureTextEntry
        value={password}
      />
      <FormField
        autoComplete="new-password"
        label="Confirmar nueva contrasena"
        onChangeText={setConfirmPassword}
        placeholder="Repita su contrasena"
        secureTextEntry
        value={confirmPassword}
      />
      <ErrorMessage message={error} />
      <PrimaryButton
        isLoading={isLoading}
        onPress={() => confirmarAccion({ title: "Actualizar contraseña", message: "¿Deseas guardar tu nueva contraseña?", onConfirm: () => void handleChange() })}
        title="Guardar cambios"
      />
    </AuthScreen>
  );
}
