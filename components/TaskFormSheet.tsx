import { ErrorAlert, useErrorAlert } from "@/components/ErrorAlert";
import { useTheme } from "@/context/ThemeContext";
import { AREAS, PRIORITIES } from "@/models/Area";
import { Label } from "@/models/Label";
import { Task, TaskFormData } from "@/models/Task";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
    DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
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

const normalizePriority = (value: unknown): "alta" | "media" | "baja" => {
  if (value === "alta" || value === "media" || value === "baja") {
    return value;
  }
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    if (lower === "alta" || lower === "media" || lower === "baja") {
      return lower;
    }
  }
  return "media";
};

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
  const errorAlert = useErrorAlert();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"alta" | "media" | "baja">("media");
  const [areaId, setAreaId] = useState(defaultAreaId);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [labelIds, setLabelIds] = useState<string[]>([]);
  const [showDate, setShowDate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedReminders, setSelectedReminders] = useState<{
    d2: boolean;
    d1: boolean;
    d0: boolean;
  }>({ d2: false, d1: true, d0: false });
  const [titleError, setTitleError] = useState<string | null>(null);

  // Reset al abrir
  useEffect(() => {
    if (visible) {
      setTitle(initial?.title ?? "");
      setDescription(initial?.description ?? "");
      setPriority(normalizePriority(initial?.priority));
      setAreaId(initial?.areaId ?? defaultAreaId);
      setDueDate(
        initial?.dueDate ? new Date(initial.dueDate as any) : undefined,
      );
      setLabelIds(initial?.labelIds ?? []);
      setSelectedReminders({ d2: false, d1: true, d0: false });
      setShowDate(false);
      setTitleError(null);
    }
  }, [visible, initial, defaultAreaId]);

  const activeColor =
    areaColor ?? AREAS.find((a) => a.id === areaId)?.color ?? theme.primary;

  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);

  const toggleLabel = (id: string) => {
    setLabelIds((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      setTitleError("Escribe un nombre para la tarea");
      return;
    }

    setTitleError(null);
    setSaving(true);
    try {
      const remindersArr: { offsetDays: number; hour?: number; minute?: number }[] = [];
      if (dueDate) {
        if (selectedReminders.d2) remindersArr.push({ offsetDays: 2, hour: 9, minute: 0 });
        if (selectedReminders.d1) remindersArr.push({ offsetDays: 1, hour: 9, minute: 0 });
        if (selectedReminders.d0) remindersArr.push({ offsetDays: 0, hour: 9, minute: 0 });
      }

      const payload: any = {
        title: normalizedTitle,
        description: description.trim(),
        priority: normalizePriority(priority),
        areaId,
        dueDate,
        labelIds,
      };
      if (remindersArr.length > 0) payload.reminders = remindersArr;

      await onSave(payload);
      // Si llegó acá, fue exitoso - cerrar modal
      onClose();
    } catch (err: any) {
      // Mostrar error en alert
      errorAlert.show(err);
    } finally {
      setSaving(false);
    }
  };

  const formattedDate =
    normalizedDueDate && !Number.isNaN(normalizedDueDate.getTime())
      ? normalizedDueDate.toLocaleDateString("es-ES", {
          weekday: "short",
          day: "numeric",
          month: "long",
        })
      : null;

  const openDatePicker = () => {
    const currentValue = normalizedDueDate ?? new Date();

    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: currentValue,
        mode: "date",
        minimumDate: minDate,
        onChange: (_, selectedDate) => {
          if (selectedDate) {
            setDueDate(selectedDate);
          }
        },
      });
      return;
    }

    setShowDate(true);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <ErrorAlert
        visible={errorAlert.visible}
        error={errorAlert.error}
        onDismiss={errorAlert.hide}
        onRetry={() => {
          errorAlert.hide();
          handleSave();
        }}
        autoHideDuration={0}
      />

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
                {
                  color: theme.text,
                  borderBottomColor: titleError ? theme.danger : theme.border,
                },
              ]}
              placeholder="Nombre de la tarea"
              placeholderTextColor={theme.textThird}
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (titleError && text.trim()) {
                  setTitleError(null);
                }
              }}
              autoFocus
              multiline
            />
            {titleError && (
              <Text style={[s.fieldError, { color: theme.danger }]}>
                {titleError}
              </Text>
            )}

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
                  onPress={openDatePicker}
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
                    onPress={() => {
                      setDueDate(undefined);
                    }}
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
                  value={normalizedDueDate ?? new Date()}
                  mode="date"
                  display="default"
                  minimumDate={minDate}
                  onChange={(_, date) => {
                    setShowDate(false);
                    if (date) {
                      setDueDate(date);
                    }
                  }}
                />
              )}
              <Text style={[s.helperText, { color: theme.textThird }]}>
                Al guardar una fecha, TaskLife programa automáticamente una
                alarma 1 día antes para esa tarea.
              </Text>
            </View>

              {/* Recordatorios programables */}
              <View style={s.section}>
                <Text style={[s.sectionLabel, { color: theme.textSecond }]}>Recordatorios</Text>
                <View style={s.row}>
                  <Pressable
                    onPress={() => setSelectedReminders((p) => ({ ...p, d2: !p.d2 }))}
                    style={[
                      s.priorityChip,
                      { borderColor: selectedReminders.d2 ? activeColor : theme.border },
                      selectedReminders.d2 && { backgroundColor: activeColor },
                    ]}
                  >
                    <Text style={[s.priorityChipText, selectedReminders.d2 && { color: "#fff" }]}>2 días antes 09:00</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setSelectedReminders((p) => ({ ...p, d1: !p.d1 }))}
                    style={[
                      s.priorityChip,
                      { borderColor: selectedReminders.d1 ? activeColor : theme.border },
                      selectedReminders.d1 && { backgroundColor: activeColor },
                    ]}
                  >
                    <Text style={[s.priorityChipText, selectedReminders.d1 && { color: "#fff" }]}>1 día antes 09:00</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setSelectedReminders((p) => ({ ...p, d0: !p.d0 }))}
                    style={[
                      s.priorityChip,
                      { borderColor: selectedReminders.d0 ? activeColor : theme.border },
                      selectedReminders.d0 && { backgroundColor: activeColor },
                    ]}
                  >
                    <Text style={[s.priorityChipText, selectedReminders.d0 && { color: "#fff" }]}>En la fecha 09:00</Text>
                  </Pressable>
                </View>
                <Text style={[s.helperText, { color: theme.textThird }]}>Selecciona uno o varios recordatorios automáticos para esta tarea.</Text>
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
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Ionicons name="arrow-up" size={20} color="#fff" />
              )}
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
    fieldError: {
      fontSize: 12,
      fontWeight: "600",
      marginTop: -12,
      marginBottom: 16,
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
    helperText: {
      fontSize: 12,
      lineHeight: 17,
      marginTop: 8,
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
