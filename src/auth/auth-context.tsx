import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  clearToken,
  getToken as readToken,
  requestApi,
  setToken as saveToken,
} from "@/lib/api/client";

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  nombre?: string;
  cedula?: string;
  gender?: string;
  birthDate?: string;
  profileCompleted: boolean;
  referralMatricula?: string;
  role?: string;
  createdAt?: string;
  lastLoginAt?: string;
};

type AuthResponse = {
  ok: boolean;
  data: {
    token: string;
    tokenType: string;
    user: User;
  };
};

export type ProfileInput = {
  firstName: string;
  lastName: string;
  cedula: string;
  gender: string;
  birthDate: string;
};

export type Experience = {
  id: string;
  userId: string;
  title: string;
  description: string;
  jobTypeKey: string;
  certificateImage: string;
  createdAt: string;
};

export type ExperienceInput = {
  title: string;
  description: string;
  jobTypeKey: string;
  certificateImage?: string;
};

export type JobType = {
  key: string;
  name: string;
};

export type UploadResult = {
  key: string;
  url: string;
  mime: string;
  size: number;
};

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    name: { firstName: string; lastName: string },
    email: string,
    password: string,
    referralMatricula: string,
  ) => Promise<void>;
  requestPasswordReset: (
    email: string,
    referralMatricula: string,
  ) => Promise<string>;
  completeProfile: (profile: ProfileInput) => Promise<void>;
  changePassword: (password: string) => Promise<void>;
  uploadImage: (base64Image: string, filename: string) => Promise<UploadResult>;
  getJobTypes: () => Promise<JobType[]>;
  getExperiences: () => Promise<Experience[]>;
  addExperience: (experience: ExperienceInput) => Promise<Experience>;
  deleteExperience: (id: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

class ApiError extends Error {}

function getErrorMessage(
  error: unknown,
  fallback = "No fue posible completar la solicitud. Intente nuevamente.",
) {
  if (error instanceof ApiError) return error.message;
  return fallback;
}

async function apiRequest<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
  token?: string | null,
): Promise<T> {
  try {
    return await requestApi<T>({
      method,
      path,
      data: body,
      token,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new ApiError(error.message);
    }
    throw new ApiError(
      "No fue posible conectar con el servidor. Verifique su conexion.",
    );
  }
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
        const meUser = await apiRequest<User>("GET", "/me", undefined, token);
        if (isMounted) setUser(meUser);
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
      const data = await apiRequest<AuthResponse["data"]>("POST", path, body);
      await saveToken(data.token);
      setUser(data.user);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async function signIn(email: string, password: string) {
    await authenticate("/auth/login", { email, password });
  }

  async function signUp(
    name: { firstName: string; lastName: string },
    email: string,
    password: string,
    referralMatricula: string,
  ) {
    await authenticate("/auth/register", {
      email,
      firstName: name.firstName,
      lastName: name.lastName,
      password,
      referralMatricula,
    });
  }

  async function requestPasswordReset(
    email: string,
    referralMatricula: string,
  ) {
    try {
      const data = await apiRequest<{ message: string }>(
        "POST",
        "/auth/forgot-password",
        {
          email,
          referralMatricula,
        },
      );
      return data.message;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async function withAuth<T>(fn: (token: string) => Promise<T>): Promise<T> {
    const token = await readToken();
    if (!token)
      throw new Error("Su sesion ha finalizado. Inicie sesion nuevamente.");
    try {
      return await fn(token);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async function completeProfile(profile: ProfileInput) {
    const updatedUser = await withAuth((token) =>
      apiRequest<User>("PUT", "/me/profile", profile, token),
    );
    setUser(updatedUser);
  }

  async function changePassword(password: string) {
    await withAuth((token) =>
      apiRequest<{ message: string }>(
        "PUT",
        "/me/password",
        { password },
        token,
      ),
    );
  }

  async function uploadImage(base64Image: string, filename: string) {
    return withAuth((token) =>
      apiRequest<UploadResult>(
        "POST",
        "/uploads",
        { image: base64Image, filename },
        token,
      ),
    );
  }

  async function getJobTypes() {
    return withAuth((token) =>
      apiRequest<JobType[]>("GET", "/job-types", undefined, token),
    );
  }

  async function getExperiences() {
    return withAuth((token) =>
      apiRequest<Experience[]>("GET", "/me/experiences", undefined, token),
    );
  }

  async function addExperience(experience: ExperienceInput) {
    return withAuth((token) =>
      apiRequest<Experience>("POST", "/me/experiences", experience, token),
    );
  }

  async function deleteExperience(id: string) {
    await withAuth((token) =>
      apiRequest<{ deleted: boolean }>(
        "DELETE",
        `/me/experiences/${id}`,
        undefined,
        token,
      ),
    );
  }

  async function signOut() {
    await clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        requestPasswordReset,
        completeProfile,
        changePassword,
        uploadImage,
        getJobTypes,
        getExperiences,
        addExperience,
        deleteExperience,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider.");
  }
  return context;
}
