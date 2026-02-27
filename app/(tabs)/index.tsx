import { useAuth } from "@/context/AuthContext";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Datos ────────────────────────────────────────────────
const AREAS = [
  {
    id: "work",
    label: "Trabajo",
    icon: "briefcase",
    color: "#5C8DAE",
    count: 2,
    lib: "ionicons",
  },
  {
    id: "education",
    label: "Educación",
    icon: "school",
    color: "#7FB3D5",
    count: 1,
    lib: "ionicons",
  },
  {
    id: "finance",
    label: "Finanzas",
    icon: "chart-bar",
    color: "#66C2A5",
    count: 0,
    lib: "fa5",
  },
  {
    id: "health",
    label: "Bienestar",
    icon: "favorite-border",
    color: "#76C893",
    count: 3,
    lib: "material",
  },
] as const;

const TODAY_TASKS = [
  {
    id: "1",
    title: "Revisar correos del cliente",
    area: "Trabajo",
    done: false,
    color: "#5C8DAE",
  },
  {
    id: "2",
    title: "Leer capítulo 3 de React",
    area: "Educación",
    done: true,
    color: "#7FB3D5",
  },
  {
    id: "3",
    title: "Meditar 10 minutos",
    area: "Bienestar",
    done: false,
    color: "#76C893",
  },
];

function AreaIcon({
  lib,
  icon,
  size,
}: {
  lib: string;
  icon: string;
  size: number;
}) {
  if (lib === "fa5")
    return <FontAwesome5 name={icon as any} size={size} color="#fff" />;
  if (lib === "material")
    return <MaterialIcons name={icon as any} size={size} color="#fff" />;
  return <Ionicons name={icon as any} size={size} color="#fff" />;
}

export default function HomeScreen() {
  const { user } = useAuth();

  const pending = TODAY_TASKS.filter((t) => !t.done).length;
  const firstName = user?.name?.split(" ")[0] ?? "Usuario";

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const todayStr = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>
              {greeting()}, {firstName} 👋
            </Text>
            <Text style={s.date}>{todayStr}</Text>
          </View>
          <View style={s.avatarCircle}>
            <Text style={s.avatarText}>
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </Text>
          </View>
        </View>

        {/* ── Banner resumen ── */}
        <View style={s.banner}>
          <Ionicons name="sunny-outline" size={18} color={C.gold} />
          <Text style={s.bannerText}>
            Tienes{" "}
            <Text style={s.bannerBold}>
              {pending} tarea{pending !== 1 ? "s" : ""}
            </Text>{" "}
            pendiente{pending !== 1 ? "s" : ""} hoy
          </Text>
        </View>

        {/* ── Mi día ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Ionicons name="calendar-outline" size={17} color={C.gold} />
            <Text style={s.sectionTitle}>Mi día</Text>
          </View>

          <View style={s.dayCard}>
            {TODAY_TASKS.map((task, i) => (
              <View key={task.id} style={[s.taskRow, i > 0 && s.taskBorder]}>
                <Ionicons
                  name={task.done ? "checkmark-circle" : "ellipse-outline"}
                  size={22}
                  color={task.done ? task.color : "#ddd"}
                />
                <View style={s.taskInfo}>
                  <Text style={[s.taskTitle, task.done && s.taskDone]}>
                    {task.title}
                  </Text>
                  <View style={[s.tag, { backgroundColor: task.color + "22" }]}>
                    <Text style={[s.tagText, { color: task.color }]}>
                      {task.area}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── Áreas ── */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { marginBottom: 12 }]}>Mis áreas</Text>
          <View style={s.grid}>
            {AREAS.map((area) => (
              <Pressable
                key={area.id}
                style={({ pressed }) => [
                  s.areaCard,
                  { backgroundColor: area.color },
                  pressed && s.pressed,
                ]}
              >
                <AreaIcon lib={area.lib} icon={area.icon} size={26} />
                <Text style={s.areaLabel}>{area.label}</Text>
                <Text style={s.areaCount}>
                  {area.count} {area.count === 1 ? "tarea" : "tareas"}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Nueva tarea ── */}
        <Pressable style={({ pressed }) => [s.addBtn, pressed && s.pressed]}>
          <Ionicons name="add-circle-outline" size={22} color="#fff" />
          <Text style={s.addBtnText}>Nueva tarea</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const C = {
  bg: "#E9ECEF",
  primary: "#3F7EA6",
  gold: "#C58B00",
  goldBg: "#FDF3DC",
  text: "#1A1A2E",
  gray: "#6B7280",
  white: "#fff",
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  greeting: { fontSize: 20, fontWeight: "800", color: C.text },
  date: {
    fontSize: 12,
    color: C.gray,
    marginTop: 2,
    textTransform: "capitalize",
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "800", color: C.white },

  // Banner
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.goldBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 24,
  },
  bannerText: { fontSize: 14, color: C.gray },
  bannerBold: { color: C.primary, fontWeight: "700" },

  // Sections
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: C.text },

  // Day card
  dayCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  taskBorder: { borderTopWidth: 1, borderTopColor: "#F5F5F5" },
  taskInfo: { flex: 1 },
  taskTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: C.text,
    marginBottom: 5,
  },
  taskDone: { textDecorationLine: "line-through", color: "#bbb" },
  tag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: { fontSize: 11, fontWeight: "600" },

  // Grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  areaCard: {
    width: "48%",
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  areaLabel: { marginTop: 10, fontSize: 14, fontWeight: "700", color: C.white },
  areaCount: { marginTop: 4, fontSize: 12, color: "rgba(255,255,255,0.8)" },

  // Add button
  addBtn: {
    flexDirection: "row",
    backgroundColor: C.primary,
    borderRadius: 14,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: C.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  addBtnText: { color: C.white, fontSize: 16, fontWeight: "700" },
  pressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
});
