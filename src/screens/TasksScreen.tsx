import { useAuth } from "../context/AuthContext";
import { FloatingActionButton } from "../components/FloatingActionButton";
import { EmptyState } from "../components/EmptyState";
import { FilterChips } from "../components/FilterChips";
import { TaskFormModal } from "../components/TaskFormModal";
import { useTheme, Theme } from "../context/ThemeContext";
import {
  createTask,
  deleteTask,
  Priority,
  subscribeToTasks,
  Task,
  toggleTask,
} from "@/services/taskService";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Constantes ───────────────────────────────────────────
const AREAS = [
  { id: "work", label: "Trabajo", color: "#5C8DAE" },
  { id: "education", label: "Educación", color: "#7FB3D5" },
  { id: "finance", label: "Finanzas", color: "#66C2A5" },
  { id: "health", label: "Bienestar", color: "#76C893" },
] as const;

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: "alta", label: "Alta", color: "#E53E3E" },
  { value: "media", label: "Media", color: "#C58B00" },
  { value: "baja", label: "Baja", color: "#38A169" },
];

type AreaFilter = "all" | "work" | "education" | "finance" | "health";

// ─── TaskCard ─────────────────────────────────────────────
const TaskCard = ({
  task,
  onToggle,
  onDelete,
  onPressArea,
}: {
  task: Task & { areaColor: string; areaLabel: string };
  onToggle: () => void;
  onDelete: () => void;
  onPressArea: () => void;
}) => {
  const { theme } = useTheme();
  const tc = useMemo(() => createTaskCardStyles(theme), [theme]);

  const p = PRIORITIES.find((x) => x.value === task.priority)!;
  const overdue =
    task.dueDate && !task.done && new Date(task.dueDate) < new Date();

  return (
    <Pressable
      style={({ pressed }) => [tc.card, pressed && { opacity: 0.9 }]}
      onPress={onPressArea}
    >
      <Pressable onPress={onToggle} style={tc.check} hitSlop={8}>
        <Ionicons
          name={task.done ? "checkmark-circle" : "ellipse-outline"}
          size={24}
          color={task.done ? task.areaColor : theme.textSecond}
        />
      </Pressable>

      <View style={tc.body}>
        <Text style={[tc.title, task.done && tc.done]}>{task.title}</Text>
        {!!task.description && (
          <Text style={tc.desc} numberOfLines={1}>
            {task.description}
          </Text>
        )}
        <View style={tc.meta}>
          {/* Área */}
          <View style={[tc.badge, { backgroundColor: task.areaColor + "22" }]}>
            <Text style={[tc.badgeText, { color: task.areaColor }]}>
              {task.areaLabel}
            </Text>
          </View>
          {/* Prioridad */}
          <View style={[tc.badge, { backgroundColor: p.color + "22" }]}>
            <Text style={[tc.badgeText, { color: p.color }]}>{p.label}</Text>
          </View>
          {/* Fecha */}
          {task.dueDate && (
            <View
              style={[
                tc.badge,
                { backgroundColor: overdue ? "#FEE2E2" : theme.border },
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={10}
                color={overdue ? "#E53E3E" : theme.textSecond}
              />
              <Text
                style={[tc.badgeText, { color: overdue ? "#E53E3E" : theme.textSecond }]}
              >
                {new Date(task.dueDate).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                })}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Pressable
        onPress={() =>
          Alert.alert(task.title, "", [
            { text: "Ir al área", onPress: onPressArea },
            { text: "Eliminar", style: "destructive", onPress: onDelete },
            { text: "Cancelar", style: "cancel" },
          ])
        }
        style={tc.menu}
        hitSlop={8}
      >
        <Ionicons name="ellipsis-vertical" size={18} color={theme.textSecond} />
      </Pressable>
    </Pressable>
  );
}

const createTaskCardStyles = (theme: Theme) => StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 10,
    elevation: 2,
  },
  check: { padding: 2 },
  body: { flex: 1 },
  title: { fontSize: 14, fontWeight: "600", color: theme.text, marginBottom: 4 },
  done: { textDecorationLine: "line-through", color: theme.textSecond },
  desc: { fontSize: 12, color: theme.textSecond, marginBottom: 6 },
  meta: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: { fontSize: 10, fontWeight: "600" },
  menu: { padding: 4 },
});

// ─── Modal nueva tarea rápida ─────────────────────────────

