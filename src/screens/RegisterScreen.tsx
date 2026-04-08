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
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function RegisterScreen() {
  const { register, isLoading } = useAuth();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const styles = createStyles(theme);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Campos requeridos", "Por favor completa todos los campos");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }
    try {
      await register(name, email, password);
      // navigation.replace("Main") ya está manejado por el RootStack basado en estado Auth
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.inner}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>

          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Empieza a organizar tu vida hoy</Text>

          {/* Campos */}
          <View style={styles.fields}>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={20}
                color={theme.textSecond}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                placeholderTextColor={theme.textSecond}
                autoCapitalize="words"
                value={name}
                onChangeText={setName}
              />
            </View>

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

            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={theme.textSecond}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirmar contraseña"
                placeholderTextColor={theme.textSecond}
                secureTextEntry={!showPass}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </View>

          {/* Botón */}
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Crear cuenta</Text>
            )}
          </Pressable>

          {/* Login */}
          <Pressable onPress={() => navigation.replace("Login")}>
            <Text style={styles.loginRow}>
              ¿Ya tienes cuenta?{"  "}
              <Text style={styles.loginLink}>Inicia sesión</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  inner: { paddingHorizontal: 28, paddingTop: 16, paddingBottom: 40 },
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
  loginRow: { textAlign: "center", fontSize: 14, color: theme.textSecond },
  loginLink: { color: theme.primary, fontWeight: "700" },
});
