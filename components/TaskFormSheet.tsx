import { ErrorAlert, useErrorAlert } from "@/components/ErrorAlert";
import { useTheme } from "@/context/ThemeContext";
import { AREAS, PRIORITIES } from "@/models/Area";
import { Label } from "@/models/Label";
import { Task, TaskFormData } from "@/models/Task";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
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

type ReminderPresetUI = {
  id: string;
  offsetDays: number;
  hour: number;
  minute: number;
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
  const [showReminderTime, setShowReminderTime] = useState(false);
  const [editingReminderIndex, setEditingReminderIndex] = useState<number | null>(null);
  const [iosReminderTime, setIosReminderTime] = useState<Date>(() => {
    const base = new Date();
    base.setHours(9, 0, 0, 0);
    return base;
  });
  const [saving, setSaving] = useState(false);
  const [reminderPresets, setReminderPresets] = useState<ReminderPresetUI[]>([
    { id: `preset-${Date.now()}-1`, offsetDays: 1, hour: 9, minute: 0 },
  ]);
  const [titleError, setTitleError] = useState<string | null>(null);

  const normalizedDueDate = dueDate ? new Date(dueDate) : undefined;

  useEffect(() => {
    if (!visible) return;

    setTitle(initial?.title ?? "");
    setDescription(initial?.description ?? "");
    setPriority(normalizePriority(initial?.priority));
    setAreaId(initial?.areaId ?? defaultAreaId);
    setDueDate(initial?.dueDate ? new Date(initial.dueDate as any) : undefined);
    setLabelIds(initial?.labelIds ?? []);

    const initialReminders = Array.isArray((initial as any)?.reminders)
      ? ((initial as any).reminders as any[])
          .map((r, idx) => {
            const offsetDays = Number(r?.offsetDays);
            const hour = Number(r?.hour);
            const minute = Number(r?.minute);
            return {
              id: `preset-init-${idx}-${Date.now()}`,
              offsetDays: Number.isFinite(offsetDays) && offsetDays >= 0 ? offsetDays : 1,
              hour: Number.isFinite(hour) && hour >= 0 && hour <= 23 ? hour : 9,
              minute: Number.isFinite(minute) && minute >= 0 && minute <= 59 ? minute : 0,
            } as ReminderPresetUI;
          })
      : [];

    setReminderPresets(
      initialReminders.length > 0
        ? initialReminders
        : [{ id: `preset-${Date.now()}-1`, offsetDays: 1, hour: 9, minute: 0 }],
    );

    setShowDate(false);
    setShowReminderTime(false);
    setEditingReminderIndex(null);
    const base = new Date();
    base.setHours(9, 0, 0, 0);
    setIosReminderTime(base);
    setTitleError(null);
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

  const formatReminderTime = (hour: number, minute: number) => {
    const d = new Date();
    d.setHours(hour, minute, 0, 0);
    return d.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const addReminderPreset = () => {
    setReminderPresets((prev) => [
      ...prev,
      {
        id: `preset-${Date.now()}-${prev.length + 1}`,
        offsetDays: 0,
        hour: 9,
        minute: 0,
      },
    ]);
  };

  const removeReminderPreset = (index: number) => {
    setReminderPresets((prev) => prev.filter((_, i) => i !== index));
  };

  const updateReminderPreset = (
    index: number,
    patch: Partial<ReminderPresetUI>,
  ) => {
    setReminderPresets((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  };

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

  const openReminderTimePickerFor = (index: number) => {
    const preset = reminderPresets[index];
    if (!preset) return;

    const base = new Date();
    base.setHours(preset.hour, preset.minute, 0, 0);

    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: base,
        mode: "time",
        is24Hour: true,
        onChange: (_, selectedTime) => {
          if (selectedTime) {
            updateReminderPreset(index, {
              hour: selectedTime.getHours(),
              minute: selectedTime.getMinutes(),
            });
          }
        },
      });
      return;
    }

    setEditingReminderIndex(index);
    setIosReminderTime(base);
    setShowReminderTime(true);
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
        reminderPresets.forEach((preset) => {
          remindersArr.push({
            offsetDays: Math.max(0, Number(preset.offsetDays || 0)),
            hour: Math.max(0, Math.min(23, Number(preset.hour || 0))),
            minute: Math.max(0, Math.min(59, Number(preset.minute || 0))),
          });
        });
      }

      const payload: any = {
        title: normalizedTitle,
        description: description.trim(),
        priority: normalizePriority(priority),
        areaId,
        dueDate,
        labelIds,
      };

      if (remindersArr.length > 0) {
        payload.reminders = remindersArr;
      }

      await onSave(payload);
      onClose();
    } catch (err: any) {
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
          <View style={[s.handle, { backgroundColor: theme.border }]} />

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
              <Text style={[s.fieldError, { color: theme.danger }]}>{titleError}</Text>
            )}

            <TextInput
              style={[s.descInput, { color: theme.textSecond }]}
              placeholder="Descripción (opcional)"
              placeholderTextColor={theme.textThird}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            {!areaColor && (
              <View style={s.section}>
                <Text style={[s.sectionLabel, { color: theme.textSecond }]}>Área</Text>
                <View style={s.row}>
                  {AREAS.map((a) => (
                    <Pressable
                      key={a.id}
                      style={[
                        s.areaChip,
                        { borderColor: a.color },
                        areaId === a.id && { backgroundColor: a.color },
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

            <View style={s.section}>
              <Text style={[s.sectionLabel, { color: theme.textSecond }]}>Prioridad</Text>
              <View style={s.row}>
                {PRIORITIES.map((p) => (
                  <Pressable
                    key={p.value}
                    style={[
                      s.priorityChip,
                      { borderColor: p.color },
                      priority === p.value && { backgroundColor: p.color },
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

            <View style={s.section}>
              <Text style={[s.sectionLabel, { color: theme.textSecond }]}>Fecha de vencimiento</Text>
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
                  <Ionicons name="calendar-outline" size={16} color={activeColor} />
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
                  <Pressable style={s.clearDate} onPress={() => setDueDate(undefined)}>
                    <Ionicons name="close-circle" size={20} color={theme.textThird} />
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
            </View>

            <View style={s.section}>
              <Text style={[s.sectionLabel, { color: theme.textSecond }]}>Recordatorios</Text>

              {!dueDate && (
                <Text style={[s.helperText, { color: theme.textThird }]}>Primero selecciona fecha de vencimiento para configurar recordatorios.</Text>
              )}

              <View style={s.reminderList}>
                {reminderPresets.map((preset, index) => (
                  <View
                    key={preset.id}
                    style={[
                      s.reminderRow,
                      {
                        borderColor: theme.border,
                        backgroundColor: theme.inputBg,
                        opacity: dueDate ? 1 : 0.65,
                      },
                    ]}
                  >
                    <View style={s.reminderMain}>
                      <Text style={[s.reminderTitle, { color: theme.text }]}>Aviso {index + 1}</Text>
                      <Text style={[s.reminderSubtitle, { color: theme.textSecond }]}>Se enviará {preset.offsetDays} día(s) antes</Text>
                    </View>

                    <View style={s.reminderControls}>
                      <View style={s.stepper}>
                        <Pressable
                          style={[s.stepBtn, { borderColor: theme.border }]}
                          onPress={() => updateReminderPreset(index, { offsetDays: Math.max(0, preset.offsetDays - 1) })}
                          disabled={!dueDate}
                        >
                          <Ionicons name="remove" size={14} color={theme.textSecond} />
                        </Pressable>
                        <Text style={[s.stepValue, { color: theme.text }]}>{preset.offsetDays}d</Text>
                        <Pressable
                          style={[s.stepBtn, { borderColor: theme.border }]}
                          onPress={() => updateReminderPreset(index, { offsetDays: preset.offsetDays + 1 })}
                          disabled={!dueDate}
                        >
                          <Ionicons name="add" size={14} color={theme.textSecond} />
                        </Pressable>
                      </View>

                      <Pressable
                        style={[s.timeBtn, { borderColor: activeColor }]}
                        onPress={() => openReminderTimePickerFor(index)}
                        disabled={!dueDate}
                      >
                        <Ionicons name="time-outline" size={14} color={activeColor} />
                        <Text style={[s.timeBtnText, { color: activeColor }]}>
                          {formatReminderTime(preset.hour, preset.minute)}
                        </Text>
                      </Pressable>

                      <Pressable
                        style={s.removeBtn}
                        onPress={() => removeReminderPreset(index)}
                        disabled={!dueDate || reminderPresets.length <= 1}
                      >
                        <Ionicons name="trash-outline" size={16} color={theme.danger} />
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>

              <Pressable
                style={[
                  s.addReminderBtn,
                  {
                    borderColor: activeColor,
                    opacity: dueDate ? 1 : 0.65,
                  },
                ]}
                onPress={addReminderPreset}
                disabled={!dueDate}
              >
                <Ionicons name="add-circle-outline" size={16} color={activeColor} />
                <Text style={[s.addReminderText, { color: activeColor }]}>Agregar recordatorio</Text>
              </Pressable>

              <Text style={[s.helperText, { color: theme.textThird }]}>Puedes crear N avisos por tarea y elegir hora para cada uno.</Text>

              {showReminderTime && (
                <DateTimePicker
                  value={iosReminderTime}
                  mode="time"
                  display="default"
                  is24Hour
                  onChange={(_, time) => {
                    setShowReminderTime(false);
                    if (editingReminderIndex !== null && time) {
                      updateReminderPreset(editingReminderIndex, {
                        hour: time.getHours(),
                        minute: time.getMinutes(),
                      });
                    }
                    setEditingReminderIndex(null);
                  }}
                />
              )}
            </View>

            {labels.length > 0 && (
              <View style={s.section}>
                <Text style={[s.sectionLabel, { color: theme.textSecond }]}>Etiquetas</Text>
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

          <View style={[s.footer, { borderTopColor: theme.border }]}>
            <Pressable
              style={[s.cancelBtn, { backgroundColor: theme.inputBg }]}
              onPress={onClose}
            >
              <Text style={[s.cancelText, { color: theme.textSecond }]}>Cancelar</Text>
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
    reminderList: {
      gap: 8,
    },
    reminderRow: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 10,
      gap: 8,
    },
    reminderMain: {
      gap: 2,
    },
    reminderTitle: {
      fontSize: 13,
      fontWeight: "700",
    },
    reminderSubtitle: {
      fontSize: 12,
    },
    reminderControls: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
    },
    stepper: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    stepBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.card,
    },
    stepValue: {
      fontSize: 12,
      fontWeight: "700",
      minWidth: 30,
      textAlign: "center",
    },
    timeBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1.5,
      backgroundColor: t.card,
    },
    timeBtnText: {
      fontSize: 12,
      fontWeight: "700",
    },
    removeBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
    },
    addReminderBtn: {
      marginTop: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderWidth: 1.5,
      borderRadius: 10,
      paddingVertical: 10,
    },
    addReminderText: {
      fontSize: 13,
      fontWeight: "700",
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
