import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Opciones del menú ────────────────────────────────────
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

// ─── Stats de ejemplo ─────────────────────────────────────
const STATS = [
  { label: "Tareas\ncompletadas", value: "12" },
  { label: "Racha\nactual", value: "5d" },
  { label: "Áreas\nactivas", value: "4" },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "TL";

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <Text style={styles.screenTitle}>Mi perfil</Text>

        {/* ── Avatar + nombre ── */}
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

        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          {STATS.map((stat, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Menú opciones ── */}
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

  // Avatar
  avatarSection: { alignItems: "center", marginBottom: 24 },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: C.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
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

  // Stats
  statsRow: {
    flexDirection: "row",
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: "center" },
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

  // Menu
  menuCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
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

  // Logout
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
