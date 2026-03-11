import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { subscribeToTasks } from "@/services/taskService";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AREAS = [
  { id: "work" },
  { id: "education" },
  { id: "finance" },
  { id: "health" },
] as const;

const MENU_ITEMS = [
  {
    id: "notifications",
    icon: "notifications-outline",
    label: "Notificaciones",
    route: "/settings/notifications",
  },
  {
    id: "theme",
    icon: "color-palette-outline",
    label: "Tema de la app",
    route: "/settings/theme",
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

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  const [totalDone, setTotalDone] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [activeAreas, setActiveAreas] = useState(0);

  useEffect(() => {
    if (!user) return;
    const counts: Record<string, { done: number; total: number }> = {};
    const unsubs = AREAS.map((area) =>
      subscribeToTasks(user.id, area.id, (tasks) => {
        counts[area.id] = {
          done: tasks.filter((t) => t.done).length,
          total: tasks.length,
        };
        setTotalDone(Object.values(counts).reduce((a, c) => a + c.done, 0));
        setTotalPending(
          Object.values(counts).reduce((a, c) => a + (c.total - c.done), 0),
        );
        setActiveAreas(Object.values(counts).filter((c) => c.total > 0).length);
      }),
    );
    return () => unsubs.forEach((u) => u());
  }, [user]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "TL";

  const STATS = [
    { label: "Completadas", value: String(totalDone) },
    { label: "Pendientes", value: String(totalPending) },
    { label: "Áreas\nactivas", value: String(activeAreas) },
  ];

  const s = makeStyles(theme);

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.screenTitle}>Mi perfil</Text>

        {/* ── Avatar ── */}
        <View style={s.avatarSection}>
          <View style={s.avatarCircle}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <Text style={s.userName}>{user?.name ?? "Usuario"}</Text>
          <Text style={s.userEmail}>{user?.email ?? ""}</Text>
          <View style={s.providerBadge}>
            <Ionicons
              name={
                user?.provider === "google" ? "logo-google" : "mail-outline"
              }
              size={13}
              color={theme.primary}
            />
            <Text style={s.providerText}>
              {user?.provider === "google" ? "Google" : "Email"}
            </Text>
          </View>
        </View>

        {/* ── Stats ── */}
        <View style={s.statsRow}>
          {STATS.map((stat, i) => (
            <View
              key={i}
              style={[s.statItem, i < STATS.length - 1 && s.statDivider]}
            >
              <Text style={s.statValue}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Menú ── */}
        <View style={s.menuCard}>
          {MENU_ITEMS.map((item, i) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                s.menuRow,
                i > 0 && s.menuBorder,
                pressed && s.pressed,
              ]}
              onPress={() => router.push(item.route as any)}
            >
              <View style={s.menuIconWrapper}>
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={theme.primary}
                />
              </View>
              <Text style={s.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.border} />
            </Pressable>
          ))}
        </View>

        {/* ── Cerrar sesión ── */}
        <Pressable
          style={({ pressed }) => [s.logoutBtn, pressed && { opacity: 0.85 }]}
          onPress={logout}
        >
          <Ionicons name="log-out-outline" size={20} color="#E53E3E" />
          <Text style={s.logoutText}>Cerrar sesión</Text>
        </Pressable>

        <Text style={s.version}>TaskLife v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (
  t: ReturnType<typeof import("@/context/ThemeContext").useTheme>["theme"],
) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },
    content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
    screenTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: t.text,
      marginBottom: 20,
    },
    avatarSection: { alignItems: "center", marginBottom: 24 },
    avatarCircle: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: t.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
      elevation: 6,
    },
    avatarText: { fontSize: 28, fontWeight: "800", color: "#fff" },
    userName: {
      fontSize: 20,
      fontWeight: "800",
      color: t.text,
      marginBottom: 4,
    },
    userEmail: { fontSize: 13, color: t.textSecond, marginBottom: 8 },
    providerBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: t.iconBg,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
    },
    providerText: { fontSize: 12, color: t.primary, fontWeight: "600" },
    statsRow: {
      flexDirection: "row",
      backgroundColor: t.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
      elevation: 2,
    },
    statItem: { flex: 1, alignItems: "center" },
    statDivider: { borderRightWidth: 1, borderRightColor: t.border },
    statValue: {
      fontSize: 22,
      fontWeight: "800",
      color: t.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 11,
      color: t.textSecond,
      textAlign: "center",
      lineHeight: 16,
    },
    menuCard: {
      backgroundColor: t.card,
      borderRadius: 16,
      marginBottom: 16,
      elevation: 2,
    },
    menuRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
    menuBorder: { borderTopWidth: 1, borderTopColor: t.border },
    menuIconWrapper: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: t.iconBg,
      alignItems: "center",
      justifyContent: "center",
    },
    menuLabel: { flex: 1, fontSize: 15, color: t.text, fontWeight: "500" },
    pressed: { opacity: 0.7 },
    logoutBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: t.card,
      borderRadius: 14,
      paddingVertical: 14,
      marginBottom: 20,
      borderWidth: 1.5,
      borderColor: "#E53E3E",
    },
    logoutText: { color: "#E53E3E", fontSize: 16, fontWeight: "700" },
    version: { textAlign: "center", fontSize: 12, color: t.textSecond },
  });
