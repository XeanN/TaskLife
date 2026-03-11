import { useAuth } from "@/context/AuthContext";
import { subscribeToTasks } from "@/services/taskService";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AREAS = [
  {
    id: "work",
    label: "Trabajo",
    description: "Proyectos, reuniones y entregas",
    color: "#5C8DAE",
    colorLight: "#E8F2F8",
    icon: "briefcase",
    lib: "ionicons",
  },
  {
    id: "education",
    label: "Educación",
    description: "Cursos, lecturas y aprendizaje",
    color: "#7FB3D5",
    colorLight: "#EAF4FB",
    icon: "school",
    lib: "ionicons",
  },
  {
    id: "finance",
    label: "Finanzas",
    description: "Pagos, ahorros e inversiones",
    color: "#66C2A5",
    colorLight: "#E6F7F2",
    icon: "chart-bar",
    lib: "fa5",
  },
  {
    id: "health",
    label: "Bienestar",
    description: "Salud, ejercicio y descanso",
    color: "#76C893",
    colorLight: "#E8F8ED",
    icon: "favorite-border",
    lib: "material",
  },
] as const;

function AreaIcon({
  lib,
  icon,
  size,
  color,
}: {
  lib: string;
  icon: string;
  size: number;
  color: string;
}) {
  if (lib === "fa5")
    return <FontAwesome5 name={icon as any} size={size} color={color} />;
  if (lib === "material")
    return <MaterialIcons name={icon as any} size={size} color={color} />;
  return <Ionicons name={icon as any} size={size} color={color} />;
}

function ProgressBar({
  total,
  done,
  color,
}: {
  total: number;
  done: number;
  color: string;
}) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <View style={s.progressBg}>
      <View
        style={[
          s.progressFill,
          { width: `${pct}%` as any, backgroundColor: color },
        ]}
      />
    </View>
  );
}

export default function AreasScreen() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<
    Record<string, { total: number; done: number }>
  >({});

  // Escucha conteo de tareas por área en tiempo real
  useEffect(() => {
    if (!user) return;
    const unsubs = AREAS.map((area) =>
      subscribeToTasks(user.id, area.id, (tasks) => {
        setCounts((prev) => ({
          ...prev,
          [area.id]: {
            total: tasks.length,
            done: tasks.filter((t) => t.done).length,
          },
        }));
      }),
    );
    return () => unsubs.forEach((u) => u());
  }, [user]);

  const totalTasks = Object.values(counts).reduce((a, c) => a + c.total, 0);
  const doneTasks = Object.values(counts).reduce((a, c) => a + c.done, 0);

  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      {/* edges sin 'bottom': la tab bar ya reserva ese espacio con insets.bottom */}
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.screenTitle}>Mis áreas</Text>
        <Text style={s.screenSubtitle}>
          {doneTasks} de {totalTasks} tareas completadas
        </Text>

        {/* Resumen global */}
        <View style={s.summaryCard}>
          <View style={s.summaryRow}>
            <Text style={s.summaryPct}>
              {totalTasks === 0
                ? 0
                : Math.round((doneTasks / totalTasks) * 100)}
              %
            </Text>
            <Text style={s.summaryLabel}>progreso general</Text>
          </View>
          <ProgressBar total={totalTasks} done={doneTasks} color="#3F7EA6" />
        </View>

        {/* Grid */}
        <View style={s.grid}>
          {AREAS.map((area) => {
            const c = counts[area.id] ?? { total: 0, done: 0 };
            const pct =
              c.total === 0 ? 0 : Math.round((c.done / c.total) * 100);
            return (
              <Pressable
                key={area.id}
                style={({ pressed }) => [
                  s.areaCard,
                  { backgroundColor: area.colorLight },
                  pressed && s.pressed,
                ]}
                onPress={() =>
                  router.push(
                    `/area/${area.id}?label=${area.label}&color=${encodeURIComponent(area.color)}`,
                  )
                }
              >
                <View style={[s.iconCircle, { backgroundColor: area.color }]}>
                  <AreaIcon
                    lib={area.lib}
                    icon={area.icon}
                    size={24}
                    color="#fff"
                  />
                </View>
                <Text style={s.areaLabel}>{area.label}</Text>
                <Text style={s.areaDescription}>{area.description}</Text>
                <View style={s.areaStats}>
                  <Text style={[s.areaPct, { color: area.color }]}>{pct}%</Text>
                  <Text style={s.areaCount}>
                    {c.done}/{c.total} tareas
                  </Text>
                </View>
                <ProgressBar total={c.total} done={c.done} color={area.color} />
                <View style={s.arrowRow}>
                  <Text style={[s.viewMore, { color: area.color }]}>
                    Ver tareas
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={14}
                    color={area.color}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#E9ECEF" },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
  screenTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A1A2E",
    marginBottom: 4,
  },
  screenSubtitle: { fontSize: 13, color: "#6B7280", marginBottom: 20 },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 10,
  },
  summaryPct: { fontSize: 32, fontWeight: "800", color: "#3F7EA6" },
  summaryLabel: { fontSize: 14, color: "#6B7280" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 14,
  },
  areaCard: { width: "47%", borderRadius: 18, padding: 16, elevation: 3 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  areaLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1A1A2E",
    marginBottom: 4,
  },
  areaDescription: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 12,
    lineHeight: 16,
  },
  areaStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 6,
  },
  areaPct: { fontSize: 16, fontWeight: "800" },
  areaCount: { fontSize: 11, color: "#6B7280" },
  progressBg: {
    height: 6,
    backgroundColor: "rgba(0,0,0,0.08)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: 6, borderRadius: 3 },
  arrowRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 2,
  },
  viewMore: { fontSize: 12, fontWeight: "600" },
});
