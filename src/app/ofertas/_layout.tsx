// src/app/ofertas/_layout.tsx
import { Stack } from 'expo-router';

export default function OfertasLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="publicar" />
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
