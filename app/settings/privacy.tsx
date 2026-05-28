import { useTheme } from "@/context/ThemeContext";
import { apiFetch } from "@/services/apiClient";
import { getApiUrl, getApiUrlDefault, loadApiUrlOverride, setApiUrlOverride } from "@/services/runtimeConfig";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SECTIONS = [
  {
    icon: "server-outline",
    title: "Datos que recopilamos",
    body: "TaskLife recopila únicamente los datos que tú ingresas: tu correo electrónico, nombre, y las tareas que creas. No recopilamos datos de ubicación, contactos ni información sensible del dispositivo.",
  },
  {
    icon: "shield-outline",
    title: "Cómo usamos tus datos",
    body: "Tus datos se usan exclusivamente para brindarte el servicio de gestión de tareas. No vendemos, compartimos ni cedemos tu información a terceros bajo ninguna circunstancia.",
  },
  {
    icon: "lock-closed-outline",
    title: "Almacenamiento seguro",
    body: "Toda tu información se almacena en Firebase (Google Cloud), protegida con autenticación segura. Solo tú puedes acceder a tus datos a través de tu cuenta.",
  },
  {
    icon: "trash-outline",
    title: "Eliminación de datos",
    body: "Puedes eliminar tu cuenta y todos tus datos en cualquier momento contactándonos directamente. La eliminación es permanente e irreversible.",
  },
  {
    icon: "mail-outline",
    title: "Contacto",
    body: "Si tienes dudas sobre tu privacidad escríbenos a: soporte@tasklife.app",
  },
];

export default function PrivacyScreen() {
  const { theme } = useTheme();
  const s = makeStyles(theme);
  const params = useLocalSearchParams<{ debug?: string }>();
  const debugMode = params.debug === "1" || params.debug === "true";
  const [override, setOverride] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [testing, setTesting] = useState(false);
  const [lastResult, setLastResult] = useState<string>("");

  useEffect(() => {
    loadApiUrlOverride().then((value) => {
      setOverride(value);
      setInput(value ?? "");
    });
  }, []);

  const apiUrl = useMemo(() => getApiUrl(), [override]);

  const saveOverride = async () => {
    const value = input.trim().length ? input.trim() : null;
    await setApiUrlOverride(value);
    setOverride(value);
    setLastResult(value ? `Override guardado: ${value}` : "Override eliminado");
    alert(value ? "Override guardado." : "Override eliminado.");
  };

  const clearOverride = async () => {
    await setApiUrlOverride(null);
    setOverride(null);
    setInput("");
    setLastResult("Override eliminado");
    alert("Override eliminado.");
  };

  const testConnection = async () => {
    setTesting(true);
    setLastResult("");
    try {
      const res = await apiFetch(`${apiUrl}/health`, { method: "GET" });
      const text = await res.text();
      setLastResult(`Status ${res.status}: ${text}`);
      alert(`Status ${res.status}`);
    } catch (err: any) {
      const message = err?.message || String(err);
      setLastResult(`Error: ${message}`);
      alert(`Error: ${message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={s.headerTitle}>Privacidad</Text>
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[s.intro, { color: theme.textSecond }]}>
          En TaskLife tu privacidad es nuestra prioridad.
        </Text>
        <Text style={[s.updated, { color: theme.textThird }]}>
          Última actualización: Enero 2026
        </Text>

        {SECTIONS.map((sec, i) => (
          <View
            key={i}
            style={[
              s.card,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View style={s.cardHeader}>
              <View style={[s.iconBox, { backgroundColor: theme.iconBg }]}>
                <Ionicons
                  name={sec.icon as any}
                  size={20}
                  color={theme.primary}
                />
              </View>
              <Text style={[s.cardTitle, { color: theme.text }]}>
                {sec.title}
              </Text>
            </View>
            <Text style={[s.cardBody, { color: theme.textSecond }]}>
              {sec.body}
            </Text>
          </View>
        ))}

        {debugMode && (
          <View style={[s.hiddenCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[s.hiddenTitle, { color: theme.text }]}>Ajuste oculto de API</Text>
            <Text style={[s.hiddenText, { color: theme.textSecond }]}>URL por defecto: {getApiUrlDefault()}</Text>
            <Text style={[s.hiddenText, { color: theme.textSecond }]}>Override actual: {override ?? "(ninguno)"}</Text>

            <Text style={[s.hiddenLabel, { color: theme.text }]}>Nueva URL API</Text>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="https://tu-api-publica.com"
              placeholderTextColor={theme.textThird}
              autoCapitalize="none"
              autoCorrect={false}
              multiline
              style={[s.hiddenInput, { color: theme.text, borderColor: theme.border }]}
            />

            <Text style={[s.hiddenHelp, { color: theme.textThird }]}>Pega aquí la URL nueva y guarda. Esto funciona sin iniciar sesión.</Text>

            <View style={s.hiddenRow}>
              <Pressable style={s.hiddenBtn} onPress={testConnection} disabled={testing}>
                <Text style={s.hiddenBtnText}>{testing ? "Probando..." : "Probar /health"}</Text>
              </Pressable>
              <Pressable style={[s.hiddenBtn, { backgroundColor: theme.primary }]} onPress={saveOverride}>
                <Text style={s.hiddenBtnText}>Guardar</Text>
              </Pressable>
              <Pressable style={[s.hiddenBtn, { backgroundColor: theme.danger }]} onPress={clearOverride}>
                <Text style={s.hiddenBtnText}>Limpiar</Text>
              </Pressable>
            </View>

            {!!lastResult && <Text style={[s.hiddenResult, { color: theme.textSecond }]}>{lastResult}</Text>}
          </View>
        )}

        <Text style={[s.footer, { color: theme.textThird }]}>
          TaskLife v1.0.0 · tasklife.app
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (t: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 8,
      backgroundColor: t.card,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: "800", color: t.text },
    content: { padding: 20, paddingBottom: 40, gap: 12 },
    intro: { fontSize: 14, lineHeight: 22 },
    updated: { fontSize: 11, fontStyle: "italic" },
    card: {
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      gap: 10,
    },
    cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    cardTitle: { fontSize: 15, fontWeight: "700", flex: 1 },
    cardBody: { fontSize: 13, lineHeight: 20 },
    hiddenCard: {
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      gap: 10,
      marginTop: 8,
    },
    hiddenTitle: { fontSize: 15, fontWeight: "800" },
    hiddenText: { fontSize: 12, lineHeight: 18 },
    hiddenLabel: { fontSize: 12, fontWeight: "700", marginTop: 4 },
    hiddenInput: {
      borderWidth: 1,
      borderColor: t.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 13,
    },
    hiddenHelp: { fontSize: 11, lineHeight: 16 },
    hiddenRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    hiddenBtn: {
      backgroundColor: t.textThird,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 10,
      minWidth: 88,
      alignItems: "center",
    },
    hiddenBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
    hiddenResult: { fontSize: 11, lineHeight: 16 },
    footer: { textAlign: "center", fontSize: 11, marginTop: 8 },
  });
