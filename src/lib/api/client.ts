// src/lib/api/client.ts
// Capa única de comunicación con el API de Ocupa2, para que TODO el equipo
// la use — así evitamos que cada quien duplique lógica de URL base,
// autenticación y manejo de errores (pedido explícito del documento de
// distribución del proyecto).
//
// El repo trae `src/auth/auth-context.tsx` apuntando a un backend viejo
// (localhost:3001, otro proyecto) — esto es la reconstrucción que sí sigue
// el Swagger real de Ocupa2. Persona 2 (Registro/Login) debería adoptar
// esto en vez del auth-context viejo, para que todos compartan el mismo
// token guardado bajo la misma llave.

import axios, { AxiosError } from 'axios';
import { Platform } from 'react-native';

export const API_BASE_URL = 'https://ocupa2.ia3x.com/apix';

// Misma llave que debe usar el login/registro de Persona 2 al guardar el
// JWT que devuelve /auth/verify-code — si no coinciden, mis pantallas nunca
// van a encontrar el token de sesión.
const TOKEN_KEY = 'ocupa2.access-token';

export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') return null;
    return window.sessionStorage.getItem(TOKEN_KEY);
  }
  const SecureStore = await import('expo-secure-store');
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    window.sessionStorage.setItem(TOKEN_KEY, token);
    return;
  }
  const SecureStore = await import('expo-secure-store');
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  if (Platform.OS === 'web') {
    window.sessionStorage.removeItem(TOKEN_KEY);
    return;
  }
  const SecureStore = await import('expo-secure-store');
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export const apiClient = axios.create({ baseURL: API_BASE_URL });

// Adjunta el JWT a cada petición saliente automáticamente.
apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// El API responde { ok: boolean, data: T } en las rutas que sí documentan
// su schema de respuesta (ver /offers/{id}/like en el spec). Asumimos el
// mismo sobre en el resto, con fallback al body crudo por si alguna ruta
// no lo sigue.
export interface SobreApi<T> {
  ok?: boolean;
  data?: T;
}

export function desenvolver<T>(body: SobreApi<T> | T): T {
  if (body && typeof body === 'object' && 'data' in body) {
    return (body as SobreApi<T>).data as T;
  }
  return body as T;
}

export function mensajeDeError(error: unknown): string {
  const err = error as AxiosError<{ message?: string; error?: string }>;
  return (
    err.response?.data?.message ??
    err.response?.data?.error ??
    (err.response?.status === 402
      ? 'Pago rechazado o requerido.'
      : err.response?.status === 403
        ? 'No tienes permiso para hacer esto.'
        : err.response?.status === 404
          ? 'No se encontró el recurso.'
          : err.response?.status === 409
            ? 'Conflicto: ya existe o ya fue procesado.'
            : err.response?.status === 422
              ? 'Datos inválidos.'
              : 'No fue posible completar la solicitud. Intenta de nuevo.')
  );
}
