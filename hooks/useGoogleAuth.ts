import { useAuth } from "@/context/AuthContext";

// ─────────────────────────────────────────────────────────
// VERSIÓN DE DESARROLLO — simula login con Google
// Para producción reemplaza con @react-native-google-signin
// ─────────────────────────────────────────────────────────

export function useGoogleAuth() {
  const { loginWithGoogle } = useAuth();

  const signInWithGoogle = async () => {
    await loginWithGoogle({
      id: "google-dev-123",
      email: "usuario@gmail.com",
      name: "Usuario Google",
      picture: "",
    });
  };

  return { signInWithGoogle, isReady: true };
}
