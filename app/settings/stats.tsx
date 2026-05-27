import { useTheme } from "@/context/ThemeContext";
import { useReminders } from "@/hooks/useReminders";
import { useStats } from "@/hooks/useStats";
import { useWeeklyReport } from "@/hooks/useWeeklyReport";
import { sendTestReminderNotification } from "@/services/notificationsService";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StatsScreen() {
  const { theme } = useTheme();
  const { stats, loading: statsLoading, error: statsError } = useStats();
  const { weeklyReport, loading: reportLoading, error: reportError } =
    useWeeklyReport();
  const { reminders, loading: remindersLoading, error: remindersError } =
    useReminders();
  const [sendingTestReminder, setSendingTestReminder] = useState(false);

  const s = makeStyles(theme);

  const handleBack = () => router.back();

  const handleSendTestReminder = async () => {
    setSendingTestReminder(true);
    try {
      await sendTestReminderNotification();
    } finally {
      setSendingTestReminder(false);
    }
  };

  // Calcular porcentaje de completitud
  const completionRate =
    stats && stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0;

  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
      {/* ── Header ── */}
      <View style={s.header}>
        <Pressable onPress={handleBack} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={s.headerTitle}>📊 Estadísticas</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={s.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.contentContainer}
      >
        {/* ── STATS GENERALES ── */}
        <View style={[s.section, { borderLeftColor: theme.primary }]}>
          <Text style={s.sectionTitle}>📈 Resumen General</Text>

          {statsLoading && (
            <View style={s.centerLoader}>
              <ActivityIndicator color={theme.primary} size="large" />
              <Text style={s.loadingText}>Cargando estadísticas...</Text>
            </View>
          )}

          {statsError && (
            <View style={s.errorBox}>
              <Ionicons name="alert-circle" size={20} color={theme.danger} />
              <Text style={s.errorText}>{statsError.message}</Text>
            </View>
          )}

          {stats && !statsLoading && (
            <View>
              <View style={s.statsGrid}>
                {/* Total Tareas */}
                <View style={[s.statCard, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="checkmark-circle" size={32} color={theme.primary} />
                  <Text style={s.statValue}>{stats.totalTasks}</Text>
                  <Text style={s.statLabel}>Total</Text>
                </View>

                {/* Completadas */}
                <View style={[s.statCard, { backgroundColor: theme.successBg }]}>
                  <Ionicons name="checkmark-done-circle" size={32} color={theme.success} />
                  <Text style={s.statValue}>{stats.completedTasks}</Text>
                  <Text style={s.statLabel}>Completadas</Text>
                </View>

                {/* Pendientes */}
                <View style={[s.statCard, { backgroundColor: theme.dangerBg }]}>
                  <Ionicons name="time" size={32} color={theme.danger} />
                  <Text style={s.statValue}>{stats.pendingTasks}</Text>
                  <Text style={s.statLabel}>Pendientes</Text>
                </View>

                {/* Porcentaje */}
                <View style={[s.statCard, { backgroundColor: theme.goldBg }]}>
                  <Ionicons name="flame" size={32} color={theme.gold} />
                  <Text style={s.statValue}>{completionRate}%</Text>
                  <Text style={s.statLabel}>Completitud</Text>
                </View>
              </View>

              {/* Progress bar */}
              <View style={s.progressSection}>
                <View style={s.progressBar}>
                  <View
                    style={[
                      s.progressFill,
                      {
                        width: `${completionRate}%`,
                        backgroundColor: theme.success,
                      },
                    ]}
                  />
                </View>
                <Text style={s.progressText}>
                  {stats.completedTasks} de {stats.totalTasks} tareas completadas
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* ── REPORTE SEMANAL ── */}
        <View style={[s.section, { borderLeftColor: theme.success }]}>
          <Text style={s.sectionTitle}>📅 Esta Semana</Text>

          {reportLoading && (
            <View style={s.centerLoader}>
              <ActivityIndicator color={theme.success} size="large" />
            </View>
          )}

          {reportError && (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{reportError.message}</Text>
            </View>
          )}

          {weeklyReport && !reportLoading && (
            <View>
              <View style={s.weeklyRow}>
                <View style={s.weeklyItem}>
                  <Text style={[s.weeklyValue, { color: theme.primary }]}>
                    {weeklyReport.tasksCreated}
                  </Text>
                  <Text style={s.weeklyLabel}>Creadas</Text>
                </View>
                <View style={s.weeklyDivider} />
                <View style={s.weeklyItem}>
                  <Text style={[s.weeklyValue, { color: theme.success }]}>
                    {weeklyReport.tasksCompleted}
                  </Text>
                  <Text style={s.weeklyLabel}>Completadas</Text>
                </View>
                <View style={s.weeklyDivider} />
                <View style={s.weeklyItem}>
                  <Text style={[s.weeklyValue, { color: theme.gold }]}>
                    {weeklyReport.completionRate
                      ? Math.round(weeklyReport.completionRate * 100)
                      : 0}
                    %
                  </Text>
                  <Text style={s.weeklyLabel}>Tasa</Text>
                </View>
              </View>

              {/* Por área */}
              {weeklyReport.byArea && Object.keys(weeklyReport.byArea).length > 0 && (
                <View style={s.byAreaSection}>
                  <Text style={s.byAreaTitle}>Desglose por Área:</Text>
                  {Object.entries(weeklyReport.byArea).map(([area, count]) => (
                    <View key={area} style={s.areaRow}>
                      <Text style={s.areaName}>{area}</Text>
                      <Text style={s.areaCount}>{count} tareas</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        {/* ── RECORDATORIOS ── */}
        <View style={[s.section, { borderLeftColor: theme.gold }]}>
          <Text style={s.sectionTitle}>🔔 Recordatorios Pendientes</Text>

          {remindersLoading && (
            <View style={s.centerLoader}>
              <ActivityIndicator color={theme.gold} size="large" />
            </View>
          )}

          {remindersError && (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{remindersError.message}</Text>
            </View>
          )}

          {!remindersLoading && Array.isArray(reminders) && (
            <View>
              {reminders.length === 0 ? (
                <View style={s.emptyBox}>
                  <Ionicons name="checkmark-circle" size={40} color={theme.success} />
                    <Text style={s.emptyText}>No hay recordatorios pendientes.</Text>
                    <Pressable onPress={handleSendTestReminder} style={s.testButton}>
                      <Text style={s.testButtonText}>Enviar Alarma de Prueba</Text>
                    </Pressable>
                </View>
              ) : (
                <View>
                  <Text style={s.remindersCount}>
                    {reminders.length} recordador{reminders.length !== 1 ? "es" : ""}{" "}
                    pendiente{reminders.length !== 1 ? "s" : ""}
                  </Text>
                  <View style={s.remindersList}>
                    {reminders.slice(0, 3).map((reminder: any) => (
                      <View key={reminder.id} style={s.reminderItem}>
                        <Ionicons name="time" size={16} color={theme.textSecond} />
                        <View style={{ flex: 1 }}>
                          <Text style={s.reminderText}>
                            {String(
                              reminder.title ||
                                reminder.type ||
                                reminder.message ||
                                "Recordatorio",
                            )
                              .replace(/_/g, " ")
                              .toUpperCase()}
                          </Text>
                          {(reminder.dueAt || reminder.scheduledAt) && (
                            <Text style={s.reminderMeta}>
                              {new Date(reminder.dueAt || reminder.scheduledAt).toLocaleString()}
                            </Text>
                          )}
                        </View>
                      </View>
                    ))}
                    {reminders.length > 3 && (
                      <Text style={s.moreReminders}>
                        +{reminders.length - 3} más...
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={s.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (t: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },
    container: { flex: 1 },
    contentContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: t.bg,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
    },
    backBtn: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: t.text,
    },

    section: {
      backgroundColor: t.card,
      borderRadius: 14,
      borderLeftWidth: 4,
      padding: 16,
      marginBottom: 14,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: t.text,
      marginBottom: 12,
    },

    centerLoader: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 24,
      gap: 8,
    },
    loadingText: {
      fontSize: 13,
      color: t.textSecond,
      fontWeight: "500",
    },

    errorBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: t.dangerBg,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: t.danger,
    },
    errorText: {
      fontSize: 12,
      color: t.danger,
      fontWeight: "500",
      flex: 1,
    },

    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    statCard: {
      width: "48%",
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 10,
      alignItems: "center",
      gap: 6,
    },
    statValue: {
      fontSize: 24,
      fontWeight: "800",
      color: t.text,
    },
    statLabel: {
      fontSize: 11,
      color: t.textSecond,
      fontWeight: "600",
    },

    progressSection: {
      marginTop: 14,
      gap: 8,
    },
    progressBar: {
      width: "100%",
      height: 8,
      backgroundColor: t.border,
      borderRadius: 4,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 4,
    },
    progressText: {
      fontSize: 12,
      color: t.textSecond,
      fontWeight: "500",
    },

    weeklyRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
    },
    weeklyItem: {
      flex: 1,
      alignItems: "center",
    },
    weeklyValue: {
      fontSize: 20,
      fontWeight: "800",
      marginBottom: 4,
    },
    weeklyLabel: {
      fontSize: 11,
      color: t.textSecond,
      fontWeight: "600",
    },
    weeklyDivider: {
      width: 1,
      height: 40,
      backgroundColor: t.border,
      marginHorizontal: 8,
    },

    byAreaSection: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: t.border,
    },
    byAreaTitle: {
      fontSize: 12,
      fontWeight: "700",
      color: t.textSecond,
      marginBottom: 8,
      textTransform: "uppercase",
    },
    areaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 6,
    },
    areaName: {
      fontSize: 13,
      color: t.text,
      fontWeight: "500",
      textTransform: "capitalize",
    },
    areaCount: {
      fontSize: 12,
      color: t.textSecond,
      fontWeight: "600",
    },

    emptyBox: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 24,
      gap: 8,
    },
    emptyText: {
      fontSize: 13,
      color: t.success,
      fontWeight: "600",
      textAlign: "center",
    },
    emptySubText: {
      fontSize: 12,
      color: t.textSecond,
      textAlign: "center",
      lineHeight: 18,
    },
    testButton: {
      marginTop: 10,
      backgroundColor: t.primary,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      alignItems: "center",
    },
    testButtonText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "700",
    },

    remindersCount: {
      fontSize: 14,
      fontWeight: "700",
      color: t.text,
      marginBottom: 10,
    },
    remindersList: {
      gap: 6,
    },
    reminderItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      backgroundColor: t.inputBg,
      borderRadius: 6,
    },
    reminderText: {
      fontSize: 12,
      color: t.text,
      fontWeight: "500",
    },
    reminderMeta: {
      fontSize: 11,
      color: t.textThird,
      marginTop: 2,
    },
    moreReminders: {
      fontSize: 11,
      color: t.textThird,
      fontStyle: "italic",
      paddingHorizontal: 10,
      paddingVertical: 6,
    },

    spacer: { height: 20 },
  });
