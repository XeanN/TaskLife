import { useAuth } from "@/context/AuthContext";
import { subscribeToTasks, Task } from "@/services/taskService";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Áreas ────────────────────────────────────────────────
const AREAS = [
  {
    id: "work",
    label: "Trabajo",
    icon: "briefcase",
    color: "#5C8DAE",
    lib: "ionicons",
  },
  {
    id: "education",
    label: "Educación",
    icon: "school",
    color: "#7FB3D5",
    lib: "ionicons",
  },
  {
    id: "finance",
    label: "Finanzas",
    icon: "chart-bar",
    color: "#66C2A5",
    lib: "fa5",
  },
  {
    id: "health",
    label: "Bienestar",
    icon: "favorite-border",
    color: "#76C893",
    lib: "material",
  },
] as const;

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
  const [allTasks, setAllTasks] = useState<Record<string, Task[]>>({});

  // Suscribir a tareas de todas las áreas en tiempo real
  useEffect(() => {
    if (!user) return;
    const unsubs = AREAS.map((area) =>
      subscribeToTasks(user.id, area.id, (tasks) => {
        setAllTasks((prev) => ({ ...prev, [area.id]: tasks }));
      }),
    );
    return () => unsubs.forEach((u) => u());
  }, [user]);

  // Tareas de hoy pendientes (con fecha = hoy)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayTasks = Object.values(allTasks)
    .flat()
    .filter((t) => {
      if (t.done) return false;
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      d.setHours(0, 0, 0, 0);
      return d >= today && d < tomorrow;
    })
    .slice(0, 5);

  const totalPending = Object.values(allTasks)
    .flat()
    .filter((t) => !t.done).length;
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

  const goToArea = (area: (typeof AREAS)[number]) =>
    router.push(
      `/area/${area.id}?label=${area.label}&color=${encodeURIComponent(area.color)}`,
    );

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
          <Pressable
            onPress={() => router.push("/(tabs)/profile")}
            style={s.avatarCircle}
          >
            <Text style={s.avatarText}>
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </Text>
          </Pressable>
        </View>

        {/* ── Banner resumen ── */}
        <View style={s.banner}>
          <Ionicons name="sunny-outline" size={18} color={C.gold} />
          <Text style={s.bannerText}>
            Tienes{" "}
            <Text style={s.bannerBold}>
              {totalPending} tarea{totalPending !== 1 ? "s" : ""}
            </Text>{" "}
            pendiente{totalPending !== 1 ? "s" : ""} hoy
          </Text>
        </View>

        {/* ── Mi día ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Ionicons name="calendar-outline" size={17} color={C.gold} />
            <Text style={s.sectionTitle}>Mi día</Text>
          </View>
          <View style={s.dayCard}>
            {todayTasks.length === 0 ? (
              <Text style={s.emptyDay}>🎉 Sin tareas para hoy</Text>
            ) : (
              todayTasks.map((task, i) => {
                const area = AREAS.find((a) => a.id === task.areaId);
                return (
                  <Pressable
                    key={task.id}
                    style={[s.taskRow, i > 0 && s.taskBorder]}
                    onPress={() => area && goToArea(area)}
                  >
                    <Ionicons name="ellipse-outline" size={22} color="#ddd" />
                    <View style={s.taskInfo}>
                      <Text style={s.taskTitle}>{task.title}</Text>
                      {area && (
                        <View
                          style={[
                            s.tag,
                            { backgroundColor: area.color + "22" },
                          ]}
                        >
                          <Text style={[s.tagText, { color: area.color }]}>
                            {area.label}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#ddd" />
                  </Pressable>
                );
              })
            )}
          </View>
        </View>

        {/* ── Mis áreas ── */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { marginBottom: 12 }]}>Mis áreas</Text>
          <View style={s.grid}>
            {AREAS.map((area) => {
              const tasks = allTasks[area.id] ?? [];
              const pending = tasks.filter((t) => !t.done).length;
              const total = tasks.length;
              const pct =
                total === 0 ? 0 : Math.round(((total - pending) / total) * 100);
              return (
                <Pressable
                  key={area.id}
                  style={({ pressed }) => [
                    s.areaCard,
                    { backgroundColor: area.color },
                    pressed && s.pressed,
                  ]}
                  onPress={() => goToArea(area)}
                >
                  <AreaIcon lib={area.lib} icon={area.icon} size={26} />
                  <Text style={s.areaLabel}>{area.label}</Text>
                  <Text style={s.areaCount}>
                    {pending} {pending === 1 ? "pendiente" : "pendientes"}
                  </Text>
                  {/* Mini barra de progreso */}
                  <View style={s.miniBarBg}>
                    <View
                      style={[s.miniBarFill, { width: `${pct}%` as any }]}
                    />
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Nueva tarea ── */}
        <Pressable
          style={({ pressed }) => [s.addBtn, pressed && s.pressed]}
          onPress={() => router.push({ pathname: "/(tabs)/tasks" })}
        >
          <Ionicons name="add-circle-outline" size={22} color="#fff" />
          <Text style={s.addBtnText}>Nueva tarea</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Colores ─────────────────────────────────────────────
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

  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: C.text },

  dayCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 3,
  },
  emptyDay: {
    fontSize: 14,
    color: C.gray,
    paddingVertical: 16,
    textAlign: "center",
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
  tag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: { fontSize: 11, fontWeight: "600" },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  areaCard: {
    width: "48%",
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
    elevation: 4,
  },
  areaLabel: { marginTop: 10, fontSize: 14, fontWeight: "700", color: C.white },
  areaCount: { marginTop: 4, fontSize: 12, color: "rgba(255,255,255,0.8)" },
  miniBarBg: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    marginTop: 10,
  },
  miniBarFill: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 2,
  },

  addBtn: {
    flexDirection: "row",
    backgroundColor: C.primary,
    borderRadius: 14,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    elevation: 5,
  },
  addBtnText: { color: C.white, fontSize: 16, fontWeight: "700" },
  pressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
});
