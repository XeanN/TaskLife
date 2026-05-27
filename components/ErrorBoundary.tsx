import { useTheme } from '@/hooks/use-theme-color';
import React, { ReactErrorInfo, ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * Catches React errors and displays user-friendly error UI
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ReactErrorInfo) {
    console.error('❌ Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorBoundaryFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Fallback UI when error is caught
 */
function ErrorBoundaryFallback({
  error,
  onReset,
}: {
  error: Error | null;
  onReset: () => void;
}) {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 20,
        paddingTop: 40,
      }}
    >
      <View
        style={{
          alignItems: 'center',
          marginVertical: 40,
        }}
      >
        <Text
          style={{
            fontSize: 48,
            marginBottom: 20,
          }}
        >
          ⚠️
        </Text>

        <Text
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 10,
            textAlign: 'center',
          }}
        >
          Ocurrió un error
        </Text>

        <Text
          style={{
            fontSize: 14,
            color: colors.textSecondary,
            marginBottom: 30,
            textAlign: 'center',
          }}
        >
          La aplicación encontró un problema inesperado. Intenta recargar.
        </Text>

        {error && (
          <View
            style={{
              backgroundColor: colors.cardBackground,
              borderRadius: 8,
              padding: 15,
              marginBottom: 30,
              width: '100%',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: colors.error,
                fontFamily: 'monospace',
                marginBottom: 10,
              }}
              numberOfLines={5}
            >
              {error.message}
            </Text>
          </View>
        )}

        <Pressable
          onPress={onReset}
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 30,
            paddingVertical: 12,
            borderRadius: 8,
            marginBottom: 10,
            width: '100%',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: 'white',
              fontWeight: '600',
              fontSize: 16,
            }}
          >
            🔄 Reintentar
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            // Could navigate to home or reload app
            console.log('Navigate to home');
          }}
          style={{
            paddingHorizontal: 30,
            paddingVertical: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.primary,
            width: '100%',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: colors.primary,
              fontWeight: '600',
              fontSize: 16,
            }}
          >
            🏠 Ir al inicio
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
