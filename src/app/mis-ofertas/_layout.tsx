// src/app/mis-ofertas/_layout.tsx
import { Stack } from 'expo-router';

export default function MisOfertasLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Mis ofertas' }} />
      <Stack.Screen name="[id]" options={{ title: 'Aplicantes' }} />
    </Stack>
  );
}
