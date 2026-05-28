import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ITEMS = [
  {
    id: "notifications",
    icon: "notifications-outline",
    label: "Notificaciones",
    route: "/settings/notifications",
  },
  {
    id: "backend",
    icon: "server-outline",
    label: "Backend / API",
    route: "/settings/backend",
  },
  {
    id: "stats",
    icon: "stats-chart-outline",
    label: "Estadisticas",
    route: "/settings/stats",
  },
  {
    id: "privacy",
    icon: "shield-checkmark-outline",
    label: "Privacidad",
    route: "/settings/privacy",
  },
  {
    id: "help",
    icon: "help-circle-outline",
    label: "Ayuda y soporte",
    route: "/settings/help",
  },
  {
    id: "about",
    icon: "information-circle-outline",
    label: "Acerca de TaskLife",
    route: "/settings/about",
  },
] as const;

export default function SettingsHomeScreen() {
  const { theme } = useTheme();
  const s = makeStyles(theme);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={s.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.subtitle}>Accesos rapidos</Text>

        <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {ITEMS.map((item, i) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                s.row,
                i > 0 && { borderTopWidth: 1, borderTopColor: theme.border },
                pressed && { opacity: 0.75 },
              ]}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[s.iconBox, { backgroundColor: theme.iconBg }]}> 
                <Ionicons name={item.icon as any} size={20} color={theme.primary} />
              </View>
              <Text style={[s.label, { color: theme.text }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={17} color={theme.textThird} />
            </Pressable>
          ))}
        </View>
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
    subtitle: { color: t.textSecond, fontSize: 13 },
    card: {
      borderWidth: 1,
      borderRadius: 16,
      overflow: "hidden",
    },
    row: {
      minHeight: 56,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      gap: 12,
    },
    iconBox: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    label: {
      flex: 1,
      fontSize: 14,
      fontWeight: "600",
    },
  });
