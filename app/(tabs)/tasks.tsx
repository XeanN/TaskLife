import { useAuth } from "@/context/AuthContext";
import {
  createTask,
  deleteTask,
  Priority,
  subscribeToTasks,
  Task,
  toggleTask,
} from "@/services/taskService";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
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
function TaskCard({
  task,
  onToggle,
  onDelete,
  onPressArea,
}: {
  task: Task & { areaColor: string; areaLabel: string };
  onToggle: () => void;
  onDelete: () => void;
  onPressArea: () => void;
}) {
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
          color={task.done ? task.areaColor : "#ccc"}
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
                { backgroundColor: overdue ? "#FEE2E2" : "#F0F0F0" },
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={10}
                color={overdue ? "#E53E3E" : "#888"}
              />
              <Text
                style={[tc.badgeText, { color: overdue ? "#E53E3E" : "#888" }]}
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
        <Ionicons name="ellipsis-vertical" size={18} color="#ccc" />
      </Pressable>
    </Pressable>
  );
}

const tc = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 10,
    elevation: 2,
  },
  check: { padding: 2 },
  body: { flex: 1 },
  title: { fontSize: 14, fontWeight: "600", color: "#1A1A2E", marginBottom: 4 },
  done: { textDecorationLine: "line-through", color: "#aaa" },
  desc: { fontSize: 12, color: "#6B7280", marginBottom: 6 },
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
function QuickTaskModal({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (areaId: string, title: string, priority: Priority) => void;
}) {
  const [title, setTitle] = useState("");
  const [areaId, setAreaId] = useState<string>("work");
  const [priority, setPriority] = useState<Priority>("media");

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Escribe un nombre");
      return;
    }
    onSave(areaId, title.trim(), priority);
    setTitle("");
    setPriority("media");
    setAreaId("work");
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={qm.overlay}
      >
        <View style={qm.card}>
          <Text style={qm.heading}>Nueva tarea</Text>

          <TextInput
            style={qm.input}
            placeholder="Nombre de la tarea"
            placeholderTextColor="#aaa"
            value={title}
            onChangeText={setTitle}
            autoFocus
          />

          {/* Área */}
          <Text style={qm.label}>Área</Text>
          <View style={qm.row}>
            {AREAS.map((a) => (
              <Pressable
                key={a.id}
                style={[
                  qm.chip,
                  areaId === a.id && { backgroundColor: a.color },
                ]}
                onPress={() => setAreaId(a.id)}
              >
                <Text
                  style={[qm.chipText, areaId === a.id && { color: "#fff" }]}
                >
                  {a.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Prioridad */}
          <Text style={qm.label}>Prioridad</Text>
          <View style={qm.row}>
            {PRIORITIES.map((p) => (
              <Pressable
                key={p.value}
                style={[
                  qm.chip,
                  priority === p.value && { backgroundColor: p.color },
                ]}
                onPress={() => setPriority(p.value)}
              >
                <Text
                  style={[
                    qm.chipText,
                    priority === p.value && { color: "#fff" },
                  ]}
                >
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={qm.buttons}>
            <Pressable style={qm.cancelBtn} onPress={onClose}>
              <Text style={qm.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable style={qm.saveBtn} onPress={handleSave}>
              <Text style={qm.saveText}>Agregar</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const qm = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  card: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  heading: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1A2E",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#1A1A2E",
    marginBottom: 16,
  },
  label: { fontSize: 13, fontWeight: "600", color: "#6B7280", marginBottom: 8 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
  },
  chipText: { fontSize: 13, color: "#6B7280", fontWeight: "500" },
  buttons: { flexDirection: "row", gap: 12, marginTop: 4 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  cancelText: { fontSize: 15, color: "#6B7280", fontWeight: "600" },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#3F7EA6",
  },
  saveText: { fontSize: 15, color: "#fff", fontWeight: "700" },
});

// ─── Pantalla principal ───────────────────────────────────
export default function TasksScreen() {
  const { user } = useAuth();
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

  const handleQuickSave = async (
    areaId: string,
    title: string,
    priority: Priority,
  ) => {
    if (!user) return;
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
    router.push(
      `/area/${area.id}?label=${area.label}&color=${encodeURIComponent(area.color)}`,
    );
  };

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
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
            color={showDone ? "#3F7EA6" : "#aaa"}
          />
          <Text style={[s.doneToggleText, showDone && { color: "#3F7EA6" }]}>
            {showDone ? "Ocultar" : "Ver"} completadas
          </Text>
        </Pressable>
      </View>

      {/* ── Filtro por área ── */}
      <View style={s.filterScroll}>
        <Pressable
          style={[s.filterChip, areaFilter === "all" && s.filterChipActive]}
          onPress={() => setAreaFilter("all")}
        >
          <Text
            style={[s.filterText, areaFilter === "all" && s.filterTextActive]}
          >
            Todas
          </Text>
        </Pressable>
        {AREAS.map((a) => (
          <Pressable
            key={a.id}
            style={[
              s.filterChip,
              areaFilter === a.id && {
                backgroundColor: a.color,
                borderColor: a.color,
              },
            ]}
            onPress={() => setAreaFilter(a.id as AreaFilter)}
          >
            <Text
              style={[s.filterText, areaFilter === a.id && { color: "#fff" }]}
            >
              {a.label}
            </Text>
          </Pressable>
        ))}
      </View>

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
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons
              name="checkmark-done-circle-outline"
              size={56}
              color="#ccc"
            />
            <Text style={s.emptyText}>No hay tareas aquí</Text>
            <Text style={s.emptyHint}>Toca + para agregar una</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* ── FAB ── */}
      <Pressable style={s.fab} onPress={() => setModal(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      {/* ── Modal ── */}
      <QuickTaskModal
        visible={modalOpen}
        onClose={() => setModal(false)}
        onSave={handleQuickSave}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#E9ECEF" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: { fontSize: 22, fontWeight: "800", color: "#1A1A2E" },
  subtitle: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  doneToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 1,
  },
  doneToggleText: { fontSize: 11, color: "#aaa", fontWeight: "600" },

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
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  filterChipActive: { backgroundColor: "#3F7EA6", borderColor: "#3F7EA6" },
  filterText: { fontSize: 13, color: "#6B7280", fontWeight: "500" },
  filterTextActive: { color: "#fff" },

  list: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 4 },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, color: "#ccc", fontWeight: "600" },
  emptyHint: { fontSize: 13, color: "#ddd" },

  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3F7EA6",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
});
