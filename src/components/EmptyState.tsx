import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
}

export function EmptyState({
  title = "No hay tareas aquí",
  subtitle = "Toca + para agregar una",
  iconName = "checkmark-done-circle-outline",
  iconSize = 56,
}: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Ionicons name={iconName} size={iconSize} color={theme.border} />
      <Text style={[styles.title, { color: theme.textSecond }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: theme.textSecond }]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
  },
});
