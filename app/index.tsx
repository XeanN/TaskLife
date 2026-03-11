import { useAuth } from "@/context/AuthContext";
import { Redirect } from "expo-router";

// Punto de entrada de la app.
// Redirige automáticamente según si el usuario tiene sesión o no.
export default function Index() {
  const { user } = useAuth();

  if (user) {
    // Tiene sesión → ir directo al home con tabs
    return <Redirect href="/(tabs)" />;
  }

  // Sin sesión → pantalla de bienvenida
  return <Redirect href="/(auth)/welcome" />;
}
