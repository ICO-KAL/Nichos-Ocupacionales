// src/app/mis-ofertas/_layout.tsx
import { Stack } from 'expo-router';

export default function MisOfertasLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
