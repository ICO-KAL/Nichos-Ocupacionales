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

const passwordRequirements = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [referralMatricula, setReferralMatricula] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister() {
    setError(null);
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !referralMatricula.trim()
    ) {
      setError(
        "Complete todos los campos, incluyendo la matricula de referido.",
      );
      return;
    }
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
      await signUp(
        { firstName: firstName.trim(), lastName: lastName.trim() },
        email.trim(),
        password,
        referralMatricula.trim(),
      );
      router.replace("/complete-profile");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible crear la cuenta.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthScreen
      description="Cree su cuenta usando la matricula de referido de un estudiante del padron."
      eyebrow="NUEVA CUENTA"
      footer={
        <TextAction
          title="Ya tengo una cuenta"
          onPress={() => router.replace("/login")}
        />
      }
      title="Organice su trabajo independiente"
    >
      <FormField
        autoComplete="given-name"
        label="Nombre"
        onChangeText={setFirstName}
        placeholder="Nombre"
        value={firstName}
      />
      <FormField
        autoComplete="family-name"
        label="Apellido"
        onChangeText={setLastName}
        placeholder="Apellido"
        value={lastName}
      />
      <FormField
        autoComplete="email"
        label="Correo electronico"
        onChangeText={setEmail}
        placeholder="tu@correo.com"
        value={email}
      />
      <FormField
        label="Matricula de referido"
        onChangeText={setReferralMatricula}
        placeholder="Ej. 99999999"
        value={referralMatricula}
      />
      <FormField
        autoComplete="new-password"
        label="Contrasena"
        onChangeText={setPassword}
        placeholder="Minimo 8 caracteres"
        secureTextEntry
        value={password}
      />
      <FormField
        autoComplete="new-password"
        label="Confirmar contrasena"
        onChangeText={setConfirmPassword}
        placeholder="Repita su contrasena"
        secureTextEntry
        value={confirmPassword}
      />
      <ErrorMessage message={error} />
      <PrimaryButton
        isLoading={isLoading}
        onPress={handleRegister}
        title="Crear cuenta"
      />
    </AuthScreen>
  );
}
