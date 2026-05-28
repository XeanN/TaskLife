import { useTheme } from '@/context/ThemeContext';
import { formatErrorMessage, isQuotaError } from '@/services/errorHandler';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, Pressable, Text, View } from 'react-native';

export interface ErrorAlertProps {
  visible: boolean;
  error: Error | null;
  onDismiss: () => void;
  onRetry?: () => void;
  autoHideDuration?: number; // milliseconds, 0 = never auto-hide
}

/**
 * Error Alert Component
 * Displays error messages with retry option
 * Can be shown/hidden with auto-dismiss capability
 */
export function ErrorAlert({
  visible,
  error,
  onDismiss,
  onRetry,
  autoHideDuration = 0,
}: ErrorAlertProps) {
  const { theme } = useTheme();
  const [localVisible, setLocalVisible] = useState(visible);
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    setLocalVisible(visible);

    if (visible) {
      // Slide in
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto-dismiss if duration > 0
      if (autoHideDuration > 0) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, autoHideDuration);

        return () => clearTimeout(timer);
      }
    } else {
      // Slide out
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setLocalVisible(false);
      });
    }
  }, [visible, autoHideDuration]);

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setLocalVisible(false);
      onDismiss();
    });
  };

  if (!localVisible || !error) return null;

  if (isQuotaError(error)) {
    return null;
  }

  const animatedStyle = {
    transform: [
      {
        translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-100, 0],
        }),
      },
    ],
  };

  const errorMessage = formatErrorMessage(error);
  const isRetryable = (error as any)?.isRetryable ?? false;
  const isDanger = errorMessage.includes('❌') || errorMessage.includes('🚫');
  const isWarning = errorMessage.includes('⚠️');

  // Determine background color based on error type
  const bgColor = isDanger ? theme.danger : isWarning ? theme.primary : theme.primary;
  const bgOpacity = 0.1;

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        },
        animatedStyle,
      ]}
    >
      <View
        style={{
          backgroundColor: bgColor + '20',
          borderBottomWidth: 1,
          borderBottomColor: bgColor,
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
          }}
        >
          <Ionicons
            name={isDanger ? 'alert-circle' : isWarning ? 'warning' : 'information-circle'}
            size={20}
            color={bgColor}
            style={{ marginRight: 12 }}
          />

          <Text
            style={{
              flex: 1,
              fontSize: 13,
              color: theme.text,
              fontWeight: '500',
            }}
            numberOfLines={2}
          >
            {errorMessage}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            gap: 8,
            marginLeft: 12,
          }}
        >
          {isRetryable && onRetry && (
            <Pressable
              onPress={onRetry}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: bgColor,
                borderRadius: 4,
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontSize: 12,
                  fontWeight: '600',
                }}
              >
                🔄 Reintentar
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={handleDismiss}
            style={{
              paddingHorizontal: 8,
              paddingVertical: 6,
            }}
          >
            <Ionicons name="close" size={18} color={theme.text} />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

/**
 * Hook to manage error alert state
 * Usage:
 * const errorAlert = useErrorAlert();
 * errorAlert.show(error);
 * errorAlert.hide();
 */
export function useErrorAlert() {
  const [error, setError] = useState<Error | null>(null);
  const [visible, setVisible] = useState(false);

  const show = (err: Error | null) => {
    if (err) {
      setError(err);
      setVisible(true);
    }
  };

  const hide = () => {
    setVisible(false);
    // Clear error after animation
    setTimeout(() => setError(null), 300);
  };

  return {
    visible,
    error,
    show,
    hide,
  };
}
