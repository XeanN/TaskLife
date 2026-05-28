import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { syncReminderNotifications } from "@/services/notificationsService";
import { crearReminder } from "@/services/remindersService";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";

export default function CreateReminderScreen() {
  const { theme } = useTheme();
  const s = makeStyles(theme);
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [scheduledAt, setScheduledAt] = useState<Date>(() => {
    const base = new Date(Date.now() + 5 * 60_000);
    return base;
  });
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const quickSet = (ms: number) => {
    setScheduledAt(new Date(Date.now() + ms));
  };

  const formattedScheduledAt = scheduledAt.toLocaleString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const pickDateTime = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: scheduledAt,
        mode: "date",
        onChange: (_, pickedDate) => {
          if (!pickedDate) return;
          const next = new Date(scheduledAt);
          next.setFullYear(pickedDate.getFullYear(), pickedDate.getMonth(), pickedDate.getDate());
          DateTimePickerAndroid.open({
            value: next,
            mode: "time",
            is24Hour: true,
            onChange: (_, pickedTime) => {
              if (!pickedTime) return;
              const final = new Date(next);
              final.setHours(pickedTime.getHours(), pickedTime.getMinutes(), 0, 0);
              setScheduledAt(final);
            },
          });
        },
      });
      return;
    }

    setShowPicker(true);
  };

  const submit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const reminder = {
        title: title || "Recordatorio",
        body: body || "",
        dueAt: scheduledAt.toISOString(),
        scheduledAt: scheduledAt.toISOString(),
      };

      const created = await crearReminder(user.id, reminder);

      // Schedule locally as well
      await syncReminderNotifications([created]);

      router.back();
    } catch (err: any) {
      console.warn("Error creando recordatorio:", err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={s.headerTitle}>Crear recordatorio</Text>
      </View>

      <View style={s.content}>
        <Text style={[s.label, { color: theme.text }]}>Título</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Ej: Tomar medicina"
          placeholderTextColor={theme.textSecond}
          style={[s.input, { backgroundColor: theme.inputBg, color: theme.text }]}
        />

        <Text style={[s.label, { color: theme.text }]}>Descripción</Text>
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="Opcional"
          placeholderTextColor={theme.textSecond}
          style={[s.input, { backgroundColor: theme.inputBg, color: theme.text }]}
        />

        <Text style={[s.label, { color: theme.text }]}>Fecha/Hora (ISO)</Text>
        <Pressable onPress={pickDateTime} style={[s.input, { backgroundColor: theme.inputBg }]}> 
          <Text style={{ color: theme.text }}>{formattedScheduledAt}</Text>
        </Pressable>

        {showPicker && (
          <DateTimePicker
            value={scheduledAt}
            mode="datetime"
            display="default"
            onChange={(_, dt) => {
              setShowPicker(false);
              if (dt) setScheduledAt(dt);
            }}
          />
        )}

        <View style={s.quickRow}>
          <Pressable style={[s.quickBtn, { backgroundColor: theme.primary }]} onPress={() => quickSet(10_000)}>
            <Text style={s.quickText}>+10s</Text>
          </Pressable>
          <Pressable style={[s.quickBtn, { backgroundColor: theme.primary }]} onPress={() => quickSet(60_000)}>
            <Text style={s.quickText}>+1m</Text>
          </Pressable>
          <Pressable style={[s.quickBtn, { backgroundColor: theme.primary }]} onPress={() => quickSet(5 * 60_000)}>
            <Text style={s.quickText}>+5m</Text>
          </Pressable>
          <Pressable style={[s.quickBtn, { backgroundColor: theme.primary }]} onPress={() => quickSet(60 * 60_000)}>
            <Text style={s.quickText}>+1h</Text>
          </Pressable>
        </View>

        <Pressable style={[s.saveBtn, { backgroundColor: theme.primary }]} onPress={submit} disabled={loading}>
          <Text style={s.saveText}>{loading ? "Guardando..." : "Programar recordatorio"}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (t: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 8,
      backgroundColor: t.card,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '800', color: t.text },
    content: { padding: 20, gap: 12 },
    label: { fontSize: 13, fontWeight: '600' },
    input: {
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: t.border,
    },
    quickRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
    quickBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
    quickText: { color: '#fff', fontWeight: '700' },
    saveBtn: { marginTop: 12, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    saveText: { color: '#fff', fontWeight: '800' },
  });
