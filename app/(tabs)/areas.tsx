import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Tipos ────────────────────────────────────────────────
type Area = {
  id: string;
  label: string;
  description: string;
  color: string;
  colorLight: string;
  icon: string;
  lib: "ionicons" | "fa5" | "material";
  total: number;
  done: number;
};

// ─── Datos de áreas ───────────────────────────────────────
const AREAS: Area[] = [
  {
    id: "work",
    label: "Trabajo",
    description: "Proyectos, reuniones y entregas",
    color: "#5C8DAE",
    colorLight: "#E8F2F8",
    icon: "briefcase",
    lib: "ionicons",
    total: 5,
    done: 3,
  },
  {
    id: "education",
    label: "Educación",
    description: "Cursos, lecturas y aprendizaje",
    color: "#7FB3D5",
    colorLight: "#EAF4FB",
    icon: "school",
    lib: "ionicons",
    total: 3,
    done: 1,
  },
  {
    id: "finance",
    label: "Finanzas",
    description: "Pagos, ahorros e inversiones",
    color: "#66C2A5",
    colorLight: "#E6F7F2",
    icon: "chart-bar",
    lib: "fa5",
    total: 2,
    done: 0,
  },
  {
    id: "health",
    label: "Bienestar",
    description: "Salud, ejercicio y descanso",
    color: "#76C893",
    colorLight: "#E8F8ED",
    icon: "favorite-border",
    lib: "material",
    total: 4,
    done: 3,
  },
];

// ─── Helper de ícono ──────────────────────────────────────
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

// ─── Barra de progreso ────────────────────────────────────
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
    <View style={styles.progressBg}>
      <View
        style={[
          styles.progressFill,
          { width: `${pct}%` as any, backgroundColor: color },
        ]}
      />
    </View>
  );
}

export default function AreasScreen() {
  const totalTasks = AREAS.reduce((acc, a) => acc + a.total, 0);
  const doneTasks = AREAS.reduce((acc, a) => acc + a.done, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <Text style={styles.screenTitle}>Mis áreas</Text>
        <Text style={styles.screenSubtitle}>
          {doneTasks} de {totalTasks} tareas completadas
        </Text>

        {/* ── Resumen global ── */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryPct}>
              {totalTasks === 0
                ? 0
                : Math.round((doneTasks / totalTasks) * 100)}
              %
            </Text>
            <Text style={styles.summaryLabel}>progreso general</Text>
          </View>
          <ProgressBar total={totalTasks} done={doneTasks} color="#3F7EA6" />
        </View>

        {/* ── Grid de áreas ── */}
        <View style={styles.grid}>
          {AREAS.map((area) => {
            const pct =
              area.total === 0 ? 0 : Math.round((area.done / area.total) * 100);
            return (
              <Pressable
                key={area.id}
                style={({ pressed }) => [
                  styles.areaCard,
                  { backgroundColor: area.colorLight },
                  pressed && styles.pressed,
                ]}
              >
                {/* Ícono */}
                <View
                  style={[styles.iconCircle, { backgroundColor: area.color }]}
                >
                  <AreaIcon
                    lib={area.lib}
                    icon={area.icon}
                    size={24}
                    color="#fff"
                  />
                </View>

                {/* Texto */}
                <Text style={styles.areaLabel}>{area.label}</Text>
                <Text style={styles.areaDescription}>{area.description}</Text>

                {/* Progreso */}
                <View style={styles.areaStats}>
                  <Text style={[styles.areaPct, { color: area.color }]}>
                    {pct}%
                  </Text>
                  <Text style={styles.areaCount}>
                    {area.done}/{area.total} tareas
                  </Text>
                </View>
                <ProgressBar
                  total={area.total}
                  done={area.done}
                  color={area.color}
                />
              </Pressable>
            );
          })}
        </View>

        {/* ── Botón nueva área (provisional) ── */}
        <Pressable
          style={({ pressed }) => [
            styles.addAreaBtn,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Ionicons name="add-circle-outline" size={20} color="#3F7EA6" />
          <Text style={styles.addAreaText}>Nueva área</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#E9ECEF" },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },

  screenTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A1A2E",
    marginBottom: 4,
  },
  screenSubtitle: { fontSize: 13, color: "#6B7280", marginBottom: 20 },

  // Resumen
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
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

  // Grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 14,
  },
  areaCard: {
    width: "47%",
    borderRadius: 18,
    padding: 16,
    marginBottom: 0,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
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

  // Progress bar
  progressBg: {
    height: 6,
    backgroundColor: "rgba(0,0,0,0.08)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: 6, borderRadius: 3 },

  // Botón nueva área
  addAreaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
    borderWidth: 1.5,
    borderColor: "#3F7EA6",
    borderStyle: "dashed",
  },
  addAreaText: { fontSize: 15, color: "#3F7EA6", fontWeight: "700" },
});
