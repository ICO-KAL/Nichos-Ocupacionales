import axios, { AxiosError } from 'axios';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api';
const TOKEN_KEY = 'freelancer-budget.access-token';

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthResponse = {
  token: string;
  user: User;
};

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<string | undefined>;
  resetPassword: (email: string, code: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getErrorMessage(error: unknown) {
  const apiError = error as AxiosError<{ message?: string }>;
  return apiError.response?.data?.message ?? 'No fue posible completar la solicitud. Intente nuevamente.';
}

async function readToken() {
  if (Platform.OS === 'web') {
    return typeof window === 'undefined' ? null : window.sessionStorage.getItem(TOKEN_KEY);
  }
  const secureStore = await import('expo-secure-store');
  return secureStore.getItemAsync(TOKEN_KEY);
}

async function saveToken(token: string) {
  if (Platform.OS === 'web') {
    window.sessionStorage.setItem(TOKEN_KEY, token);
    return;
  }
  const secureStore = await import('expo-secure-store');
  await secureStore.setItemAsync(TOKEN_KEY, token);
}

async function clearToken() {
  if (Platform.OS === 'web') {
    window.sessionStorage.removeItem(TOKEN_KEY);
    return;
  }
  const secureStore = await import('expo-secure-store');
  await secureStore.deleteItemAsync(TOKEN_KEY);
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const token = await readToken();
        if (!token) return;
        const response = await axios.get<{ user: User }>(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (isMounted) setUser(response.data.user);
      } catch {
        await clearToken();
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    restoreSession();
    return () => {
      isMounted = false;
    };
  }, []);

  async function authenticate(path: string, body: Record<string, string>) {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}${path}`, body);
      await saveToken(response.data.token);
      setUser(response.data.user);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async function signIn(email: string, password: string) {
    await authenticate('/auth/login', { email, password });
  }

  async function signUp(name: string, email: string, password: string) {
    await authenticate('/auth/register', { name, email, password });
  }

  async function requestPasswordReset(email: string) {
    try {
      const response = await axios.post<{ developmentCode?: string }>(`${API_URL}/auth/forgot-password`, { email });
      return response.data.developmentCode;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async function resetPassword(email: string, code: string, password: string) {
    try {
      await axios.post(`${API_URL}/auth/reset-password`, { email, code, password });
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async function signOut() {
    const token = await readToken();
    try {
      if (token) {
        await axios.post(`${API_URL}/auth/logout`, undefined, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } finally {
      await clearToken();
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signIn, signUp, requestPasswordReset, resetPassword, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider.');
  }
  return context;
}