import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
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
  const { signInWithGoogle, isReady } = useGoogleAuth();
  const { isLoading } = useAuth();
  const navigation = useNavigation<any>();

  const C = {
    bg: theme.bg,
    heroCardBg: theme.iconBg,
    primary: theme.primary,
    google: "#4285F4",
    text: theme.text,
    gray: theme.textSecond,
    link: theme.primary,
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: C.bg,
      alignItems: "center",
      paddingHorizontal: 28,
      paddingTop: 16,
      paddingBottom: 24,
    },
    appIconWrapper: { alignItems: "center", marginBottom: 16 },
    appIcon: { width: 64, height: 64, borderRadius: 16 },
    appIconLabel: {
      fontSize: 13,
      color: C.gray,
      marginTop: 4,
      fontWeight: "500",
    },
    heroCard: {
      width: "100%",
      height: 200,
      backgroundColor: C.heroCardBg,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 28,
      shadowColor: "#000",
      shadowOpacity: 0.07,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    heroImage: { width: "85%", height: "85%" },
    title: {
      fontSize: 32,
      fontWeight: "800",
      color: C.text,
      letterSpacing: -0.5,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 15,
      color: C.gray,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 32,
    },
    buttons: { width: "100%", gap: 12, marginBottom: 20 },
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
    pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
    btnEmail: {
      backgroundColor: C.primary,
      shadowColor: C.primary,
      shadowOpacity: 0.35,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 5,
    },
    btnGoogle: {
      backgroundColor: C.google,
      shadowColor: C.google,
      shadowOpacity: 0.3,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 5,
    },
    btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    loginRow: { fontSize: 14, color: C.gray, marginBottom: 16 },
    loginLink: { color: C.link, fontWeight: "700" },
    terms: {
      fontSize: 11,
      color: C.gray,
      textAlign: "center",
      lineHeight: 17,
      paddingHorizontal: 8,
    },
    termsLink: { color: C.link, fontWeight: "600" },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      {/* Ícono de app */}
      <View style={dynamicStyles.appIconWrapper}>
        <Image
          source={require("@/assets/images/logo_up.png")}
          style={dynamicStyles.appIcon}
          resizeMode="contain"
        />
        <Text style={dynamicStyles.appIconLabel}>TaskLife</Text>
      </View>

      {/* Hero */}
      <View style={dynamicStyles.heroCard}>
        <Image
          source={require("@/assets/images/logo_inicial.png")}
          style={dynamicStyles.heroImage}
          resizeMode="contain"
        />
      </View>

      {/* Textos */}
      <Text style={dynamicStyles.title}>TaskLife</Text>
      <Text style={dynamicStyles.subtitle}>
        Gestiona estudio, trabajo y bienestar{"\n"}en un solo lugar
      </Text>

      {/* Botones */}
      <View style={dynamicStyles.buttons}>
        <Pressable
          style={({ pressed }) => [
            dynamicStyles.btn,
            dynamicStyles.btnEmail,
            pressed && dynamicStyles.pressed,
          ]}
          onPress={() => navigation.navigate("Login")}
          disabled={isLoading}
        >
          <Ionicons name="mail-outline" size={20} color="#fff" />
          <Text style={dynamicStyles.btnText}>Continuar con mi email</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            dynamicStyles.btn,
            dynamicStyles.btnGoogle,
            pressed && dynamicStyles.pressed,
          ]}
          onPress={signInWithGoogle}
          disabled={!isReady || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <AntDesign name="google" size={20} color="#fff" />
              <Text style={dynamicStyles.btnText}>Continuar con Google</Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Login */}
      <Pressable onPress={() => navigation.navigate("Login")}>
        <Text style={dynamicStyles.loginRow}>
          ¿Ya tienes cuenta?{"  "}
          <Text style={dynamicStyles.loginLink}>Inicia sesión</Text>
        </Text>
      </Pressable>

      {/* Términos */}
      <Text style={dynamicStyles.terms}>
        Al continuar con estos servicios, aceptas los{" "}
        <Text style={dynamicStyles.termsLink}>Términos de Servicio</Text> y nuestra{" "}
        <Text style={dynamicStyles.termsLink}>Política de Privacidad</Text>
      </Text>
    </SafeAreaView>
  );
}
