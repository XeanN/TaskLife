import LabelSheet from "@/components/LabelSheet";
import TaskFormSheet from "@/components/TaskFormSheet";
import { useTheme } from "@/context/ThemeContext";
import { FilterType, SortKey } from "@/controllers/TaskController";
import { useLabels } from "@/hooks/useLabels";
import { useAreaTasks } from "@/hooks/useTasks";
import type { AreaId } from "@/models/Area";
import { PRIORITIES, getNextArea, getPrevArea } from "@/models/Area";
import { Task, TaskFormData } from "@/models/Task";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

// ── TaskRow ───────────────────────────────────────────────

function TaskRow({
  task,
  color,
  onToggle,
  onEdit,
  onDelete,
  theme,
  labelNames,
}: {
  task: Task;
  color: string;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  theme: any;
  labelNames: { id: string; name: string; color: string }[];
}) {
  const p = PRIORITIES.find((x) => x.value === task.priority)!;
  const overdue = task.dueDate && !task.done && task.dueDate < new Date();

  return (
    <Pressable
      style={[
        tr.card,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
      onPress={onEdit}
    >
      {/* Check */}
      <Pressable onPress={onToggle} style={tr.check} hitSlop={10}>
        <Ionicons
          name={task.done ? "checkmark-circle" : "ellipse-outline"}
          size={26}
          color={task.done ? color : theme.border}
        />
      </Pressable>

      {/* Body */}
      <View style={tr.body}>
        <Text
          style={[
            tr.title,
            { color: theme.text },
            task.done && {
              textDecorationLine: "line-through",
              color: theme.textThird,
            },
          ]}
          numberOfLines={2}
        >
          {task.title}
        </Text>

        {!!task.description && (
          <Text
            style={[tr.desc, { color: theme.textSecond }]}
            numberOfLines={1}
          >
            {task.description}
          </Text>
        )}

        <View style={tr.meta}>
          {/* Fecha */}
          {task.dueDate && (
            <View
              style={[
                tr.pill,
                {
                  backgroundColor: overdue ? theme.dangerBg : theme.inputBg,
                },
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={10}
                color={overdue ? theme.danger : theme.textSecond}
              />
              <Text
                style={[
                  tr.pillText,
                  { color: overdue ? theme.danger : theme.textSecond },
                ]}
              >
                {task.dueDate.toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                })}
              </Text>
            </View>
          )}

          {/* Prioridad */}
          <View style={[tr.pill, { backgroundColor: p.color + "22" }]}>
            <Text style={[tr.pillText, { color: p.color }]}>{p.label}</Text>
          </View>

          {/* Etiquetas */}
          {labelNames.map((lbl) => (
            <View
              key={lbl.id}
              style={[tr.pill, { backgroundColor: lbl.color + "22" }]}
            >
              <Text style={[tr.pillText, { color: lbl.color }]}>
                {lbl.name}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Menú */}
      <Pressable
        onPress={() =>
          Alert.alert(task.title, "", [
            { text: "Editar tarea", onPress: onEdit },
            {
              text: "Eliminar tarea",
              style: "destructive",
              onPress: onDelete,
            },
            { text: "Cancelar", style: "cancel" },
          ])
        }
        style={tr.menu}
        hitSlop={8}
      >
        <Ionicons name="ellipsis-vertical" size={18} color={theme.textThird} />
      </Pressable>
    </Pressable>
  );
}

const tr = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 10,
    borderWidth: 1,
  },
  check: { padding: 2, marginTop: 1 },
  body: { flex: 1 },
  title: { fontSize: 14, fontWeight: "600", marginBottom: 4, lineHeight: 20 },
  desc: { fontSize: 12, marginBottom: 6 },
  meta: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillText: { fontSize: 10, fontWeight: "600" },
  menu: { padding: 4, marginTop: 2 },
});

// ── Pantalla principal ────────────────────────────────────

export default function AreaTasksScreen() {
  const {
    areaId,
    label,
    color: colorParam,
  } = useLocalSearchParams<{
    areaId: string;
    label: string;
    color: string;
  }>();

  const color = decodeURIComponent(colorParam ?? "#4A7FA5");
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { labels, getByIds } = useLabels();

  const [filter, setFilter] = useState<FilterType>("Todas");
  const [sort, setSort] = useState<SortKey>("fecha");
  const [labelFilter, setLabelFilter] = useState<string | null>(null);
  const [showSort, setShowSort] = useState(false);
  const [showLabelFilter, setShowLabelFilter] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | undefined>();
  const [showCompleted, setShowCompleted] = useState(false);

  const { displayed, pending, completed, stats, save, toggle, remove } =
    useAreaTasks(areaId, filter, sort, labelFilter);

  const s = makeStyles(theme, color);

  // ── Navegar entre áreas ──────────────────────────────
  const navigateArea = (direction: "next" | "prev") => {
    const next =
      direction === "next"
        ? getNextArea(areaId as AreaId)
        : getPrevArea(areaId as AreaId);
    router.replace(
      `/area/${next.id}?label=${next.label}&color=${encodeURIComponent(next.color)}`,
    );
  };

  // ── Handlers ─────────────────────────────────────────
  const handleSave = async (formData: TaskFormData) => {
    try {
      await save(formData, editing);
      setFormOpen(false);
      setEditing(undefined);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const handleDelete = (task: Task) => {
    Alert.alert("Eliminar tarea", `¿Eliminar "${task.title}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => remove(task),
      },
    ]);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setFormOpen(true);
  };

  const openNew = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  // Tareas pendientes y completadas separadas para la sección colapsable
  const pendingTasks = displayed.filter((t) => !t.done);
  const completedTasks = displayed.filter((t) => t.done);

  const FILTERS: FilterType[] = ["Todas", "Pendientes", "Completadas"];
  const SORTS: { key: SortKey; label: string }[] = [
    { key: "fecha", label: "Fecha" },
    { key: "prioridad", label: "Prioridad" },
    { key: "nombre", label: "Nombre" },
  ];

  return (
    <SafeAreaView style={s.safe}>
      {/* ── Header coloreado ── */}
      <View style={s.header}>
        <Pressable onPress={() => navigateArea("prev")} style={s.navBtn}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>

        <View style={s.headerCenter}>
          <Ionicons name="briefcase" size={18} color="#fff" />
          <Text style={s.headerTitle}>{label}</Text>
        </View>

        <Pressable onPress={() => navigateArea("next")} style={s.navBtn}>
          <Ionicons name="chevron-forward" size={22} color="#fff" />
        </Pressable>
      </View>

      {/* ── Stats ── */}
      <View style={s.statsRow}>
        <View style={s.statItem}>
          <Text style={[s.statNum, { color: theme.primary }]}>
            {stats.pending}
          </Text>
          <Text style={s.statLabel}>Pendientes</Text>
        </View>
        <View style={s.statDiv} />
        <View style={s.statItem}>
          <Text style={[s.statNum, { color: theme.success }]}>
            {stats.completed}
          </Text>
          <Text style={s.statLabel}>Completadas</Text>
        </View>
        <View style={s.statDiv} />
        <View style={s.statItem}>
          <Text style={[s.statNum, { color: theme.text }]}>{stats.total}</Text>
          <Text style={s.statLabel}>Total</Text>
        </View>
      </View>

      {/* ── Toolbar: Filtrar + Ordenar ── */}
      <View style={s.toolbar}>
        {/* Filtros */}
        <View style={s.filterRow}>
          {FILTERS.map((f) => (
            <Pressable
              key={f}
              style={[s.chip, filter === f && { backgroundColor: color }]}
              onPress={() => setFilter(f)}
            >
              <Text style={[s.chipText, filter === f && { color: "#fff" }]}>
                {f}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Ordenar */}
        <Pressable style={s.sortBtn} onPress={() => setShowSort(true)}>
          <Ionicons
            name="swap-vertical-outline"
            size={14}
            color={theme.primary}
          />
          <Text style={s.sortText}>Ordenar</Text>
        </Pressable>
      </View>

      {/* Filtro por etiqueta */}
      {labels.length > 0 && (
        <View style={s.labelFilterRow}>
          <Pressable
            style={[
              s.labelChip,
              !labelFilter && {
                backgroundColor: color + "22",
                borderColor: color,
              },
            ]}
            onPress={() => setLabelFilter(null)}
          >
            <Text style={[s.labelChipText, !labelFilter && { color }]}>
              Todas
            </Text>
          </Pressable>
          {labels.map((lbl) => (
            <Pressable
              key={lbl.id}
              style={[
                s.labelChip,
                labelFilter === lbl.id && {
                  backgroundColor: lbl.color + "22",
                  borderColor: lbl.color,
                },
              ]}
              onPress={() =>
                setLabelFilter(labelFilter === lbl.id ? null : lbl.id)
              }
            >
              <View style={[s.labelDot, { backgroundColor: lbl.color }]} />
              <Text
                style={[
                  s.labelChipText,
                  labelFilter === lbl.id && { color: lbl.color },
                ]}
              >
                {lbl.name}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* ── Lista ── */}
      <FlatList
        data={pendingTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[s.list, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TaskRow
            task={item}
            color={color}
            theme={theme}
            labelNames={getByIds(item.labelIds)}
            onToggle={() => toggle(item)}
            onEdit={() => openEdit(item)}
            onDelete={() => handleDelete(item)}
          />
        )}
        ListEmptyComponent={
          pendingTasks.length === 0 ? (
            <View style={s.empty}>
              <Ionicons
                name="checkmark-done-circle-outline"
                size={56}
                color={theme.border}
              />
              <Text style={s.emptyText}>No hay tareas aquí</Text>
              <Text style={s.emptyHint}>Toca + para agregar una</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          completedTasks.length > 0 ? (
            <View style={s.completedSection}>
              <Pressable
                style={s.completedHeader}
                onPress={() => setShowCompleted((v) => !v)}
              >
                <Ionicons
                  name={showCompleted ? "chevron-down" : "chevron-forward"}
                  size={16}
                  color={theme.textSecond}
                />
                <Text style={s.completedTitle}>
                  Completadas ({completedTasks.length})
                </Text>
              </Pressable>

              {showCompleted &&
                completedTasks.map((item) => (
                  <TaskRow
                    key={item.id}
                    task={item}
                    color={color}
                    theme={theme}
                    labelNames={getByIds(item.labelIds)}
                    onToggle={() => toggle(item)}
                    onEdit={() => openEdit(item)}
                    onDelete={() => handleDelete(item)}
                  />
                ))}
            </View>
          ) : null
        }
      />

      {/* ── FAB ── */}
      <Pressable
        style={[s.fab, { backgroundColor: color, bottom: insets.bottom + 16 }]}
        onPress={openNew}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      {/* ── Modal ordenar ── */}
      {showSort && (
        <Pressable style={s.sortOverlay} onPress={() => setShowSort(false)}>
          <Pressable style={[s.sortCard, { backgroundColor: theme.card }]}>
            <Text style={[s.sortTitle, { color: theme.text }]}>
              Ordenar por
            </Text>
            {SORTS.map((opt) => (
              <Pressable
                key={opt.key}
                style={[s.sortOption, { borderTopColor: theme.border }]}
                onPress={() => {
                  setSort(opt.key);
                  setShowSort(false);
                }}
              >
                <Text
                  style={[
                    s.sortOptionText,
                    { color: theme.textSecond },
                    sort === opt.key && {
                      color,
                      fontWeight: "700",
                    },
                  ]}
                >
                  {opt.label}
                </Text>
                {sort === opt.key && (
                  <Ionicons name="checkmark" size={18} color={color} />
                )}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      )}

      {/* ── Form sheet ── */}
      <TaskFormSheet
        visible={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(undefined);
        }}
        onSave={handleSave}
        initial={editing}
        defaultAreaId={areaId}
        labels={labels}
        areaColor={color}
      />

      {/* ── Label sheet ── */}
      <LabelSheet
        visible={showLabelFilter}
        onClose={() => setShowLabelFilter(false)}
        labels={labels}
        selectedIds={labelFilter ? [labelFilter] : []}
        onToggle={(id) => setLabelFilter(labelFilter === id ? null : id)}
      />
    </SafeAreaView>
  );
}

const makeStyles = (t: ReturnType<typeof useTheme>["theme"], color: string) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },

    header: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: color,
      paddingHorizontal: 8,
      paddingVertical: 14,
    },
    navBtn: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 20,
    },
    headerCenter: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: "#fff",
    },

    statsRow: {
      flexDirection: "row",
      backgroundColor: t.card,
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: t.border,
    },
    statItem: { flex: 1, alignItems: "center", gap: 2 },
    statNum: { fontSize: 22, fontWeight: "800" },
    statLabel: { fontSize: 11, color: t.textSecond },
    statDiv: { width: 1, backgroundColor: t.border },

    toolbar: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 10,
      gap: 8,
    },
    filterRow: { flexDirection: "row", gap: 6, flex: 1 },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    chipText: { fontSize: 12, color: t.textSecond, fontWeight: "500" },
    sortBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: t.primaryLight,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
    },
    sortText: { fontSize: 12, color: t.primary, fontWeight: "600" },

    labelFilterRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: 16,
      gap: 6,
      marginBottom: 4,
    },
    labelChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    labelDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    labelChipText: {
      fontSize: 11,
      color: t.textSecond,
      fontWeight: "500",
    },

    list: { paddingHorizontal: 16, paddingTop: 8 },

    empty: { alignItems: "center", paddingTop: 60, gap: 8 },
    emptyText: { fontSize: 16, color: t.textThird, fontWeight: "600" },
    emptyHint: { fontSize: 13, color: t.border },

    completedSection: { marginTop: 8 },
    completedHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 12,
      paddingHorizontal: 4,
    },
    completedTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: t.textSecond,
    },

    fab: {
      position: "absolute",
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      elevation: 6,
    },

    sortOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "center",
      alignItems: "center",
    },
    sortCard: {
      borderRadius: 16,
      padding: 20,
      width: 240,
      elevation: 10,
    },
    sortTitle: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 8,
    },
    sortOption: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 13,
      borderTopWidth: 1,
    },
    sortOptionText: { fontSize: 15 },
  });
