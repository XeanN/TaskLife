// ─── AuthContext.tsx ─────────────────────────────────────
// Maneja toda la autenticación con Firebase Auth.
// Expone al resto de la app: usuario actual, login,
// registro, login con Google y logout.
// Cualquier pantalla puede acceder con: const { user } = useAuth()
import { auth } from "@/config/firebase";
import {
  createUserWithEmailAndPassword, // registra nuevo usuario con email
  onAuthStateChanged, // detecta si hay sesión activa (persiste entre reinicios)
  signInWithEmailAndPassword, // login con email y contraseña
  signOut, // cierra sesión
  updateProfile, // guarda el nombre del usuario en Firebase Auth
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

  // login: verifica credenciales contra Firebase Auth.
  // Si son incorrectas, Firebase lanza un error con código específico.
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
      // navigation handled automatically by RootNavigator
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

  // register: crea la cuenta en Firebase Auth y guarda el nombre
  // con updateProfile (Firebase no guarda el nombre por defecto).
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
      // navigation handled automatically by RootNavigator
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
      // navigation handled automatically by RootNavigator
    } catch {
      throw new Error("Error al iniciar sesión con Google");
    } finally {
      setIsLoading(false);
    }
  };

  // logout: cierra sesión en Firebase y redirige a bienvenida.
  const logout = async () => {
    await signOut(auth);
    setUser(null);
      // navigation handled automatically by RootNavigator
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
