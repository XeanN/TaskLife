import { auth } from "@/config/firebase";
import { router } from "expo-router";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

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

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaura sesión automáticamente al abrir la app
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email ?? "",
          name: firebaseUser.displayName ?? "Usuario",
          picture: firebaseUser.photoURL ?? undefined,
          provider: "email",
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user: fbUser } = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      setUser({
        id: fbUser.uid,
        email: fbUser.email ?? "",
        name: fbUser.displayName ?? "Usuario",
        provider: "email",
      });
      router.replace("/(tabs)");
    } catch (error: any) {
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        throw new Error("Correo o contraseña incorrectos");
      }
      throw new Error("Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user: fbUser } = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await updateProfile(fbUser, { displayName: name });
      setUser({
        id: fbUser.uid,
        email: fbUser.email ?? "",
        name,
        provider: "email",
      });
      router.replace("/(tabs)");
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        throw new Error("Este correo ya está registrado");
      }
      throw new Error("Error al crear la cuenta");
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

  const logout = async () => {
    await signOut(auth);
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
