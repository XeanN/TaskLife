import { AuthProvider } from "@/context/AuthContext";
import { Stack } from "expo-router";

// Root layout: envuelve toda la app con el AuthProvider
// para que cualquier pantalla pueda acceder a la sesión
export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </AuthProvider>
  );
}
