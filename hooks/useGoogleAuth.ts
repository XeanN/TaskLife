import { useAuth } from "@/context/AuthContext";

// ─────────────────────────────────────────────────────────
// VERSIÓN DE DESARROLLO - simula login con Google
// Cuando hagas npx expo run:android, reemplaza con la
// versión nativa de @react-native-google-signin
// ─────────────────────────────────────────────────────────

export function useGoogleAuth() {
  const { loginWithGoogle } = useAuth();

  const signInWithGoogle = async () => {
    // Simula un usuario de Google y navega al home
    await loginWithGoogle({
      id: "google-123",
      email: "usuario@gmail.com",
      name: "Usuario Google",
      picture: "",
    });
    // AuthContext ya hace router.replace("/(tabs)") internamente
  };

  return { signInWithGoogle, isReady: true };
}
