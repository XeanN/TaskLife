import { useTheme } from "../../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ThemeScreen() {
  const { dark, theme, toggle } = useTheme();
  const navigation = useNavigation<any>();
  const s = makeStyles(theme);

  const OPTIONS = [
    { id: "light", label: "Claro", icon: "sunny-outline", active: !dark },
    { id: "dark", label: "Oscuro", icon: "moon-outline", active: dark },
  ];

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={s.headerTitle}>Tema de la app</Text>
      </View>

      <View style={s.content}>
        <Text style={s.subtitle}>Elige cómo quieres ver TaskLife</Text>

        {/* Cards de tema */}
        <View style={s.optionsRow}>
          {OPTIONS.map((opt) => (
            <Pressable
              key={opt.id}
              style={[
                s.optionCard,
                opt.active && { borderColor: theme.primary, borderWidth: 2 },
              ]}
              onPress={() => {
                if (!opt.active) toggle();
              }}
            >
              <View
                style={[
                  s.optionIcon,
                  {
                    backgroundColor: opt.active ? theme.primary : theme.inputBg,
                  },
                ]}
              >
                <Ionicons
                  name={opt.icon as any}
                  size={28}
                  color={opt.active ? "#fff" : theme.textSecond}
                />
              </View>
              <Text
                style={[
                  s.optionLabel,
                  { color: opt.active ? theme.primary : theme.text },
                ]}
              >
                {opt.label}
              </Text>
              {opt.active && (
                <View style={s.checkBadge}>
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
              )}
            </Pressable>
          ))}
        </View>

        {/* Toggle rápido */}
        <View style={s.toggleRow}>
          <View style={s.toggleInfo}>
            <Ionicons
              name={dark ? "moon" : "sunny"}
              size={20}
              color={theme.primary}
            />
            <View>
              <Text style={s.toggleLabel}>
                Modo {dark ? "oscuro" : "claro"} activo
              </Text>
              <Text style={s.toggleHint}>Toca para cambiar</Text>
            </View>
          </View>
          <Switch
            value={dark}
            onValueChange={toggle}
            trackColor={{ false: "#ddd", true: theme.primary }}
            thumbColor="#fff"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (t: any) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 8,
      backgroundColor: t.card,
      elevation: 2,
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: "800", color: t.text },
    content: { padding: 20 },
    subtitle: { fontSize: 14, color: t.textSecond, marginBottom: 24 },
    optionsRow: { flexDirection: "row", gap: 16, marginBottom: 24 },
    optionCard: {
      flex: 1,
      backgroundColor: t.card,
      borderRadius: 16,
      padding: 20,
      alignItems: "center",
      gap: 12,
      elevation: 2,
      borderWidth: 2,
      borderColor: "transparent",
      position: "relative",
    },
    optionIcon: {
      width: 60,
      height: 60,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    optionLabel: { fontSize: 15, fontWeight: "700" },
    checkBadge: {
      position: "absolute",
      top: 10,
      right: 10,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: "#3F7EA6",
      alignItems: "center",
      justifyContent: "center",
    },
    toggleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: t.card,
      borderRadius: 16,
      padding: 16,
      elevation: 2,
    },
    toggleInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
    toggleLabel: { fontSize: 15, fontWeight: "600", color: t.text },
    toggleHint: { fontSize: 12, color: t.textSecond, marginTop: 2 },
  });
