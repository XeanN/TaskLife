import { useTheme } from "@/context/ThemeContext";
import { apiFetch, clearBackendAccessToken, loadBackendAccessToken, setBackendAccessToken } from "@/services/apiClient";
import { getApiUrl, getApiUrlDefault, loadApiUrlOverride, setApiUrlOverride } from "@/services/runtimeConfig";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BackendSettings() {
  const { theme } = useTheme();
  const s = makeStyles(theme);

  const [override, setOverride] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [backendToken, setBackendToken] = useState<string | null>(null);
  const [backendInput, setBackendInput] = useState("");

  useEffect(() => {
    loadApiUrlOverride().then((v) => {
      setOverride(v);
      setInput(v ?? "");
    });
    loadBackendAccessToken().then((t) => {
      setBackendToken(t);
      setBackendInput(t ?? "");
    });
  }, []);

  const save = async () => {
    const val = input && input.length ? input : null;
    await setApiUrlOverride(val);
    setOverride(val);
    alert("Override guardado. Reinicia la app si es necesario.");
  };

  const clear = async () => {
    await setApiUrlOverride(null);
    setOverride(null);
    setInput("");
    alert("Override eliminado. Se usará la URL por defecto.");
  };

  const saveBackendToken = async () => {
    const val = backendInput && backendInput.length ? backendInput : null;
    await setBackendAccessToken(val);
    setBackendToken(val);
    alert("Access token guardado en la app.");
  };

  const clearBackendToken = async () => {
    await clearBackendAccessToken();
    setBackendToken(null);
    setBackendInput("");
    alert("Access token eliminado.");
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>Backend / API</Text>
      </View>

      <View style={s.content}>
        <Text style={s.label}>URL por defecto</Text>
        <Text style={s.value}>{getApiUrlDefault()}</Text>

        <Text style={[s.label, { marginTop: 20 }]}>Override actual</Text>
        <Text style={s.value}>{override ?? "(ninguno)"}</Text>

        <Text style={[s.label, { marginTop: 20 }]}>Establecer override</Text>
        <TextInput
          style={[s.input, { color: theme.text }]}
          placeholder="https://mi-backend-publico.com"
          placeholderTextColor={theme.textSecond}
          value={input}
          onChangeText={setInput}
          autoCapitalize="none"
        />

        <View style={s.row}>
          <Pressable style={s.btn} onPress={save}>
            <Text style={s.btnText}>Guardar override</Text>
          </Pressable>
          <Pressable style={[s.btn, { backgroundColor: theme.danger }]} onPress={clear}>
            <Text style={s.btnText}>Eliminar override</Text>
          </Pressable>
        </View>

        <View style={{ marginTop: 20 }}>
          <Text style={s.hint}>
            Usa esto para alternar entre la URL por defecto (definida en .env.local)
            y una URL pública o local sin tocar archivos.
          </Text>
        </View>

        <View style={{ marginTop: 28 }}>
          <Text style={[s.label, { marginTop: 0 }]}>Pegar access token (solo para pruebas)</Text>
          <TextInput
            style={[s.input, { color: theme.text }]}
            placeholder="pega aquí el accessToken devuelto por /auth/firebase"
            placeholderTextColor={theme.textSecond}
            value={backendInput}
            onChangeText={setBackendInput}
            autoCapitalize="none"
            multiline
          />

          <View style={s.row}>
            <Pressable style={s.btn} onPress={saveBackendToken}>
              <Text style={s.btnText}>Guardar token</Text>
            </Pressable>
            <Pressable style={[s.btn, { backgroundColor: theme.danger }]} onPress={clearBackendToken}>
              <Text style={s.btnText}>Eliminar token</Text>
            </Pressable>
          </View>

          <Text style={[s.hint, { marginTop: 12 }]}>Token actual: {backendToken ? "(guardado)" : "(ninguno)"}</Text>
        </View>

        <View style={{ marginTop: 20 }}>
          <Pressable
            style={[s.btn, { marginTop: 6 }]}
            onPress={async () => {
              const API_URL = getApiUrl();
              const url = `${API_URL}/users/me/weekly-report`;
              try {
                console.log("Testing connection to:", url);
                const res = await apiFetch(url, { method: "GET" });
                const text = await res.text();
                alert(`Status: ${res.status} \nBody: ${text}`);
              } catch (err: any) {
                console.error("Connection test failed:", err);
                alert(`Connection test failed: ${err.message || String(err)}`);
              }
            }}
          >
            <Text style={s.btnText}>Probar conexión</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (t: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },
    header: { padding: 16, borderBottomWidth: 1, borderBottomColor: t.border },
    title: { fontSize: 18, fontWeight: '800', color: t.text },
    content: { padding: 16 },
    label: { color: t.textSecond, marginBottom: 6 },
    value: { color: t.text, fontWeight: '600' },
    input: { borderWidth: 1, borderColor: t.border, borderRadius: 8, padding: 12, marginTop: 6 },
    row: { flexDirection: 'row', gap: 12, marginTop: 16 },
    btn: { backgroundColor: t.primary, padding: 12, borderRadius: 8, flex: 1, alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: '700' },
    hint: { color: t.textSecond, fontSize: 13 },
  });
