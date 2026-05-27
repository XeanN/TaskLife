import { useTheme } from "@/context/ThemeContext";
import { getApiUrlDefault, loadApiUrlOverride, setApiUrlOverride } from "@/services/runtimeConfig";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BackendSettings() {
  const { theme } = useTheme();
  const s = makeStyles(theme);

  const [override, setOverride] = useState<string | null>(null);
  const [input, setInput] = useState("");

  useEffect(() => {
    loadApiUrlOverride().then((v) => {
      setOverride(v);
      setInput(v ?? "");
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
