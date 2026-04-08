import { useTheme } from "../../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NOTIF_ITEMS = [
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
] as const;

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const s = makeStyles(theme);

  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    tasks_due: true,
    daily_recap: false,
    completed: false,
  });

  useEffect(() => {
    AsyncStorage.getItem("notif_prefs").then((val) => {
      if (val) setPrefs(JSON.parse(val));
    });
  }, []);

  const toggle = async (id: string) => {
    const next = { ...prefs, [id]: !prefs[id] };
    setPrefs(next);
    await AsyncStorage.setItem("notif_prefs", JSON.stringify(next));
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={s.headerTitle}>Notificaciones</Text>
      </View>

      <View style={s.content}>
        <Text style={s.subtitle}>Elige qué notificaciones quieres recibir</Text>

        <View style={s.card}>
          {NOTIF_ITEMS.map((item, i) => (
            <View key={item.id} style={[s.row, i > 0 && s.border]}>
              <View
                style={[
                  s.iconBox,
                  {
                    backgroundColor: prefs[item.id]
                      ? theme.primary + "22"
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
                <Text style={s.label}>{item.label}</Text>
                <Text style={s.hint}>{item.hint}</Text>
              </View>
              <Switch
                value={prefs[item.id]}
                onValueChange={() => toggle(item.id)}
                trackColor={{ false: "#ddd", true: theme.primary }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </View>

        <View style={s.noteBox}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={theme.textSecond}
          />
          <Text style={s.noteText}>
            Las notificaciones push requieren permisos del sistema. Puedes
            activarlas desde Configuración de tu teléfono.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (t: any) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 8,
      backgroundColor: t.card,
      elevation: 2,
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: "800", color: t.text },
    content: { padding: 20 },
    subtitle: { fontSize: 14, color: t.textSecond, marginBottom: 20 },
    card: {
      backgroundColor: t.card,
      borderRadius: 16,
      marginBottom: 16,
      elevation: 2,
    },
    row: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
    border: { borderTopWidth: 1, borderTopColor: t.border },
    iconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    info: { flex: 1 },
    label: { fontSize: 15, fontWeight: "600", color: t.text, marginBottom: 2 },
    hint: { fontSize: 12, color: t.textSecond, lineHeight: 16 },
    noteBox: {
      flexDirection: "row",
      gap: 8,
      backgroundColor: t.inputBg,
      borderRadius: 12,
      padding: 14,
    },
    noteText: { flex: 1, fontSize: 12, color: t.textSecond, lineHeight: 18 },
  });
