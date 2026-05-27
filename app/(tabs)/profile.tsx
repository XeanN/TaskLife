import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useAllTasks } from "@/hooks/useTasks";
import { AREAS } from "@/models/Area";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MENU_ITEMS = [
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
    id: "create-reminder",
    icon: "alarm-outline",
    label: "Crear recordatorio (dev)",
    route: "/settings/createReminder",
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
  const { theme, dark, toggle } = useTheme();
  const { allTasks, loading, error, fetchTasks } = useAllTasks();
  const s = makeStyles(theme);

  // NOTE: Disabled auto-refetch on focus to prevent Firestore quota exhaustion
  // Tasks only refetch after CRUD operations (create, edit, delete)

  const totalDone = Object.values(allTasks)
    .flat()
    .filter((t) => t.done).length;

  const totalPending = Object.values(allTasks)
    .flat()
    .filter((t) => !t.done).length;

  const activeAreas = AREAS.filter(
    (a) => (allTasks[a.id] ?? []).length > 0,
  ).length;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "TL";

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro? Lo extrañaremos.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Continuar",
        style: "destructive",
        onPress: logout,
      },
    ]);
  };

  const STATS = [
    {
      label: "Completadas",
      value: totalDone,
      icon: "checkmark-circle-outline",
      color: theme.success,
    },
    {
      label: "Pendientes",
      value: totalPending,
      icon: "time-outline",
      color: theme.primary,
    },
    {
      label: "Áreas activas",
      value: activeAreas,
      icon: "grid-outline",
      color: theme.gold,
    },
  ];

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.screenTitle}>Mi perfil</Text>

        {loading && (
          <View style={s.statusCard}>
            <ActivityIndicator color={theme.primary} />
            <Text style={s.statusText}>Actualizando estadísticas...</Text>
          </View>
        )}

        {!loading && error && (
          <View style={s.statusCard}>
            <Text style={[s.statusText, { color: theme.danger }]}>
              No se pudieron cargar las estadísticas.
            </Text>
            <Pressable style={s.retryBtn} onPress={fetchTasks}>
              <Text style={s.retryText}>Reintentar</Text>
            </Pressable>
          </View>
        )}

        {/* Avatar */}
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
              size={12}
              color={theme.primary}
            />
            <Text style={s.providerText}>
              {user?.provider === "google" ? "Google" : "Email"}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          {STATS.map((stat, i) => (
            <View
              key={i}
              style={[s.statItem, i < STATS.length - 1 && s.statDivider]}
            >
              <Ionicons name={stat.icon as any} size={20} color={stat.color} />
              <Text style={[s.statValue, { color: stat.color }]}>
                {stat.value}
              </Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Botón de Estadísticas Detalladas */}
        <Pressable
          style={({ pressed }) => [
            s.detailedStatsBtn,
            pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
          ]}
          onPress={() => router.push("/settings/stats")}
        >
          <Ionicons name="stats-chart" size={18} color="#fff" />
          <Text style={s.detailedStatsBtnText}>Ver Estadísticas Detalladas</Text>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </Pressable>

        {/* Modo oscuro */}
        <View style={s.darkCard}>
          <View style={s.darkLeft}>
            <View
              style={[
                s.darkIcon,
                { backgroundColor: dark ? "#2A2010" : theme.primaryLight },
              ]}
            >
              <Ionicons
                name={dark ? "moon" : "sunny-outline"}
                size={20}
                color={dark ? theme.gold : theme.primary}
              />
            </View>
            <View>
              <Text style={s.darkLabel}>Modo {dark ? "oscuro" : "claro"}</Text>
              <Text style={s.darkHint}>
                {dark ? "Toda la app en oscuro" : "Toda la app en claro"}
              </Text>
            </View>
          </View>
          <Switch
            value={dark}
            onValueChange={toggle}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#fff"
          />
        </View>

        {/* Menú */}
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
              <View style={s.menuIcon}>
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

        {/* Logout */}
        <Pressable
          style={({ pressed }) => [s.logoutBtn, pressed && { opacity: 0.85 }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={theme.danger} />
          <Text style={s.logoutText}>Cerrar sesión</Text>
        </Pressable>

        <Text style={s.version}>TaskLife v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (t: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },
    content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
    screenTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: t.text,
      marginBottom: 24,
    },

    statusCard: {
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      backgroundColor: t.card,
      borderRadius: 16,
      paddingVertical: 18,
      paddingHorizontal: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: t.border,
    },
    statusText: {
      fontSize: 14,
      color: t.textSecond,
      fontWeight: "600",
      textAlign: "center",
    },
    retryBtn: {
      backgroundColor: t.primary,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
    },
    retryText: { color: "#fff", fontWeight: "700", fontSize: 13 },

    avatarSection: { alignItems: "center", marginBottom: 24 },
    avatarCircle: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: t.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    avatarText: { fontSize: 30, fontWeight: "800", color: "#fff" },
    userName: {
      fontSize: 20,
      fontWeight: "800",
      color: t.text,
      marginBottom: 4,
    },
    userEmail: { fontSize: 13, color: t.textSecond, marginBottom: 10 },
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
      marginBottom: 16,
      borderWidth: 1,
      borderColor: t.border,
    },
    statItem: { flex: 1, alignItems: "center", gap: 4 },
    statDivider: {
      borderRightWidth: 1,
      borderRightColor: t.border,
    },
    statValue: { fontSize: 22, fontWeight: "800" },
    statLabel: {
      fontSize: 11,
      color: t.textSecond,
      textAlign: "center",
    },

    detailedStatsBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      backgroundColor: t.primary,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    detailedStatsBtnText: {
      fontSize: 14,
      fontWeight: "700",
      color: "#fff",
      flex: 1,
      textAlign: "center",
    },

    darkCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: t.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: t.border,
    },
    darkLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    darkIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    darkLabel: { fontSize: 15, fontWeight: "600", color: t.text },
    darkHint: { fontSize: 12, color: t.textSecond, marginTop: 2 },

    menuCard: {
      backgroundColor: t.card,
      borderRadius: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: t.border,
    },
    menuRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
    menuBorder: { borderTopWidth: 1, borderTopColor: t.border },
    menuIcon: {
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
      borderColor: t.danger,
    },
    logoutText: { color: t.danger, fontSize: 16, fontWeight: "700" },
    version: { textAlign: "center", fontSize: 12, color: t.textThird },
  });
