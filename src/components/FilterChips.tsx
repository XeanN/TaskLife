import React from 'react';
import { View, Text, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export interface FilterOption {
  id: string;
  label: string;
  color?: string; // Active color specific to this option
}

interface FilterChipsProps {
  options: FilterOption[];
  activeId: string;
  onChange: (id: string) => void;
  activeColor?: string; // Default active color if option doesn't provide one
  style?: StyleProp<ViewStyle>;
}

export function FilterChips({
  options,
  activeId,
  onChange,
  activeColor,
  style,
}: FilterChipsProps) {
  const { theme } = useTheme();
  const fallbackActiveColor = activeColor || theme.primary;

  return (
    <View style={[styles.container, style]}>
      {options.map((option) => {
        const isActive = activeId === option.id;
        const colorToUse = option.color || fallbackActiveColor;

        return (
          <Pressable
            key={option.id}
            style={[
              styles.chip,
              { backgroundColor: theme.card, borderColor: theme.border },
              isActive && { backgroundColor: colorToUse, borderColor: colorToUse },
            ]}
            onPress={() => onChange(option.id)}
          >
            <Text
              style={[
                styles.text,
                { color: theme.textSecond },
                isActive && styles.textActive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
  },
  textActive: {
    color: '#fff',
  },
});
