import { useTheme } from "@/context/ThemeContext";
import {
  DEFAULT_NOTIF_PREFS,
  getNotifPreferences,
  NotifPrefs,
  saveNotifPreferences,
} from "@/services/storageService";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NOTIF_ITEMS: {
  id: keyof NotifPrefs;
  icon: string;
  label: string;
  hint: string;
}[] = [
  {
    id: "tasks_due",
    icon: "alarm-outline",
    label: "Tareas por vencer",
    hint: "Aviso cuando una tarea está próxima a vencer",
  },
  {
    id: "daily_recap",
    icon: "calendar-outline",
    label: "Resumen diario",
    hint: "Notificación con tu resumen del día cada mañana",
  },
  {
    id: "completed",
    icon: "checkmark-circle-outline",
    label: "Tareas completadas",
    hint: "Confirmación al marcar una tarea como hecha",
  },
];

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const s = makeStyles(theme);

  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_NOTIF_PREFS);

  useEffect(() => {
    getNotifPreferences().then(setPrefs);
  }, []);

  const toggle = async (id: keyof NotifPrefs) => {
    const next = { ...prefs, [id]: !prefs[id] };
    setPrefs(next);
    await saveNotifPreferences(next);
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={s.headerTitle}>Notificaciones</Text>
      </View>

      <View style={s.content}>
        <Text style={s.subtitle}>Elige qué notificaciones quieres recibir</Text>

        <View
          style={[
            s.card,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          {NOTIF_ITEMS.map((item, i) => (
            <View
              key={item.id}
              style={[
                s.row,
                i > 0 && { borderTopWidth: 1, borderTopColor: theme.border },
              ]}
            >
              <View
                style={[
                  s.iconBox,
                  {
                    backgroundColor: prefs[item.id]
                      ? theme.primaryLight
                      : theme.inputBg,
                  },
                ]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={prefs[item.id] ? theme.primary : theme.textSecond}
                />
              </View>
              <View style={s.info}>
                <Text style={[s.label, { color: theme.text }]}>
                  {item.label}
                </Text>
                <Text style={[s.hint, { color: theme.textSecond }]}>
                  {item.hint}
                </Text>
              </View>
              <Switch
                value={prefs[item.id]}
                onValueChange={() => toggle(item.id)}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </View>

        <View style={[s.noteBox, { backgroundColor: theme.inputBg }]}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={theme.textSecond}
          />
          <Text style={[s.noteText, { color: theme.textSecond }]}>
            Las notificaciones push requieren permisos del sistema. Puedes
            activarlas desde Configuración de tu teléfono.
          </Text>
        </View>
      </View>
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
    content: { padding: 20, gap: 16 },
    subtitle: { fontSize: 14, color: t.textSecond },
    card: {
      borderRadius: 16,
      borderWidth: 1,
      overflow: "hidden",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      gap: 12,
    },
    iconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    info: { flex: 1 },
    label: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
    hint: { fontSize: 12, lineHeight: 16 },
    noteBox: {
      flexDirection: "row",
      gap: 8,
      borderRadius: 12,
      padding: 14,
    },
    noteText: { flex: 1, fontSize: 12, lineHeight: 18 },
  });
