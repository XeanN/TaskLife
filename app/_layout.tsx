import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ensureReminderNotificationChannel } from "@/services/notificationsService";
import { loadApiUrlOverride } from "@/services/runtimeConfig";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { useEffect } from "react";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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
  useEffect(() => {
    // Ensure runtime API override is loaded early
    loadApiUrlOverride().catch(() => {});
    ensureReminderNotificationChannel().catch((err) => {
      console.warn("⚠️ No se pudo configurar el canal de notificaciones:", err?.message || err);
    });
  }, []);
  return (
    <ThemeProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="settings" />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
