import { useAuth } from "@/context/AuthContext";
import {
    createTask,
    deleteTask,
    Priority,
    subscribeToTasks,
    Task,
    toggleTask,
    updateTask,
} from "@/services/taskService";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
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
const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: "alta", label: "Alta", color: "#E53E3E" },
  { value: "media", label: "Media", color: "#C58B00" },
  { value: "baja", label: "Baja", color: "#38A169" },
];

const FILTERS = ["Todas", "Pendientes", "Completadas"] as const;
type Filter = (typeof FILTERS)[number];
type SortKey = "fecha" | "prioridad" | "nombre";

const PRIORITY_ORDER: Record<Priority, number> = { alta: 0, media: 1, baja: 2 };

// ─── Componente tarea ─────────────────────────────────────
function TaskCard({
  task,
  color,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: Task;
  color: string;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const p = PRIORITIES.find((x) => x.value === task.priority)!;
  const overdue = task.dueDate && !task.done && task.dueDate < new Date();

  return (
    <View style={tc.card}>
      <Pressable onPress={onToggle} style={tc.check}>
        <Ionicons
          name={task.done ? "checkmark-circle" : "ellipse-outline"}
          size={24}
          color={task.done ? color : "#ccc"}
        />
      </Pressable>

      <Pressable style={tc.body} onPress={onEdit}>
        <Text style={[tc.title, task.done && tc.done]}>{task.title}</Text>
        {!!task.description && (
          <Text style={tc.desc} numberOfLines={1}>
            {task.description}
          </Text>
        )}
        <View style={tc.meta}>
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
                {task.dueDate.toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                })}
              </Text>
            </View>
          )}
        </View>
      </Pressable>

      {/* Menú */}
      <Pressable
        onPress={() =>
          Alert.alert(task.title, "", [
            { text: "Editar", onPress: onEdit },
            { text: "Eliminar", style: "destructive", onPress: onDelete },
            { text: "Cancelar", style: "cancel" },
          ])
        }
        style={tc.menu}
      >
        <Ionicons name="ellipsis-vertical" size={18} color="#ccc" />
      </Pressable>
    </View>
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

