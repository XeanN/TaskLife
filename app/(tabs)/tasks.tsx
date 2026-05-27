import TaskFormSheet from "@/components/TaskFormSheet";
import { useTheme } from "@/context/ThemeContext";
import { useLabels } from "@/hooks/useLabels";
import { useAllTasks } from "@/hooks/useTasks";
import { AREAS, PRIORITIES } from "@/models/Area";
import { Task, TaskFormData } from "@/models/Task";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type AreaFilter = "all" | "work" | "education" | "finance" | "health";

function TaskRow({
  task,
  onToggle,
  onDelete,
  onPress,
  theme,
}: {
  task: Task & { areaColor: string; areaLabel: string };
  onToggle: () => void;
  onDelete: () => void;
  onPress: () => void;
  theme: any;
}) {
  const priority = (task.priority as any) || "baja";
  const p = PRIORITIES.find((x) => x.value === priority) || PRIORITIES[2];
  const overdue =
    task.dueDate && !task.done && new Date(task.dueDate) < new Date();

  return (
    <Pressable
      style={[
        styles_row.card,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
      onPress={onPress}
    >
      <Pressable onPress={onToggle} hitSlop={8} style={styles_row.check}>
        <Ionicons
          name={task.done ? "checkmark-circle" : "ellipse-outline"}
          size={24}
          color={task.done ? task.areaColor : theme.border}
        />
      </Pressable>

      <View style={styles_row.body}>
        <Text
          style={[
            styles_row.title,
            { color: theme.text },
            task.done && {
              textDecorationLine: "line-through",
              color: theme.textThird,
            },
          ]}
          numberOfLines={1}
        >
          {task.title}
        </Text>

        <View style={styles_row.meta}>
          {task.dueDate && (
            <View
              style={[
                styles_row.pill,
                { backgroundColor: overdue ? theme.dangerBg : theme.inputBg },
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={10}
                color={overdue ? theme.danger : theme.textSecond}
              />
              <Text
                style={[
                  styles_row.pillText,
                  { color: overdue ? theme.danger : theme.textSecond },
                ]}
              >
                {new Date(task.dueDate).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                })}
              </Text>
            </View>
          )}
          <View
            style={[
              styles_row.pill,
              { backgroundColor: task.areaColor + "22" },
            ]}
          >
            <Text style={[styles_row.pillText, { color: task.areaColor }]}>
              {task.areaLabel}
            </Text>
          </View>
          <View style={[styles_row.pill, { backgroundColor: p.color + "22" }]}>
            <Text style={[styles_row.pillText, { color: p.color }]}>
              {p.label}
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        onPress={() =>
          Alert.alert(task.title, "", [
            { text: "Ir al área", onPress },
            {
              text: "Eliminar",
              style: "destructive",
              onPress: onDelete,
            },
            { text: "Cancelar", style: "cancel" },
          ])
        }
        hitSlop={8}
        style={styles_row.menu}
      >
        <Ionicons name="ellipsis-vertical" size={18} color={theme.textThird} />
      </Pressable>
    </Pressable>
  );
}

const styles_row = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 10,
    borderWidth: 1,
  },
  check: { padding: 2 },
  body: { flex: 1 },
  title: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
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
  menu: { padding: 4 },
});

