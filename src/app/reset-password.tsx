import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { useAuth } from '@/auth/auth-context';
import { AuthScreen, ErrorMessage, FormField, PrimaryButton, TextAction } from '@/components/auth-ui';

const passwordRequirements = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function ResetPasswordScreen() {
  const { resetPassword } = useAuth();
  const parameters = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(parameters.email ?? '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleReset() {
    setError(null);
    if (!email || !code) {
      setError('Ingrese el correo y el codigo de recuperacion.');
      return;
    }
    if (!passwordRequirements.test(password)) {
      setError('La contrasena debe tener 8 caracteres, una mayuscula, una minuscula y un numero.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden.');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email, code, password);
      router.replace('/login');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No fue posible restablecer la contrasena.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthScreen
      description="El codigo tiene una vigencia limitada. Establezca una contrasena segura para continuar."
      eyebrow="NUEVA CONTRASENA"
      footer={<TextAction title="Volver a iniciar sesion" onPress={() => router.replace('/login')} />}
      title="Actualice su acceso">
      <FormField autoComplete="email" label="Correo electronico" onChangeText={setEmail} placeholder="tu@correo.com" value={email} />
      <FormField autoComplete="one-time-code" label="Codigo de recuperacion" onChangeText={setCode} placeholder="Codigo recibido" value={code} />
      <FormField autoComplete="new-password" label="Nueva contrasena" onChangeText={setPassword} placeholder="Minimo 8 caracteres" secureTextEntry value={password} />
      <FormField autoComplete="new-password" label="Confirmar nueva contrasena" onChangeText={setConfirmPassword} placeholder="Repita su contrasena" secureTextEntry value={confirmPassword} />
      <ErrorMessage message={error} />
      <PrimaryButton isLoading={isLoading} onPress={handleReset} title="Guardar nueva contrasena" />
    </AuthScreen>
  );
}