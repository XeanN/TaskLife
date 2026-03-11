import { AuthProvider } from "@/context/AuthContext";
import { Stack } from "expo-router";

// ─── TEST TEMPORAL DE CONEXIÓN ─────────────────────────────
// Intenta leer un documento de Firestore al arrancar la app.
// Si imprime ✅ → Firebase está conectado correctamente.
// Si imprime ❌ → revisar credenciales en config/firebase.ts o reglas en Firebase Console.
// BORRAR este bloque antes de subir a producción.
{
  /* function FirebaseConnectionTest() {
  useEffect(() => {
    getDoc(doc(db, "_connectionTest_", "ping"))
      .then(() => console.log("✅ Firestore: conexión OK"))
      .catch((e) => console.log("❌ Firestore: error →", e.code));
  }, []);
  return null;
}*/
}
// ──────────────────────────────────────────────────────────

// Root layout: envuelve toda la app con el AuthProvider
// para que cualquier pantalla pueda acceder a la sesión

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="area" />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </AuthProvider>
  );
}