export default function TasksScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { allTasks, toggle, remove, saveQuick, loading, error } =
    useAllTasks();
  const { labels } = useLabels();
  const s = makeStyles(theme, insets.bottom);

  const [areaFilter, setAreaFilter] = useState<AreaFilter>("all");
  const [showDone, setShowDone] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  // NOTE: Disabled auto-refetch on focus to prevent Firestore quota exhaustion
  // Tasks only refetch after CRUD operations (create, edit, delete)

  const flatTasks = useMemo(
    () =>
      AREAS.flatMap((area) =>
        (allTasks[area.id] ?? []).map((t) => ({
          ...t,
          areaColor: area.color,
          areaLabel: area.label,
        })),
      ),
    [allTasks],
  );

  const displayed = useMemo(
    () =>
      flatTasks.filter((t) => {
        const areaMatch = areaFilter === "all" || t.areaId === areaFilter;
        const doneMatch = showDone ? true : !t.done;
        return areaMatch && doneMatch;
      }),
    [flatTasks, areaFilter, showDone],
  );

  const totalPending = flatTasks.filter((t) => !t.done).length;
  const totalDone = flatTasks.filter((t) => t.done).length;

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

  const goToArea = (areaId: string) => {
    const area = AREAS.find((a) => a.id === areaId);
    if (!area) return;
    router.push(
      `/area/${area.id}?label=${area.label}&color=${encodeURIComponent(area.color)}`,
    );
  };

  const handleSaveQuick = async (formData: TaskFormData) => {
    await saveQuick(formData);
    setSheetOpen(false);
  };

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
      {/* Header */}
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
            size={16}
            color={showDone ? theme.primary : theme.textThird}
          />
          <Text
            style={[s.doneToggleText, showDone && { color: theme.primary }]}
          >
            {showDone ? "Ocultar" : "Completadas"}
          </Text>
        </Pressable>
      </View>

      {/* Filtro por área */}
      <View style={s.filterRow}>
        <Pressable
          style={[s.chip, areaFilter === "all" && s.chipActive]}
          onPress={() => setAreaFilter("all")}
        >
          <Text style={[s.chipText, areaFilter === "all" && { color: "#fff" }]}>
            Todas
          </Text>
        </Pressable>
        {AREAS.map((a) => (
          <Pressable
            key={a.id}
            style={[
              s.chip,
              areaFilter === a.id && {
                backgroundColor: a.color,
                borderColor: a.color,
              },
            ]}
            onPress={() => setAreaFilter(a.id as AreaFilter)}
          >
            <Text
              style={[s.chipText, areaFilter === a.id && { color: "#fff" }]}
            >
              {a.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Lista */}
      <FlatList
        data={displayed}
        keyExtractor={(item) => `${item.areaId}-${item.id}`}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TaskRow
            task={item}
            theme={theme}
            onToggle={() => toggle(item)}
            onDelete={() => handleDelete(item)}
            onPress={() => goToArea(item.areaId)}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <View style={s.empty}>
              <ActivityIndicator color={theme.primary} />
              <Text style={s.emptyText}>Cargando tareas...</Text>
            </View>
          ) : error ? (
            <View style={s.empty}>
              <Ionicons name="cloud-offline-outline" size={56} color={theme.border} />
              <Text style={s.emptyText}>No se pudieron cargar</Text>
              <Text style={s.emptyHint}>Revisa tu conexión y vuelve a intentar</Text>
              <Pressable style={s.retryBtn} onPress={fetchTasks}>
                <Text style={s.retryText}>Reintentar</Text>
              </Pressable>
            </View>
          ) : (
            <View style={s.empty}>
              <Ionicons
                name="checkmark-done-circle-outline"
                size={56}
                color={theme.border}
              />
              <Text style={s.emptyText}>No hay tareas aquí</Text>
              <Text style={s.emptyHint}>Toca + para agregar una</Text>
            </View>
          )
        }
      />

      {/* FAB */}
      <Pressable style={s.fab} onPress={() => setSheetOpen(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      {/* Sheet nueva tarea */}
      <TaskFormSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSave={handleSaveQuick}
        labels={labels}
      />
    </SafeAreaView>
  );
}

const makeStyles = (t: ReturnType<typeof useTheme>["theme"], bottomInset: number) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 12,
    },
    title: { fontSize: 22, fontWeight: "800", color: t.text },
    subtitle: { fontSize: 13, color: t.textSecond, marginTop: 2 },
    doneToggle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: t.card,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: t.border,
    },
    doneToggleText: {
      fontSize: 11,
      color: t.textThird,
      fontWeight: "600",
    },
    filterRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: 20,
      gap: 8,
      marginBottom: 12,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    chipActive: {
      backgroundColor: t.primary,
      borderColor: t.primary,
    },
    chipText: { fontSize: 13, color: t.textSecond, fontWeight: "500" },
    list: {
      paddingHorizontal: 20,
      // Espacio extra para que la última tarea no quede bajo tab bar/FAB.
      paddingBottom: Math.max(100, bottomInset + 124),
      paddingTop: 4,
    },
    empty: { alignItems: "center", paddingTop: 60, gap: 8 },
    emptyText: { fontSize: 16, color: t.textThird, fontWeight: "600" },
    emptyHint: { fontSize: 13, color: t.border },
    retryBtn: {
      backgroundColor: t.primary,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      marginTop: 6,
    },
    retryText: { color: "#fff", fontWeight: "700", fontSize: 13 },
    fab: {
      position: "absolute",
      // Mantiene el FAB por encima de la barra inferior del sistema.
      bottom: Math.max(24, bottomInset + 76),
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: t.primary,
      alignItems: "center",
      justifyContent: "center",
      elevation: 6,
    },
  });
