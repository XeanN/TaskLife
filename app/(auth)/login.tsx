import { ErrorAlert, useErrorAlert } from "@/components/ErrorAlert";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const { theme } = useTheme();
  const s = makeStyles(theme);
  const errorAlert = useErrorAlert();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    try {
      await login(email, password);
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
        onRetry={handleLogin}
        autoHideDuration={0}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={s.inner}
      >
        {/* Header */}
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>

        <Text style={s.title}>Inicia sesión</Text>
        <Text style={s.subtitle}>Añade tu email y contraseña.</Text>

        {/* Campos */}
        <View style={s.fields}>
          <View style={s.inputWrapper}>
            <TextInput
              style={s.input}
              placeholder="Tu email personal o de trabajo"
              placeholderTextColor={theme.textThird}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={s.inputWrapper}>
            <TextInput
              style={[s.input, { flex: 1 }]}
              placeholder="Tu contraseña"
              placeholderTextColor={theme.textThird}
              secureTextEntry={!showPass}
              value={password}
              onChangeText={setPassword}
            />
            <Pressable onPress={() => setShowPass(!showPass)} style={s.eyeBtn}>
              <Ionicons
                name={showPass ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={theme.textSecond}
              />
            </Pressable>
          </View>
        </View>

        {/* Olvidé contraseña */}
        <Pressable style={s.forgotBtn}>
          <Text style={s.forgotText}>¿Olvidaste tu contraseña?</Text>
        </Pressable>

        {/* Botón */}
        <Pressable
          style={({ pressed }) => [s.btn, pressed && s.pressed]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.btnText}>Iniciar sesión</Text>
          )}
        </Pressable>

        {/* Registro */}
        <Pressable onPress={() => router.replace("/(auth)/register")}>
          <Text style={s.registerRow}>
            ¿No tienes cuenta?{"  "}
            <Text style={s.registerLink}>Regístrate</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (t: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: t.bg,
    },
    inner: {
      flex: 1,
      paddingHorizontal: 28,
      paddingTop: 16,
      paddingBottom: 24,
    },
    backBtn: {
      marginBottom: 32,
    },
    title: {
      fontSize: 32,
      fontWeight: "800",
      color: t.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 15,
      color: t.textSecond,
      marginBottom: 32,
    },
    fields: {
      gap: 12,
      marginBottom: 12,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: t.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: t.border,
      paddingHorizontal: 16,
      height: 54,
    },
    input: {
      flex: 1,
      fontSize: 15,
      color: t.text,
    },
    eyeBtn: {
      padding: 4,
    },
    forgotBtn: {
      alignSelf: "center",
      marginBottom: 28,
    },
    forgotText: {
      fontSize: 14,
      color: t.primary,
      fontWeight: "600",
    },
    btn: {
      backgroundColor: t.primary,
      borderRadius: 14,
      height: 54,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
    },
    pressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
    btnText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
    },
    registerRow: {
      textAlign: "center",
      fontSize: 14,
      color: t.textSecond,
    },
    registerLink: {
      color: t.primary,
      fontWeight: "700",
    },
  });
