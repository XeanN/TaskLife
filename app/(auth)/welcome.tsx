import { ErrorAlert, useErrorAlert } from "@/components/ErrorAlert";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
    ActivityIndicator,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const { theme } = useTheme();
  const { isLoading } = useAuth();
  const { signInWithGoogle, isReady, loading: googleLoading } = useGoogleAuth();
  const errorAlert = useErrorAlert();
  const s = makeStyles(theme);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      errorAlert.show(error);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <ErrorAlert
        visible={errorAlert.visible}
        error={errorAlert.error}
        onDismiss={errorAlert.hide}
        onRetry={handleGoogleSignIn}
        autoHideDuration={0}
      />

      {/* Logo */}
      <Pressable style={s.logoRow} onPress={() => router.push("/settings") }>
        <Image
          source={require("@/assets/images/logo_up.png")}
          style={s.logoImg}
          resizeMode="contain"
        />
        <Text style={s.logoText}>TaskLife</Text>
      </Pressable>

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
          onPress={handleGoogleSignIn}
          disabled={!isReady || isLoading || googleLoading}
        >
          {isLoading || googleLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="logo-google" size={20} color="#fff" />
              <Text style={s.btnText}>
                {isReady ? "Continuar con Google" : "Google requiere dev client"}
              </Text>
            </>
          )}
        </Pressable>

        {!isReady && (
          <Text style={s.googleHint}>
            Expo Go no puede abrir el selector nativo. Usa un dev client o un build APK/AAB.
          </Text>
        )}
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
        <Pressable onPress={() => router.push("/settings/privacy")}>
          <Text style={s.termsLink}>Política de Privacidad</Text>
        </Pressable>
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
    googleHint: {
      fontSize: 12,
      lineHeight: 16,
      color: t.textSecond,
      textAlign: "center",
      marginTop: 2,
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
