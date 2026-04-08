import { useAuth } from "../context/AuthContext";
import { useTheme, Theme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  
  const styles = createStyles(theme);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Campos requeridos", "Por favor completa todos los campos");
      return;
    }
    try {
      await login(email, password);
      // navigation.replace("Main") ya está manejado por el RootStack basado en estado Auth
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        {/* Header */}
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>

        <Text style={styles.title}>Bienvenido de vuelta</Text>
        <Text style={styles.subtitle}>Inicia sesión en tu cuenta</Text>

        {/* Campos */}
        <View style={styles.fields}>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={theme.textSecond}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor={theme.textSecond}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={theme.textSecond}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Contraseña"
              placeholderTextColor={theme.textSecond}
              secureTextEntry={!showPass}
              value={password}
              onChangeText={setPassword}
            />
            <Pressable
              onPress={() => setShowPass(!showPass)}
              style={styles.eyeBtn}
            >
              <Ionicons
                name={showPass ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={theme.textSecond}
              />
            </Pressable>
          </View>

          <Pressable style={styles.forgotBtn}>
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </Pressable>
        </View>

        {/* Botón */}
        <Pressable
          style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Iniciar sesión</Text>
          )}
        </Pressable>

        {/* Registro */}
        <Pressable onPress={() => navigation.replace("Register")}>
          <Text style={styles.registerRow}>
            ¿No tienes cuenta?{"  "}
            <Text style={styles.registerLink}>Regístrate</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  inner: { flex: 1, paddingHorizontal: 28, paddingTop: 16, paddingBottom: 24 },
  backBtn: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: "800", color: theme.text, marginBottom: 6 },
  subtitle: { fontSize: 15, color: theme.textSecond, marginBottom: 32 },
  fields: { gap: 14, marginBottom: 8 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.inputBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 14,
    height: 54,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: theme.text },
  eyeBtn: { padding: 4 },
  forgotBtn: { alignSelf: "flex-end" },
  forgotText: { fontSize: 13, color: theme.primary, fontWeight: "600" },
  btn: {
    backgroundColor: theme.primary,
    borderRadius: 14,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 20,
    shadowColor: theme.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  registerRow: { textAlign: "center", fontSize: 14, color: theme.textSecond },
  registerLink: { color: theme.primary, fontWeight: "700" },
});
