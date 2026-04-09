import React from 'react';
import { Pressable, StyleSheet, StyleProp, ViewStyle, PressableProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Reusing global theme values if needed, otherwise rely on props
// As this is a generic component, we allow custom colors
const defaultColor = '#5050C8'; // Fallback to theme.primary

interface FloatingActionButtonProps extends PressableProps {
  onPress: () => void;
  iconName?: keyof typeof Ionicons.glyphMap;
  color?: string;
  iconColor?: string;
  bottomOffset?: number;
  rightOffset?: number;
  style?: StyleProp<ViewStyle>;
}

export function FloatingActionButton({
  onPress,
  iconName = 'add',
  color = defaultColor,
  iconColor = '#fff',
  bottomOffset = 16,
  rightOffset = 24,
  style,
  ...props
}: FloatingActionButtonProps) {
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      style={[
        styles.fab,
        {
          backgroundColor: color,
          bottom: insets.bottom > 0 ? insets.bottom + bottomOffset : bottomOffset + 8, // Adjust if device has no safe area
          right: rightOffset,
        },
        style,
      ]}
      onPress={onPress}
      {...props}
    >
      <Ionicons name={iconName} size={28} color={iconColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
});
