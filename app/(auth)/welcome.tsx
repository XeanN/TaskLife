import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function WelcomeScreen() {
  const { theme } = useTheme();
  const { isLoading } = useAuth();
  const { signInWithGoogle, isReady } = useGoogleAuth();
  const s = makeStyles(theme);

  return (
    <SafeAreaView style={s.container}>
      {/* Logo */}
      <View style={s.logoRow}>
        <Image
          source={require("@/assets/images/logo_up.png")}
          style={s.logoImg}
          resizeMode="contain"
        />
        <Text style={s.logoText}>TaskLife</Text>
      </View>

      {/* Ilustración */}
      <View style={s.heroCard}>
        <Image
          source={require("@/assets/images/logo_inicial.png")}
          style={s.heroImg}
          resizeMode="contain"
        />
      </View>

      {/* Textos */}
      <Text style={s.title}>TaskLife</Text>
      <Text style={s.subtitle}>
        Gestiona estudio, trabajo y bienestar{"\n"}en un solo lugar
      </Text>

      {/* Botones */}
      <View style={s.buttons}>
        <Pressable
          style={({ pressed }) => [s.btn, s.btnEmail, pressed && s.pressed]}
          onPress={() => router.push("/(auth)/login")}
          disabled={isLoading}
        >
          <Ionicons name="mail-outline" size={20} color="#fff" />
          <Text style={s.btnText}>Continuar con mi email</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [s.btn, s.btnGoogle, pressed && s.pressed]}
          onPress={signInWithGoogle}
          disabled={!isReady || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="logo-google" size={20} color="#fff" />
              <Text style={s.btnText}>Continuar con Google</Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Login */}
      <Pressable onPress={() => router.push("/(auth)/login")}>
        <Text style={s.loginRow}>
          ¿Ya tienes cuenta?{"  "}
          <Text style={s.loginLink}>Inicia sesión</Text>
        </Text>
      </Pressable>

      {/* Términos */}
      <Text style={s.terms}>
        Al continuar con estos servicios, aceptas los{" "}
        <Text style={s.termsLink}>Términos de Servicio</Text> y nuestra{" "}
        <Text style={s.termsLink}>Política de Privacidad</Text>
      </Text>
    </SafeAreaView>
  );
}

const makeStyles = (t: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: t.bg,
      alignItems: "center",
      paddingHorizontal: 28,
      paddingTop: 16,
      paddingBottom: 24,
    },
    logoRow: {
      alignItems: "center",
      marginBottom: 20,
    },
    logoImg: {
      width: 64,
      height: 64,
      borderRadius: 16,
    },
    logoText: {
      fontSize: 13,
      color: t.textSecond,
      marginTop: 4,
      fontWeight: "500",
    },
    heroCard: {
      width: "100%",
      height: 200,
      backgroundColor: t.primaryLight,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 28,
    },
    heroImg: {
      width: "85%",
      height: "85%",
    },
    title: {
      fontSize: 32,
      fontWeight: "800",
      color: t.text,
      letterSpacing: -0.5,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 15,
      color: t.textSecond,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 32,
    },
    buttons: {
      width: "100%",
      gap: 12,
      marginBottom: 20,
    },
    btn: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 15,
      borderRadius: 14,
      gap: 10,
      minHeight: 52,
    },
    pressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
    btnEmail: {
      backgroundColor: t.primary,
    },
    btnGoogle: {
      backgroundColor: "#4285F4",
    },
    btnText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
    },
    loginRow: {
      fontSize: 14,
      color: t.textSecond,
      marginBottom: 16,
    },
    loginLink: {
      color: t.primary,
      fontWeight: "700",
    },
    terms: {
      fontSize: 11,
      color: t.textThird,
      textAlign: "center",
      lineHeight: 17,
      paddingHorizontal: 8,
    },
    termsLink: {
      color: t.primary,
      fontWeight: "600",
    },
  });
