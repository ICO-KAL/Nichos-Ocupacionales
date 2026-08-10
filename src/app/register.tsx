import { router } from 'expo-router';
import { useState } from 'react';

import { useAuth } from '@/auth/auth-context';
import { AuthScreen, ErrorMessage, FormField, PrimaryButton, TextAction } from '@/components/auth-ui';

const passwordRequirements = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister() {
    setError(null);
    if (!name.trim() || !email.trim()) {
      setError('Complete su nombre y correo electronico.');
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
      await signUp(name, email, password);
      router.replace('/dashboard');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No fue posible crear la cuenta.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthScreen
      description="Cree su cuenta para conservar sus calculos y presupuestos."
      eyebrow="NUEVA CUENTA"
      footer={<TextAction title="Ya tengo una cuenta" onPress={() => router.replace('/login')} />}
      title="Organice su trabajo independiente">
      <FormField autoComplete="name" label="Nombre" onChangeText={setName} placeholder="Nombre completo" value={name} />
      <FormField autoComplete="email" label="Correo electronico" onChangeText={setEmail} placeholder="tu@correo.com" value={email} />
      <FormField autoComplete="new-password" label="Contrasena" onChangeText={setPassword} placeholder="Minimo 8 caracteres" secureTextEntry value={password} />
      <FormField autoComplete="new-password" label="Confirmar contrasena" onChangeText={setConfirmPassword} placeholder="Repita su contrasena" secureTextEntry value={confirmPassword} />
      <ErrorMessage message={error} />
      <PrimaryButton isLoading={isLoading} onPress={handleRegister} title="Crear cuenta" />
    </AuthScreen>
  );
}