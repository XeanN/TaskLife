import { useAuth } from "../context/AuthContext";
import { useTheme, Theme } from "../context/ThemeContext";
import { FloatingActionButton } from "../components/FloatingActionButton";
import { EmptyState } from "../components/EmptyState";
import { FilterChips } from "../components/FilterChips";
import { TaskCard } from "../components/TaskCard";
import { TaskFormModal } from "../components/TaskFormModal";
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
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
// useSafeAreaInsets para posicionar el FAB sobre la nav bar del sistema

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


// ─── Pantalla principal ───────────────────────────────────
export default function AreaScreen() {
  const { theme } = useTheme();
  const ps = useMemo(() => getPsStyles(theme), [theme]);
  const route = useRoute();
  const { areaId, label, color: colorParam } = route.params as { areaId: string; label: string; color: string };
  const navigation = useNavigation<any>();
  const color = decodeURIComponent(colorParam ?? "#3F7EA6");
  const { user } = useAuth();
  // Altura dinámica de la nav bar: 0 en modelos sin botones, >0 en los que sí tienen
  const insets = useSafeAreaInsets();

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
    <SafeAreaView style={[ps.safe, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[ps.header, { backgroundColor: color }]}>
        <Pressable onPress={() => navigation.goBack()} style={ps.backBtn}>
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
        <FilterChips
          options={FILTERS.map((f) => ({ id: f, label: f }))}
          activeId={filter}
          onChange={(id) => setFilter(id as Filter)}
          activeColor={color}
          style={{ flex: 1 }}
        />
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
        ListEmptyComponent={<EmptyState />}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB — bottom dinámico: sube sobre la nav bar si el modelo la tiene */}
      <FloatingActionButton
        color={color}
        bottomOffset={16}
        onPress={() => {
          setEditing(undefined);
          setModal(true);
        }}
      />

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

const getPsStyles = (theme: Theme) => StyleSheet.create({
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
    backgroundColor: theme.card,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 14,
    padding: 12,
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 20, fontWeight: "800", color: theme.text },
  statLabel: { fontSize: 11, color: theme.textSecond, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: theme.border },
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
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
  },
  filterText: { fontSize: 12, color: theme.textSecond, fontWeight: "500" },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: theme.iconBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sortText: { fontSize: 12, color: theme.primary, fontWeight: "600" },
  list: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 4 },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, color: theme.border, fontWeight: "600" },
  emptyHint: { fontSize: 13, color: theme.border },
  fab: {
    position: "absolute",
    // bottom se pasa dinámico desde el componente usando insets.bottom
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
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 20,
    width: 240,
  },
  sortTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.text,
    marginBottom: 12,
  },
  sortOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  sortOptionText: { fontSize: 15, color: theme.textSecond },
});
