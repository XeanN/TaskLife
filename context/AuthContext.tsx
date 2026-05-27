import {
  loginWithEmail,
  logoutUser,
  mapFirebaseUser,
  registerWithEmailAndName,
  subscribeToAuthState,
} from "@/controllers/AuthController";
import { User } from "@/models/User";
import { router } from "expo-router";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type AuthContextType = {
  user: User;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
  ) => Promise<void>;
  loginWithGoogle: (googleUser: Exclude<User, null>) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaura sesión automáticamente al abrir la app
  useEffect(() => {
    const unsubscribe = subscribeToAuthState((fbUser) => {
      setUser(fbUser ? mapFirebaseUser(fbUser) : null);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const u = await loginWithEmail(email, password);
      setUser(u);
      router.replace("/(tabs)");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
  ): Promise<void> => {
    setIsLoading(true);
    try {
      const u = await registerWithEmailAndName(
        name,
        email,
        password,
        confirmPassword,
      );
      setUser(u);
      router.replace("/(tabs)");
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (
    googleUser: Exclude<User, null>,
  ): Promise<void> => {
    setIsLoading(true);
    try {
      setUser(googleUser);
      router.replace("/(tabs)");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    await logoutUser();
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