// ─── Modal crear/editar ───────────────────────────────────
function TaskFormModal({
  visible,
  onClose,
  onSave,
  initial,
  color,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description: string;
    priority: Priority;
    dueDate?: Date;
  }) => void;
  initial?: Task;
  color: string;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [desc, setDesc] = useState(initial?.description ?? "");
  const [priority, setPriority] = useState<Priority>(
    initial?.priority ?? "media",
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(initial?.dueDate);
  const [showDate, setShowDate] = useState(false);

  useEffect(() => {
    if (visible) {
      setTitle(initial?.title ?? "");
      setDesc(initial?.description ?? "");
      setPriority(initial?.priority ?? "media");
      setDueDate(initial?.dueDate);
    }
  }, [visible, initial]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Escribe un nombre para la tarea");
      return;
    }
    onSave({
      title: title.trim(),
      description: desc.trim(),
      priority,
      dueDate,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={fm.overlay}
      >
        <View style={fm.card}>
          <Text style={fm.heading}>
            {initial ? "Editar tarea" : "Nueva tarea"}
          </Text>

          {/* Título */}
          <TextInput
            style={fm.input}
            placeholder="Nombre de la tarea"
            placeholderTextColor="#aaa"
            value={title}
            onChangeText={setTitle}
            autoFocus
          />

          {/* Descripción */}
          <TextInput
            style={[fm.input, { height: 72, textAlignVertical: "top" }]}
            placeholder="Descripción (opcional)"
            placeholderTextColor="#aaa"
            value={desc}
            onChangeText={setDesc}
            multiline
          />

          {/* Prioridad */}
          <Text style={fm.label}>Prioridad</Text>
          <View style={fm.row}>
            {PRIORITIES.map((p) => (
              <Pressable
                key={p.value}
                style={[
                  fm.chip,
                  priority === p.value && { backgroundColor: p.color },
                ]}
                onPress={() => setPriority(p.value)}
              >
                <Text
                  style={[
                    fm.chipText,
                    priority === p.value && { color: "#fff" },
                  ]}
                >
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Fecha */}
          <Text style={fm.label}>Fecha de vencimiento</Text>
          <Pressable style={fm.dateBtn} onPress={() => setShowDate(true)}>
            <Ionicons name="calendar-outline" size={16} color="#3F7EA6" />
            <Text style={fm.dateBtnText}>
              {dueDate
                ? dueDate.toLocaleDateString("es-ES", {
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                  })
                : "Sin fecha"}
            </Text>
            {dueDate && (
              <Pressable onPress={() => setDueDate(undefined)}>
                <Ionicons name="close-circle" size={16} color="#aaa" />
              </Pressable>
            )}
          </Pressable>

          {showDate && (
            <DateTimePicker
              value={dueDate ?? new Date()}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(_, date) => {
                setShowDate(false);
                if (date) setDueDate(date);
              }}
            />
          )}

          {/* Botones */}
          <View style={fm.buttons}>
            <Pressable style={fm.cancelBtn} onPress={onClose}>
              <Text style={fm.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[fm.saveBtn, { backgroundColor: color }]}
              onPress={handleSave}
            >
              <Text style={fm.saveText}>{initial ? "Guardar" : "Agregar"}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const fm = StyleSheet.create({
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
    marginBottom: 12,
  },
  label: { fontSize: 13, fontWeight: "600", color: "#6B7280", marginBottom: 8 },
  row: { flexDirection: "row", gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
  },
  chipText: { fontSize: 13, color: "#6B7280", fontWeight: "500" },
  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EAF4FB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  dateBtnText: { flex: 1, fontSize: 14, color: "#3F7EA6", fontWeight: "500" },
  buttons: { flexDirection: "row", gap: 12 },
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
  },
  saveText: { fontSize: 15, color: "#fff", fontWeight: "700" },
});

// ─── Pantalla principal ───────────────────────────────────
export default function AreaTasksScreen() {
  const {
    areaId,
    label,
    color: colorParam,
  } = useLocalSearchParams<{ areaId: string; label: string; color: string }>();
  const color = decodeURIComponent(colorParam ?? "#3F7EA6");
  const { user } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Filter>("Todas");
  const [sort, setSort] = useState<SortKey>("fecha");
  const [showSort, setShowSort] = useState(false);
  const [modalOpen, setModal] = useState(false);
  const [editing, setEditing] = useState<Task | undefined>();

  // Suscribir a Firestore
  useEffect(() => {
    if (!user || !areaId) return;
    const unsub = subscribeToTasks(user.id, areaId, setTasks);
    return unsub;
  }, [user, areaId]);

  // Filtrar y ordenar
  const displayed = useMemo(() => {
    let list = tasks.filter((t) => {
      if (filter === "Pendientes") return !t.done;
      if (filter === "Completadas") return t.done;
      return true;
    });
    if (sort === "prioridad")
      list = [...list].sort(
        (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
      );
    if (sort === "nombre")
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [tasks, filter, sort]);

  const pending = tasks.filter((t) => !t.done).length;
  const completed = tasks.filter((t) => t.done).length;

  const handleSave = async (data: {
    title: string;
    description: string;
    priority: Priority;
    dueDate?: Date;
  }) => {
    if (!user || !areaId) return;
    try {
      if (editing) {
        await updateTask(user.id, areaId, editing.id, data);
      } else {
        await createTask(user.id, areaId, {
          ...data,
          done: false,
          labels: [],
          areaId,
        });
      }
      setModal(false);
      setEditing(undefined);
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar la tarea");
    }
  };

  const handleToggle = async (task: Task) => {
    if (!user || !areaId) return;
    await toggleTask(user.id, areaId, task.id, !task.done);
  };

  const handleDelete = (task: Task) => {
    Alert.alert("Eliminar tarea", `¿Eliminar "${task.title}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          if (!user || !areaId) return;
          await deleteTask(user.id, areaId, task.id);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[ps.safe, { backgroundColor: "#E9ECEF" }]}>
      {/* Header */}
      <View style={[ps.header, { backgroundColor: color }]}>
        <Pressable onPress={() => router.back()} style={ps.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>
        <Text style={ps.headerTitle}>{label}</Text>
        <Pressable
          onPress={() => {
            setEditing(undefined);
            setModal(true);
          }}
          style={ps.addBtn}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>

      {/* Stats */}
      <View style={ps.statsRow}>
        <View style={ps.statItem}>
          <Text style={ps.statNum}>{pending}</Text>
          <Text style={ps.statLabel}>Pendientes</Text>
        </View>
        <View style={ps.statDivider} />
        <View style={ps.statItem}>
          <Text style={ps.statNum}>{completed}</Text>
          <Text style={ps.statLabel}>Completadas</Text>
        </View>
        <View style={ps.statDivider} />
        <View style={ps.statItem}>
          <Text style={ps.statNum}>{tasks.length}</Text>
          <Text style={ps.statLabel}>Total</Text>
        </View>
      </View>

      {/* Filtros + Ordenar */}
      <View style={ps.toolbarRow}>
        <View style={ps.filterRow}>
          {FILTERS.map((f) => (
            <Pressable
              key={f}
              style={[
                ps.filterChip,
                filter === f && { backgroundColor: color },
              ]}
              onPress={() => setFilter(f)}
            >
              <Text style={[ps.filterText, filter === f && { color: "#fff" }]}>
                {f}
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable style={ps.sortBtn} onPress={() => setShowSort(true)}>
          <Ionicons name="swap-vertical-outline" size={16} color="#3F7EA6" />
          <Text style={ps.sortText}>Ordenar</Text>
        </Pressable>
      </View>

      {/* Lista */}
      <FlatList
        data={displayed}
        keyExtractor={(item) => item.id}
        contentContainerStyle={ps.list}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            color={color}
            onToggle={() => handleToggle(item)}
            onEdit={() => {
              setEditing(item);
              setModal(true);
            }}
            onDelete={() => handleDelete(item)}
          />
        )}
        ListEmptyComponent={
          <View style={ps.empty}>
            <Ionicons
              name="checkmark-done-circle-outline"
              size={56}
              color="#ccc"
            />
            <Text style={ps.emptyText}>No hay tareas aquí</Text>
            <Text style={ps.emptyHint}>Toca + para agregar una</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <Pressable
        style={[ps.fab, { backgroundColor: color }]}
        onPress={() => {
          setEditing(undefined);
          setModal(true);
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      {/* Modal ordenar */}
      <Modal visible={showSort} transparent animationType="fade">
        <Pressable style={ps.sortOverlay} onPress={() => setShowSort(false)}>
          <View style={ps.sortCard}>
            <Text style={ps.sortTitle}>Ordenar por</Text>
            {(["fecha", "prioridad", "nombre"] as SortKey[]).map((key) => (
              <Pressable
                key={key}
                style={ps.sortOption}
                onPress={() => {
                  setSort(key);
                  setShowSort(false);
                }}
              >
                <Text
                  style={[
                    ps.sortOptionText,
                    sort === key && { color, fontWeight: "700" },
                  ]}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
                {sort === key && (
                  <Ionicons name="checkmark" size={18} color={color} />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Modal crear/editar */}
      <TaskFormModal
        visible={modalOpen}
        onClose={() => {
          setModal(false);
          setEditing(undefined);
        }}
        onSave={handleSave}
        initial={editing}
        color={color}
      />
    </SafeAreaView>
  );
}

const ps = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: "800", color: "#fff" },
  addBtn: { padding: 4 },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 14,
    padding: 12,
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 20, fontWeight: "800", color: "#1A1A2E" },
  statLabel: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  statDivider: { width: 1, backgroundColor: "#F0F0F0" },
  toolbarRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
  },
  filterRow: { flexDirection: "row", gap: 6, flex: 1 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  filterText: { fontSize: 12, color: "#6B7280", fontWeight: "500" },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EAF4FB",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sortText: { fontSize: 12, color: "#3F7EA6", fontWeight: "600" },
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
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  sortOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  sortCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: 240,
  },
  sortTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 12,
  },
  sortOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  sortOptionText: { fontSize: 15, color: "#6B7280" },
});
