import { useAuth } from "@/context/AuthContext";
import { subscribeToTasks } from "@/services/taskService";
import { Ionicons } from "@expo/vector-icons";
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
  },
  { id: "theme", icon: "color-palette-outline", label: "Tema de la app" },
  { id: "privacy", icon: "shield-checkmark-outline", label: "Privacidad" },
  { id: "help", icon: "help-circle-outline", label: "Ayuda y soporte" },
  {
    id: "about",
    icon: "information-circle-outline",
    label: "Acerca de TaskLife",
  },
] as const;

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  // Stats reales desde Firestore
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

        // Recalcular totales cada vez que cambia un área
        const done = Object.values(counts).reduce((a, c) => a + c.done, 0);
        const pending = Object.values(counts).reduce(
          (a, c) => a + (c.total - c.done),
          0,
        );
        const active = Object.values(counts).filter((c) => c.total > 0).length;

        setTotalDone(done);
        setTotalPending(pending);
        setActiveAreas(active);
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

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Mi perfil</Text>

        {/* ── Avatar ── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{user?.name ?? "Usuario"}</Text>
          <Text style={styles.userEmail}>{user?.email ?? ""}</Text>
          <View style={styles.providerBadge}>
            <Ionicons
              name={
                user?.provider === "google" ? "logo-google" : "mail-outline"
              }
              size={13}
              color="#3F7EA6"
            />
            <Text style={styles.providerText}>
              {user?.provider === "google" ? "Google" : "Email"}
            </Text>
          </View>
        </View>

        {/* ── Stats reales ── */}
        <View style={styles.statsRow}>
          {STATS.map((stat, i) => (
            <View
              key={i}
              style={[
                styles.statItem,
                i < STATS.length - 1 && styles.statDivider,
              ]}
            >
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Menú ── */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, i) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.menuRow,
                i > 0 && styles.menuBorder,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.menuIconWrapper}>
                <Ionicons name={item.icon as any} size={20} color="#3F7EA6" />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </Pressable>
          ))}
        </View>

        {/* ── Cerrar sesión ── */}
        <Pressable
          style={({ pressed }) => [
            styles.logoutBtn,
            pressed && { opacity: 0.85 },
          ]}
          onPress={logout}
        >
          <Ionicons name="log-out-outline" size={20} color="#E53E3E" />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>

        <Text style={styles.version}>TaskLife v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const C = {
  bg: "#E9ECEF",
  primary: "#3F7EA6",
  white: "#fff",
  text: "#1A1A2E",
  gray: "#6B7280",
  border: "#F0F0F0",
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },

  screenTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: C.text,
    marginBottom: 20,
  },

  avatarSection: { alignItems: "center", marginBottom: 24 },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    elevation: 6,
  },
  avatarText: { fontSize: 28, fontWeight: "800", color: C.white },
  userName: { fontSize: 20, fontWeight: "800", color: C.text, marginBottom: 4 },
  userEmail: { fontSize: 13, color: C.gray, marginBottom: 8 },
  providerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E8F4FD",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  providerText: { fontSize: 12, color: C.primary, fontWeight: "600" },

  statsRow: {
    flexDirection: "row",
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: "center" },
  statDivider: { borderRightWidth: 1, borderRightColor: C.border },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: C.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: C.gray,
    textAlign: "center",
    lineHeight: 16,
  },

  menuCard: {
    backgroundColor: C.white,
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
  menuBorder: { borderTopWidth: 1, borderTopColor: C.border },
  menuIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EAF4FB",
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { flex: 1, fontSize: 15, color: C.text, fontWeight: "500" },
  pressed: { opacity: 0.7 },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.white,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: "#E53E3E",
  },
  logoutText: { color: "#E53E3E", fontSize: 16, fontWeight: "700" },
  version: { textAlign: "center", fontSize: 12, color: "#bbb" },
});
