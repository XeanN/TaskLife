import { Stack } from "expo-router";

// Este layout envuelve todas las pantallas de (auth)
// sin mostrar ningún header ni bottom tabs
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
