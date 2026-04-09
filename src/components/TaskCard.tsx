import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Theme } from '../context/ThemeContext';
import { Priority, Task } from '@/services/taskService';

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'alta', label: 'Alta', color: '#E53E3E' },
  { value: 'media', label: 'Media', color: '#C58B00' },
  { value: 'baja', label: 'Baja', color: '#38A169' },
];

export interface TaskCardProps {
  task: Task & { areaColor?: string; areaLabel?: string };
  color?: string; // Theme color passed manually (e.g. from AreaScreen)
  onToggle: () => void;
  onDelete: () => void;
  onEdit?: () => void;
  onPressArea?: () => void;
}

export function TaskCard({
  task,
  color,
  onToggle,
  onDelete,
  onEdit,
  onPressArea,
}: TaskCardProps) {
  const { theme } = useTheme();
  const tc = useMemo(() => getTcStyles(theme), [theme]);

  const p = PRIORITIES.find((x) => x.value === task.priority) || PRIORITIES[1];
  const overdue = task.dueDate && !task.done && new Date(task.dueDate) < new Date();
  
  // Decide what color to use for active states (checkboxes, area badges, borders)
  const activeColor = task.areaColor || color || theme.primary;

  const handleMenuPress = () => {
    const options = [];
    if (onEdit) options.push({ text: 'Editar', onPress: onEdit });
    if (onPressArea) options.push({ text: 'Ir al área', onPress: onPressArea });
    
    options.push(
      { text: 'Eliminar', style: 'destructive', onPress: onDelete },
      { text: 'Cancelar', style: 'cancel' }
    );

    Alert.alert(task.title, '', options as any);
  };

  // If there's an onPressArea, we make the whole card pressable (like in TasksScreen)
  // Otherwise, it's just a view (like in AreaScreen where body is pressable for edit)
  const CardContainer = onPressArea ? Pressable : View;
  const BodyContainer = onEdit && !onPressArea ? Pressable : View;

  return (
    <CardContainer
      style={onPressArea ? ({ pressed }: any) => [tc.card, pressed && { opacity: 0.9 }] : tc.card}
      {...(onPressArea ? { onPress: onPressArea } : {})}
    >
      <Pressable onPress={onToggle} style={tc.check} hitSlop={8}>
        <Ionicons
          name={task.done ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={task.done ? activeColor : theme.border}
        />
      </Pressable>

      <BodyContainer style={tc.body} {...(onEdit && !onPressArea ? { onPress: onEdit } : {})}>
        <Text style={[tc.title, task.done && tc.done]}>{task.title}</Text>
        {!!task.description && (
          <Text style={tc.desc} numberOfLines={1}>
            {task.description}
          </Text>
        )}
        <View style={tc.meta}>
          {/* Área Badge (only if areaLabel is present) */}
          {!!task.areaLabel && (
            <View style={[tc.badge, { backgroundColor: activeColor + '22' }]}>
              <Text style={[tc.badgeText, { color: activeColor }]}>{task.areaLabel}</Text>
            </View>
          )}

          {/* Prioridad */}
          <View style={[tc.badge, { backgroundColor: p.color + '22' }]}>
            <Text style={[tc.badgeText, { color: p.color }]}>{p.label}</Text>
          </View>

          {/* Fecha */}
          {task.dueDate && (
            <View style={[tc.badge, { backgroundColor: overdue ? '#FEE2E2' : theme.border }]}>
              <Ionicons
                name="calendar-outline"
                size={10}
                color={overdue ? '#E53E3E' : theme.textSecond}
              />
              <Text style={[tc.badgeText, { color: overdue ? '#E53E3E' : theme.textSecond }]}>
                {new Date(task.dueDate).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                })}
              </Text>
            </View>
          )}
        </View>
      </BodyContainer>

      {/* Menú */}
      <Pressable onPress={handleMenuPress} style={tc.menu} hitSlop={8}>
        <Ionicons name="ellipsis-vertical" size={18} color={theme.textSecond} />
      </Pressable>
    </CardContainer>
  );
}

const getTcStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      gap: 10,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
    },
    check: { padding: 2 },
    body: { flex: 1 },
    title: { fontSize: 14, fontWeight: '600', color: theme.text, marginBottom: 4 },
    done: { textDecorationLine: 'line-through', color: theme.textSecond },
    desc: { fontSize: 12, color: theme.textSecond, marginBottom: 6 },
    meta: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 6,
    },
    badgeText: { fontSize: 10, fontWeight: '600' },
    menu: { padding: 4 },
  });
