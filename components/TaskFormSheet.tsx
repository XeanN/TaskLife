import { useTheme } from "@/context/ThemeContext";
import { AREAS, PRIORITIES } from "@/models/Area";
import { Label } from "@/models/Label";
import { Task, TaskFormData } from "@/models/Task";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (data: TaskFormData) => Promise<void>;
  initial?: Task;
  defaultAreaId?: string;
  labels: Label[];
  areaColor?: string;
}

export default function TaskFormSheet({
  visible,
  onClose,
  onSave,
  initial,
  defaultAreaId = "work",
  labels,
  areaColor,
}: Props) {
  const { theme } = useTheme();
  const s = makeStyles(theme);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"alta" | "media" | "baja">("media");
  const [areaId, setAreaId] = useState(defaultAreaId);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [labelIds, setLabelIds] = useState<string[]>([]);
  const [showDate, setShowDate] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reset al abrir
  useEffect(() => {
    if (visible) {
      setTitle(initial?.title ?? "");
      setDescription(initial?.description ?? "");
      setPriority(initial?.priority ?? "media");
      setAreaId(initial?.areaId ?? defaultAreaId);
      setDueDate(initial?.dueDate);
      setLabelIds(initial?.labelIds ?? []);
      setShowDate(false);
    }
  }, [visible, initial, defaultAreaId]);

  const activeColor =
    areaColor ?? AREAS.find((a) => a.id === areaId)?.color ?? theme.primary;

  const toggleLabel = (id: string) => {
    setLabelIds((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        priority,
        areaId,
        dueDate,
        labelIds,
      });
    } finally {
      setSaving(false);
    }
  };

  const formattedDate = dueDate
    ? dueDate.toLocaleDateString("es-ES", {
        weekday: "short",
        day: "numeric",
        month: "long",
      })
    : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={s.overlay}
      >
        <Pressable style={s.backdrop} onPress={onClose} />

        <View style={[s.sheet, { backgroundColor: theme.card }]}>
          {/* Handle */}
          <View style={[s.handle, { backgroundColor: theme.border }]} />

          {/* Header */}
          <View style={s.sheetHeader}>
            <Text style={[s.sheetTitle, { color: theme.text }]}>
              {initial ? "Editar tarea" : "Nueva tarea"}
            </Text>
            <Pressable onPress={onClose} style={s.closeBtn}>
              <Ionicons name="close" size={22} color={theme.textSecond} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Título */}
            <TextInput
              style={[
                s.titleInput,
                { color: theme.text, borderBottomColor: theme.border },
              ]}
              placeholder="Nombre de la tarea"
              placeholderTextColor={theme.textThird}
              value={title}
              onChangeText={setTitle}
              autoFocus
              multiline
            />

            {/* Descripción */}
            <TextInput
              style={[s.descInput, { color: theme.textSecond }]}
              placeholder="Descripción (opcional)"
              placeholderTextColor={theme.textThird}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            {/* Área — solo si no hay defaultAreaId fijo */}
            {!areaColor && (
              <View style={s.section}>
                <Text style={[s.sectionLabel, { color: theme.textSecond }]}>
                  Área
                </Text>
                <View style={s.row}>
                  {AREAS.map((a) => (
                    <Pressable
                      key={a.id}
                      style={[
                        s.areaChip,
                        { borderColor: a.color },
                        areaId === a.id && {
                          backgroundColor: a.color,
                        },
                      ]}
                      onPress={() => setAreaId(a.id)}
                    >
                      <Text
                        style={[
                          s.areaChipText,
                          { color: a.color },
                          areaId === a.id && { color: "#fff" },
                        ]}
                      >
                        {a.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Prioridad */}
            <View style={s.section}>
              <Text style={[s.sectionLabel, { color: theme.textSecond }]}>
                Prioridad
              </Text>
              <View style={s.row}>
                {PRIORITIES.map((p) => (
                  <Pressable
                    key={p.value}
                    style={[
                      s.priorityChip,
                      { borderColor: p.color },
                      priority === p.value && {
                        backgroundColor: p.color,
                      },
                    ]}
                    onPress={() => setPriority(p.value)}
                  >
                    <Text
                      style={[
                        s.priorityChipText,
                        { color: p.color },
                        priority === p.value && { color: "#fff" },
                      ]}
                    >
                      {p.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Fecha */}
            <View style={s.section}>
              <Text style={[s.sectionLabel, { color: theme.textSecond }]}>
                Fecha de vencimiento
              </Text>
              <View style={s.dateRow}>
                <Pressable
                  style={[
                    s.dateBtn,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => setShowDate(true)}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={activeColor}
                  />
                  <Text
                    style={[
                      s.dateBtnText,
                      { color: formattedDate ? activeColor : theme.textThird },
                    ]}
                  >
                    {formattedDate ?? "Sin fecha"}
                  </Text>
                </Pressable>
                {dueDate && (
                  <Pressable
                    style={s.clearDate}
                    onPress={() => setDueDate(undefined)}
                  >
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={theme.textThird}
                    />
                  </Pressable>
                )}
              </View>
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
            </View>

            {/* Etiquetas */}
            {labels.length > 0 && (
              <View style={s.section}>
                <Text style={[s.sectionLabel, { color: theme.textSecond }]}>
                  Etiquetas
                </Text>
                <View style={s.row}>
                  {labels.map((lbl) => {
                    const selected = labelIds.includes(lbl.id);
                    return (
                      <Pressable
                        key={lbl.id}
                        style={[
                          s.labelChip,
                          { borderColor: lbl.color },
                          selected && { backgroundColor: lbl.color },
                        ]}
                        onPress={() => toggleLabel(lbl.id)}
                      >
                        <View
                          style={[
                            s.labelDot,
                            {
                              backgroundColor: selected ? "#fff" : lbl.color,
                            },
                          ]}
                        />
                        <Text
                          style={[
                            s.labelChipText,
                            { color: selected ? "#fff" : lbl.color },
                          ]}
                        >
                          {lbl.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            <View style={s.bottomPad} />
          </ScrollView>

          {/* Botones */}
          <View style={[s.footer, { borderTopColor: theme.border }]}>
            <Pressable
              style={[s.cancelBtn, { backgroundColor: theme.inputBg }]}
              onPress={onClose}
            >
              <Text style={[s.cancelText, { color: theme.textSecond }]}>
                Cancelar
              </Text>
            </Pressable>
            <Pressable
              style={[
                s.saveBtn,
                { backgroundColor: activeColor },
                (!title.trim() || saving) && { opacity: 0.5 },
              ]}
              onPress={handleSave}
              disabled={!title.trim() || saving}
            >
              <Ionicons name="arrow-up" size={20} color="#fff" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const makeStyles = (t: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.45)",
    },
    sheet: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 32,
      maxHeight: "90%",
    },
    handle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      alignSelf: "center",
      marginBottom: 16,
    },
    sheetHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    sheetTitle: {
      fontSize: 18,
      fontWeight: "800",
    },
    closeBtn: {
      padding: 4,
    },
    titleInput: {
      fontSize: 18,
      fontWeight: "700",
      borderBottomWidth: 1,
      paddingBottom: 10,
      marginBottom: 10,
      minHeight: 44,
    },
    descInput: {
      fontSize: 14,
      minHeight: 36,
      marginBottom: 20,
    },
    section: {
      marginBottom: 20,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: "600",
      marginBottom: 10,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    row: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    areaChip: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1.5,
    },
    areaChipText: {
      fontSize: 13,
      fontWeight: "600",
    },
    priorityChip: {
      paddingHorizontal: 18,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1.5,
    },
    priorityChipText: {
      fontSize: 13,
      fontWeight: "600",
    },
    dateRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    dateBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 11,
      borderRadius: 12,
      borderWidth: 1,
    },
    dateBtnText: {
      fontSize: 14,
      fontWeight: "500",
      flex: 1,
    },
    clearDate: {
      padding: 4,
    },
    labelChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1.5,
    },
    labelDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    labelChipText: {
      fontSize: 13,
      fontWeight: "600",
    },
    bottomPad: {
      height: 8,
    },
    footer: {
      flexDirection: "row",
      gap: 10,
      paddingTop: 14,
      borderTopWidth: 1,
      marginTop: 4,
    },
    cancelBtn: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelText: {
      fontSize: 15,
      fontWeight: "600",
    },
    saveBtn: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
    },
  });
