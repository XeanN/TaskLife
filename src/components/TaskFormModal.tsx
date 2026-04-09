import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme, Theme } from '../context/ThemeContext';
import { Priority, Task } from '@/services/taskService';

// Constants that can be exported or just defined here for the modal
const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'alta', label: 'Alta', color: '#E53E3E' },
  { value: 'media', label: 'Media', color: '#C58B00' },
  { value: 'baja', label: 'Baja', color: '#38A169' },
];

export interface TaskFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description: string;
    priority: Priority;
    dueDate?: Date;
    areaId?: string;
  }) => void;
  initial?: Task; // If present, implies Edit mode
  color?: string; // Theme color
  showAreaSelector?: boolean;
  areas?: { id: string; label: string; color: string }[];
}

export function TaskFormModal({
  visible,
  onClose,
  onSave,
  initial,
  color,
  showAreaSelector,
  areas = [],
}: TaskFormModalProps) {
  const { theme, dark } = useTheme();
  const fm = useMemo(() => getFmStyles(theme), [theme]);

  const [title, setTitle] = useState(initial?.title ?? '');
  const [desc, setDesc] = useState(initial?.description ?? '');
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'media');
  const [dueDate, setDueDate] = useState<Date | undefined>(initial?.dueDate);
  const [showDate, setShowDate] = useState(false);
  const [areaId, setAreaId] = useState<string>(areas.length > 0 ? areas[0].id : 'work');

  // Sync initial data when modal opens
  useEffect(() => {
    if (visible) {
      setTitle(initial?.title ?? '');
      setDesc(initial?.description ?? '');
      setPriority(initial?.priority ?? 'media');
      setDueDate(initial?.dueDate ? new Date(initial.dueDate) : undefined);
      
      // We don't change areaId if initial doesn't have one as it isn't part of Task directly here, 
      // but in quick task mode we just reset.
      if (!initial && areas.length > 0) {
        setAreaId(areas[0].id);
      }
    }
  }, [visible, initial, areas]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Escribe un nombre para la tarea');
      return;
    }
    
    onSave({
      title: title.trim(),
      description: desc.trim(),
      priority,
      dueDate,
      ...(showAreaSelector ? { areaId } : {}),
    });

    // We don't reset state here. If it closes, the next time it opens `useEffect` will handle it.
  };

  const primaryColor = color || theme.primary;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={fm.overlay}
      >
        <View style={fm.card}>
          <Text style={fm.heading}>{initial ? 'Editar tarea' : 'Nueva tarea'}</Text>

          {/* Título */}
          <TextInput
            style={fm.input}
            placeholder="Nombre de la tarea"
            placeholderTextColor={theme.textSecond}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />

          {/* Descripción (Hidden in quick modal mode if desired, but good to have) */}
          {!showAreaSelector && (
            <TextInput
              style={[fm.input, { height: 72, textAlignVertical: 'top' }]}
              placeholder="Descripción (opcional)"
              placeholderTextColor={theme.textSecond}
              value={desc}
              onChangeText={setDesc}
              multiline
            />
          )}

          {/* Selector de Área */}
          {showAreaSelector && areas.length > 0 && (
            <>
              <Text style={fm.label}>Área</Text>
              <View style={fm.row}>
                {areas.map((a) => (
                  <Pressable
                    key={a.id}
                    style={[fm.chip, areaId === a.id && { backgroundColor: a.color }]}
                    onPress={() => setAreaId(a.id)}
                  >
                    <Text style={[fm.chipText, areaId === a.id && { color: '#fff' }]}>
                      {a.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* Prioridad */}
          <Text style={fm.label}>Prioridad</Text>
          <View style={fm.row}>
            {PRIORITIES.map((p) => (
              <Pressable
                key={p.value}
                style={[fm.chip, priority === p.value && { backgroundColor: p.color }]}
                onPress={() => setPriority(p.value)}
              >
                <Text style={[fm.chipText, priority === p.value && { color: '#fff' }]}>
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Fecha (Solo si no es QuickTask, o podrías permitirlo en QuickTask también) */}
          {!showAreaSelector && (
            <>
              <Text style={fm.label}>Fecha de vencimiento</Text>
              <Pressable style={fm.dateBtn} onPress={() => setShowDate(true)}>
                <Ionicons name="calendar-outline" size={16} color={primaryColor} />
                <Text style={fm.dateBtnText}>
                  {dueDate
                    ? dueDate.toLocaleDateString('es-ES', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'long',
                      })
                    : 'Sin fecha'}
                </Text>
                {dueDate && (
                  <Pressable onPress={() => setDueDate(undefined)} hitSlop={8}>
                    <Ionicons name="close-circle" size={16} color={theme.textSecond} />
                  </Pressable>
                )}
              </Pressable>

              {showDate && (
                <DateTimePicker
                  value={dueDate ?? new Date()}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  themeVariant={dark ? 'dark' : 'light'}
                  onChange={(_, date) => {
                    setShowDate(false);
                    if (date) setDueDate(date);
                  }}
                />
              )}
            </>
          )}

          {/* Botones */}
          <View style={fm.buttons}>
            <Pressable style={fm.cancelBtn} onPress={onClose}>
              <Text style={fm.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable style={[fm.saveBtn, { backgroundColor: primaryColor }]} onPress={handleSave}>
              <Text style={fm.saveText}>{initial ? 'Guardar' : 'Agregar'}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const getFmStyles = (theme: Theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'flex-end',
    },
    card: {
      backgroundColor: theme.bg,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      paddingBottom: Platform.OS === 'ios' ? 40 : 24,
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
    },
    heading: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 20,
    },
    input: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 10,
    },
    row: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 20,
      flexWrap: 'wrap',
    },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.text,
    },
    dateBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: theme.card,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 24,
    },
    dateBtnText: {
      flex: 1,
      fontSize: 15,
      color: theme.text,
    },
    buttons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    cancelBtn: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: theme.card,
    },
    cancelText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textSecond,
    },
    saveBtn: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    saveText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#fff',
    },
  });
