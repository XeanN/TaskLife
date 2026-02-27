import { router } from "expo-router";
import { createContext, ReactNode, useContext, useState } from "react";

// ─── Tipos ────────────────────────────────────────────────
export type User = {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: "email" | "google";
} | null;

type GoogleUserInfo = {
  id: string;
  email: string;
  name: string;
  picture?: string;
};

type AuthContextType = {
  user: User;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (googleUser: GoogleUserInfo) => Promise<void>;
  logout: () => void;
};

// ─── Contexto ─────────────────────────────────────────────
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// ─── Provider ─────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 800)); // simula red
      setUser({ id: "1", email, name: "Usuario", provider: "email" });
      router.replace("/(tabs)");
    } catch {
      throw new Error("Correo o contraseña incorrectos");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 800));
      setUser({ id: "2", email, name, provider: "email" });
      router.replace("/(tabs)");
    } catch {
      throw new Error("No se pudo crear la cuenta");
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (googleUser: GoogleUserInfo) => {
    setIsLoading(true);
    try {
      setUser({
        id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        provider: "google",
      });
      router.replace("/(tabs)");
    } catch {
      throw new Error("Error al iniciar sesión con Google");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    router.replace("/(auth)/welcome");
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
