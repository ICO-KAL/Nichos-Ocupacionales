// src/app/ofertas/_layout.tsx
import { Stack } from 'expo-router';

export default function OfertasLayout() {
  return (
    <Stack>
      <Stack.Screen name="publicar" options={{ title: 'Publicar oferta', headerShown: true }} />
    </Stack>
  );
}