// ─── Pantalla principal ───────────────────────────────────
export default function TasksScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const s = useMemo(() => createScreenStyles(theme), [theme]);
  const navigation = useNavigation<any>();
  const [allTasks, setAllTasks] = useState<Record<string, Task[]>>({});
  const [areaFilter, setAreaFilter] = useState<AreaFilter>("all");
  const [showDone, setShowDone] = useState(false);
  const [modalOpen, setModal] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubs = AREAS.map((area) =>
      subscribeToTasks(user.id, area.id, (tasks) => {
        setAllTasks((prev) => ({ ...prev, [area.id]: tasks }));
      }),
    );
    return () => unsubs.forEach((u) => u());
  }, [user]);

  // Aplanar todas las tareas con metadata de área
  const flatTasks = useMemo(() => {
    return AREAS.flatMap((area) =>
      (allTasks[area.id] ?? []).map((t) => ({
        ...t,
        areaColor: area.color,
        areaLabel: area.label,
      })),
    );
  }, [allTasks]);

  const displayed = useMemo(() => {
    return flatTasks.filter((t) => {
      const areaMatch = areaFilter === "all" || t.areaId === areaFilter;
      const doneMatch = showDone ? true : !t.done;
      return areaMatch && doneMatch;
    });
  }, [flatTasks, areaFilter, showDone]);

  const totalPending = flatTasks.filter((t) => !t.done).length;
  const totalDone = flatTasks.filter((t) => t.done).length;

  const handleQuickSave = async ({
    areaId,
    title,
    priority,
  }: {
    areaId?: string;
    title: string;
    priority: Priority;
  }) => {
    if (!user || !areaId) return;
    try {
      await createTask(user.id, areaId, {
        title,
        description: "",
        priority,
        done: false,
        labels: [],
        areaId,
      });
      setModal(false);
    } catch {
      Alert.alert("Error", "No se pudo guardar la tarea");
    }
  };

  const handleToggle = async (task: Task) => {
    if (!user) return;
    await toggleTask(user.id, task.areaId, task.id, !task.done);
  };

  const handleDelete = (task: Task) => {
    Alert.alert("Eliminar", `¿Eliminar "${task.title}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          if (!user) return;
          await deleteTask(user.id, task.areaId, task.id);
        },
      },
    ]);
  };

  const goToArea = (areaId: string) => {
    const area = AREAS.find((a) => a.id === areaId);
    if (!area) return;
    navigation.navigate('Area', {
      areaId: area.id,
      label: area.label,
      color: area.color,
    });
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* ── Header ── */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>Mis tareas</Text>
          <Text style={s.subtitle}>
            {totalPending} pendientes · {totalDone} completadas
          </Text>
        </View>
        <Pressable style={s.doneToggle} onPress={() => setShowDone((v) => !v)}>
          <Ionicons
            name={showDone ? "eye-outline" : "eye-off-outline"}
            size={18}
            color={showDone ? theme.primary : theme.textSecond}
          />
          <Text style={[s.doneToggleText, showDone && { color: theme.primary }]}>
            {showDone ? "Ocultar" : "Ver"} completadas
          </Text>
        </Pressable>
      </View>

      {/* ── Filtro por área ── */}
      <FilterChips
        options={[{ id: "all", label: "Todas" }, ...AREAS]}
        activeId={areaFilter}
        onChange={(id) => setAreaFilter(id as AreaFilter)}
        style={s.filterScroll}
      />

      {/* ── Lista ── */}
      <FlatList
        data={displayed}
        keyExtractor={(item) => `${item.areaId}-${item.id}`}
        contentContainerStyle={s.list}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onToggle={() => handleToggle(item)}
            onDelete={() => handleDelete(item)}
            onPressArea={() => goToArea(item.areaId)}
          />
        )}
        ListEmptyComponent={<EmptyState />}
        showsVerticalScrollIndicator={false}
      />

      {/* ── FAB ── */}
      <FloatingActionButton
        color={theme.primary}
        onPress={() => setModal(true)}
      />

      {/* ── Modal ── */}
      <TaskFormModal
        visible={modalOpen}
        onClose={() => setModal(false)}
        onSave={handleQuickSave as any}
        showAreaSelector
        areas={AREAS as any}
      />
    </SafeAreaView>
  );
}

const createScreenStyles = (theme: Theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: { fontSize: 22, fontWeight: "800", color: theme.text },
  subtitle: { fontSize: 13, color: theme.textSecond, marginTop: 2 },
  doneToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.card,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 1,
  },
  doneToggleText: { fontSize: 11, color: theme.textSecond, fontWeight: "600" },

  filterScroll: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
  },
  filterChipActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  filterText: { fontSize: 13, color: theme.textSecond, fontWeight: "500" },
  filterTextActive: { color: "#fff" },

  list: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 4 },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, color: theme.textSecond, fontWeight: "600" },
  emptyHint: { fontSize: 13, color: theme.textSecond },

  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
});
