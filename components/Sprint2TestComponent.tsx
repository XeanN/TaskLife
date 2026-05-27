import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useReminders } from '@/hooks/useReminders';
import { useStats } from '@/hooks/useStats';
import { useWeeklyReport } from '@/hooks/useWeeklyReport';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text } from 'react-native';

/**
 * Sprint 2 Test Component
 * 
 * Quicktest para verificar que stats, weekly-report, y reminders funcionan
 * 
 * INSTRUCCIONES:
 * 1. Importa este componente en una pantalla temporal
 * 2. Renderízalo en la pantalla
 * 3. Abre Metro console
 * 4. Presiona los botones y verifica los logs
 * 5. Confirma que no hay 429 errors
 */
export default function Sprint2TestComponent() {
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useStats();
  const { weeklyReport, loading: reportLoading, error: reportError, refetch: refetchReport } = useWeeklyReport();
  const { reminders, loading: remindersLoading, error: remindersError, executing, executeReminders, refetch: refetchReminders } = useReminders();

  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const styles = {
    container: {
      padding: 16,
      backgroundColor: theme.bg,
    },
    header: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 12,
      marginTop: 8,
    },
    subheader: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
      marginTop: 6,
    },
    section: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      borderLeftWidth: 4,
    },
    statsSection: { borderLeftColor: '#4A7FA5' },
    reportSection: { borderLeftColor: '#38A169' },
    remindersSection: { borderLeftColor: '#C58B00' },
    
    button: {
      backgroundColor: theme.primary,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      marginVertical: 6,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 13,
    },
    errorText: {
      color: theme.danger,
      fontSize: 12,
      marginTop: 8,
      fontStyle: 'italic',
    },
    successText: {
      color: theme.success,
      fontSize: 12,
      marginTop: 8,
    },
    dataText: {
      fontSize: 12,
      color: theme.textSecond,
      fontFamily: 'monospace',
      marginTop: 6,
      padding: 8,
      backgroundColor: theme.inputBg,
      borderRadius: 6,
    },
    userId: {
      fontSize: 11,
      color: theme.textThird,
      marginBottom: 8,
      fontStyle: 'italic',
    },
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.header}>🧪 Sprint 2 Endpoints Test</Text>
      <Text style={styles.userId}>
        👤 User ID: {user?.id || 'Not logged in'}
      </Text>

      {/* ── STATS ── */}
      <Pressable
        style={[styles.section, styles.statsSection]}
        onPress={() => setExpandedSection(expandedSection === 'stats' ? null : 'stats')}
      >
        <Text style={styles.subheader}>
          📊 Stats {statsLoading && <ActivityIndicator size="small" />}
        </Text>
        {expandedSection === 'stats' && (
          <>
            {statsError && (
              <Text style={styles.errorText}>
                ❌ {statsError.message}
              </Text>
            )}
            {stats && (
              <Text style={styles.dataText}>
                {JSON.stringify(stats, null, 2)}
              </Text>
            )}
            <Pressable style={styles.button} onPress={refetchStats}>
              <Text style={styles.buttonText}>🔄 Refetch Stats</Text>
            </Pressable>
          </>
        )}
      </Pressable>

      {/* ── WEEKLY REPORT ── */}
      <Pressable
        style={[styles.section, styles.reportSection]}
        onPress={() => setExpandedSection(expandedSection === 'report' ? null : 'report')}
      >
        <Text style={styles.subheader}>
          📈 Weekly Report {reportLoading && <ActivityIndicator size="small" />}
        </Text>
        {expandedSection === 'report' && (
          <>
            {reportError && (
              <Text style={styles.errorText}>
                ❌ {reportError.message}
              </Text>
            )}
            {weeklyReport && (
              <Text style={styles.dataText}>
                {JSON.stringify(weeklyReport, null, 2)}
              </Text>
            )}
            <Pressable style={styles.button} onPress={refetchReport}>
              <Text style={styles.buttonText}>🔄 Refetch Report</Text>
            </Pressable>
          </>
        )}
      </Pressable>

      {/* ── REMINDERS ── */}
      <Pressable
        style={[styles.section, styles.remindersSection]}
        onPress={() => setExpandedSection(expandedSection === 'reminders' ? null : 'reminders')}
      >
        <Text style={styles.subheader}>
          🔔 Reminders ({reminders?.length ?? 0}) {remindersLoading && <ActivityIndicator size="small" />}
        </Text>
        {expandedSection === 'reminders' && (
          <>
            {remindersError && (
              <Text style={styles.errorText}>
                ❌ {remindersError.message}
              </Text>
            )}
            {reminders && reminders.length > 0 && (
              <Text style={styles.dataText}>
                {JSON.stringify(reminders, null, 2)}
              </Text>
            )}
            {reminders && reminders.length === 0 && (
              <Text style={styles.successText}>
                ✅ No pending reminders
              </Text>
            )}
            <Pressable style={styles.button} onPress={refetchReminders}>
              <Text style={styles.buttonText}>🔄 Refetch Reminders</Text>
            </Pressable>
            <Pressable
              style={[styles.button, { backgroundColor: theme.success }]}
              onPress={executeReminders}
              disabled={executing}
            >
              <Text style={styles.buttonText}>
                {executing ? '⏳ Executing...' : '▶️ Execute Reminders'}
              </Text>
            </Pressable>
          </>
        )}
      </Pressable>

      <Text style={[styles.subheader, { marginTop: 20, color: theme.textThird }]}>
        📝 Cómo Usar:
      </Text>
      <Text style={{ fontSize: 12, color: theme.textSecond, lineHeight: 18 }}>
        {`1. Presiona cada sección para expandir\n2. Verifica que los datos se cargan sin error\n3. Abre Metro console para ver logs\n4. Presiona "Execute Reminders" para test\n5. Si ves 429, espera un poco y reintentar\n6. No debería ver múltiples requests simultáneos`}
      </Text>
    </ScrollView>
  );
}
