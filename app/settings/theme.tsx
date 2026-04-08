import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ThemeScreen() {
  const { dark, theme, toggle } = useTheme();
  const s = makeStyles(theme);

  const OPTIONS = [
    { id: "light", label: "Claro", icon: "sunny-outline", active: !dark },
    { id: "dark", label: "Oscuro", icon: "moon-outline", active: dark },
  ];

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={s.headerTitle}>Tema de la app</Text>
      </View>

      <View style={s.content}>
        <Text style={s.subtitle}>Elige cómo quieres ver TaskLife</Text>

        {/* Cards */}
        <View style={s.optionsRow}>
          {OPTIONS.map((opt) => (
            <Pressable
              key={opt.id}
              style={[
                s.optionCard,
                { backgroundColor: theme.card, borderColor: theme.border },
                opt.active && {
                  borderColor: theme.primary,
                  borderWidth: 2,
                },
              ]}
              onPress={() => {
                if (!opt.active) toggle();
              }}
            >
              {/* Check badge */}
              {opt.active && (
                <View
                  style={[s.checkBadge, { backgroundColor: theme.primary }]}
                >
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
              )}

              <View
                style={[
                  s.optionIcon,
                  {
                    backgroundColor: opt.active
                      ? theme.primaryLight
                      : theme.inputBg,
                  },
                ]}
              >
                <Ionicons
                  name={opt.icon as any}
                  size={28}
                  color={opt.active ? theme.primary : theme.textSecond}
                />
              </View>
              <Text
                style={[
                  s.optionLabel,
                  {
                    color: opt.active ? theme.primary : theme.text,
                    fontWeight: opt.active ? "700" : "500",
                  },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Toggle rápido */}
        <View
          style={[
            s.toggleRow,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={s.toggleLeft}>
            <View
              style={[
                s.toggleIcon,
                {
                  backgroundColor: dark ? theme.goldBg : theme.primaryLight,
                },
              ]}
            >
              <Ionicons
                name={dark ? "moon" : "sunny"}
                size={20}
                color={dark ? theme.gold : theme.primary}
              />
            </View>
            <View>
              <Text style={[s.toggleLabel, { color: theme.text }]}>
                Modo {dark ? "oscuro" : "claro"} activo
              </Text>
              <Text style={[s.toggleHint, { color: theme.textSecond }]}>
                Toca para cambiar
              </Text>
            </View>
          </View>
          <Switch
            value={dark}
            onValueChange={toggle}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#fff"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (t: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 8,
      backgroundColor: t.card,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: "800", color: t.text },
    content: { padding: 20, gap: 16 },
    subtitle: { fontSize: 14, color: t.textSecond },
    optionsRow: { flexDirection: "row", gap: 16 },
    optionCard: {
      flex: 1,
      borderRadius: 16,
      padding: 20,
      alignItems: "center",
      gap: 12,
      borderWidth: 1,
      position: "relative",
    },
    checkBadge: {
      position: "absolute",
      top: 10,
      right: 10,
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    optionIcon: {
      width: 60,
      height: 60,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    optionLabel: { fontSize: 15 },
    toggleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
    },
    toggleLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    toggleIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    toggleLabel: { fontSize: 15, fontWeight: "600" },
    toggleHint: { fontSize: 12, marginTop: 2 },
  });
