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

export default function CompleteProfileScreen() {
  const { completeProfile } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cedula, setCedula] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState(""); // formato YYYY-MM-DD
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSave() {
    setError(null);
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !cedula.trim() ||
      !gender.trim() ||
      !birthDate.trim()
    ) {
      setError("Complete todos los campos.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate.trim())) {
      setError("La fecha de nacimiento debe tener el formato AAAA-MM-DD.");
      return;
    }

    setIsLoading(true);
    try {
      await completeProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        cedula: cedula.trim(),
        gender: gender.trim(),
        birthDate: birthDate.trim(),
      });
      mostrarToast("Perfil guardado", "Tus datos se actualizaron correctamente.");
      router.replace("/dashboard");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible guardar su perfil.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthScreen
      description="Complete estos datos antes de continuar. Solo se solicitan una vez."
      eyebrow="PRIMER ACCESO"
      title="Complete su perfil"
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
        label="Cedula"
        onChangeText={setCedula}
        placeholder="000-0000000-0"
        value={cedula}
      />
      <FormField
        label="Genero"
        onChangeText={setGender}
        placeholder="masculino / femenino"
        value={gender}
      />
      <FormField
        label="Fecha de nacimiento"
        onChangeText={setBirthDate}
        placeholder="AAAA-MM-DD"
        value={birthDate}
      />
      <ErrorMessage message={error} />
      <PrimaryButton
        isLoading={isLoading}
        onPress={() => confirmarAccion({ title: "Guardar perfil", message: "¿Deseas guardar los cambios de tu perfil?", confirmText: "Guardar datos", onConfirm: () => void handleSave() })}
        title="Guardar y continuar"
      />
    </AuthScreen>
  );
}
