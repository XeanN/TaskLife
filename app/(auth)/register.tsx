import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function RegisterScreen() {
  const { register, isLoading } = useAuth();
  const { theme } = useTheme();
  const s = makeStyles(theme);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleRegister = async () => {
    try {
      await register("Usuario", email, password, confirmPassword);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={s.inner}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Pressable style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>

          <Text style={s.title}>Registrarme</Text>
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
              <Pressable
                onPress={() => setShowPass(!showPass)}
                style={s.eyeBtn}
              >
                <Ionicons
                  name={showPass ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={theme.textSecond}
                />
              </Pressable>
            </View>

            <View style={s.inputWrapper}>
              <TextInput
                style={s.input}
                placeholder="Confirmar contraseña"
                placeholderTextColor={theme.textThird}
                secureTextEntry={!showPass}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </View>

          {/* Botón */}
          <Pressable
            style={({ pressed }) => [s.btn, pressed && s.pressed]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.btnText}>Registrarme</Text>
            )}
          </Pressable>

          {/* Login */}
          <Pressable onPress={() => router.replace("/(auth)/login")}>
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
        </ScrollView>
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
      paddingHorizontal: 28,
      paddingTop: 16,
      paddingBottom: 40,
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
      marginBottom: 24,
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
    loginRow: {
      textAlign: "center",
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
