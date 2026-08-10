import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';

import { useAuth } from '@/auth/auth-context';
import { AuthScreen, ErrorMessage, FormField, PrimaryButton, TextAction } from '@/components/auth-ui';

export default function ForgotPasswordScreen() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleRequest() {
    setError(null);
    if (!email.trim()) {
      setError('Ingrese el correo asociado a su cuenta.');
      return;
    }

    setIsLoading(true);
    try {
      const developmentCode = await requestPasswordReset(email);
      if (developmentCode) {
        Alert.alert('Codigo de desarrollo', developmentCode);
      }
      router.push({ pathname: '/reset-password', params: { email } });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No fue posible solicitar el codigo.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthScreen
      description="Ingrese su correo y recibira un codigo temporal para establecer una nueva contrasena."
      eyebrow="RECUPERAR ACCESO"
      footer={<TextAction title="Volver a iniciar sesion" onPress={() => router.replace('/login')} />}
      title="Recupere su cuenta">
      <FormField autoComplete="email" label="Correo electronico" onChangeText={setEmail} placeholder="tu@correo.com" value={email} />
      <ErrorMessage message={error} />
      <PrimaryButton isLoading={isLoading} onPress={handleRequest} title="Solicitar codigo" />
    </AuthScreen>
  );
}