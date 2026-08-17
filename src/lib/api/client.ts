import axios, { AxiosError } from "axios";
import { Platform } from "react-native";

import { requestLocalJson } from "./local-json-db";

export const API_BASE_URL = "https://ocupa2.ia3x.com/apix";
export const TOKEN_KEY = "ocupa2.access-token";
const DATA_MODE = process.env.EXPO_PUBLIC_DATA_MODE ?? "local";

type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function getToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    if (typeof window === "undefined") return null;
    return window.sessionStorage.getItem(TOKEN_KEY);
  }
  const SecureStore = await import("expo-secure-store");
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    window.sessionStorage.setItem(TOKEN_KEY, token);
    return;
  }
  const SecureStore = await import("expo-secure-store");
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  if (Platform.OS === "web") {
    window.sessionStorage.removeItem(TOKEN_KEY);
    return;
  }
  const SecureStore = await import("expo-secure-store");
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { Accept: "application/json" },
  timeout: 15000,
});

export interface SobreApi<T> {
  ok?: boolean;
  data?: T;
}

export function desenvolver<T>(body: SobreApi<T> | T): T {
  if (body && typeof body === "object" && "data" in body) {
    return (body as SobreApi<T>).data as T;
  }
  return body as T;
}

function shouldUseLocalFallback(error: unknown) {
  if (!axios.isAxiosError(error)) return false;
  const axiosError = error as AxiosError;
  return !axiosError.response;
}

function parsePathAndParams(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
) {
  const [basePath, queryString] = path.split("?");
  const merged: Record<string, string | number | boolean | undefined> = {
    ...(params ?? {}),
  };
  if (queryString) {
    const parsed = new URLSearchParams(queryString);
    parsed.forEach((value, key) => {
      merged[key] = value;
    });
  }
  return { basePath: basePath || "/", mergedParams: merged };
}

export async function requestApi<T>(args: {
  method: RequestMethod;
  path: string;
  data?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  token?: string | null;
}): Promise<T> {
  const { basePath, mergedParams } = parsePathAndParams(args.path, args.params);
  const token = args.token ?? (await getToken());

  if (DATA_MODE === "local") {
    return requestLocalJson<T>({
      method: args.method,
      path: basePath,
      data: args.data,
      params: mergedParams,
      token,
    });
  }

  try {
    const response = await apiClient.request<SobreApi<T> | T>({
      method: args.method,
      url: basePath,
      data: args.data,
      params: mergedParams,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return desenvolver<T>(response.data);
  } catch (error) {
    if (!shouldUseLocalFallback(error)) throw error;
    return requestLocalJson<T>({
      method: args.method,
      path: basePath,
      data: args.data,
      params: mergedParams,
      token,
    });
  }
}

function wrapResponse<T>(data: T) {
  return { data: { ok: true, data } };
}

export const api = {
  async get<T>(
    path: string,
    config?: { params?: Record<string, string | number | boolean | undefined> },
  ) {
    const data = await requestApi<T>({
      method: "GET",
      path,
      params: config?.params,
    });
    return wrapResponse(data);
  },
  async post<T>(path: string, data?: unknown) {
    const result = await requestApi<T>({ method: "POST", path, data });
    return wrapResponse(result);
  },
  async put<T>(path: string, data?: unknown) {
    const result = await requestApi<T>({ method: "PUT", path, data });
    return wrapResponse(result);
  },
  async patch<T>(path: string, data?: unknown) {
    const result = await requestApi<T>({ method: "PATCH", path, data });
    return wrapResponse(result);
  },
  async delete<T>(path: string) {
    const result = await requestApi<T>({ method: "DELETE", path });
    return wrapResponse(result);
  },
};

export function mensajeDeError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message) return error.message;
  }
  const err = error as AxiosError<{ message?: string; error?: string }>;
  return (
    err.response?.data?.message ??
    err.response?.data?.error ??
    (err.response?.status === 402
      ? "Pago rechazado o requerido."
      : err.response?.status === 403
        ? "No tienes permiso para hacer esto."
        : err.response?.status === 404
          ? "No se encontró el recurso."
          : err.response?.status === 409
            ? "Conflicto: ya existe o ya fue procesado."
            : err.response?.status === 422
              ? "Datos inválidos."
              : "No fue posible completar la solicitud. Intenta de nuevo.")
  );
}
