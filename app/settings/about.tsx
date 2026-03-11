import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FEATURES = [
  {
    icon: "checkmark-done-outline",
    text: "Gestión de tareas por área de vida",
  },
  { icon: "cloud-outline", text: "Sincronización en tiempo real con Firebase" },
  { icon: "lock-closed-outline", text: "Datos privados y seguros por usuario" },
  { icon: "phone-portrait-outline", text: "Diseño nativo para Android e iOS" },
  { icon: "flash-outline", text: "CRUD completo con prioridades y fechas" },
];

const TECH = [
  { label: "React Native", value: "0.76" },
  { label: "Expo SDK", value: "52" },
  { label: "TypeScript", value: "5.0" },
  { label: "Firebase", value: "11.x" },
  { label: "Expo Router", value: "4.x" },
];

export default function AboutScreen() {
  const { theme } = useTheme();
  const s = makeStyles(theme);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={s.headerTitle}>Acerca de TaskLife</Text>
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo / Hero */}
        <View style={s.hero}>
          <View style={s.logoCircle}>
            <Ionicons name="checkmark-done" size={40} color="#fff" />
          </View>
          <Text style={s.appName}>TaskLife</Text>
          <Text style={s.appTagline}>Organiza tu vida, un área a la vez</Text>
          <View style={s.versionBadge}>
            <Text style={s.versionText}>v1.0.0</Text>
          </View>
        </View>

        {/* Descripción */}
        <View style={s.card}>
          <Text style={s.cardText}>
            TaskLife es una app de gestión de tareas diseñada para ayudarte a
            organizar las 4 áreas principales de tu vida: Trabajo, Educación,
            Finanzas y Bienestar. Cada área tiene su propio espacio con CRUD
            completo, prioridades, fechas y progreso visual.
          </Text>
        </View>

        {/* Funcionalidades */}
        <Text style={s.sectionTitle}>Qué incluye</Text>
        <View style={s.card}>
          {FEATURES.map((f, i) => (
            <View key={i} style={[s.featureRow, i > 0 && s.border]}>
              <Ionicons name={f.icon as any} size={18} color={theme.primary} />
              <Text style={s.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Tech stack */}
        <Text style={s.sectionTitle}>Stack tecnológico</Text>
        <View style={s.card}>
          {TECH.map((t, i) => (
            <View key={i} style={[s.techRow, i > 0 && s.border]}>
              <Text style={s.techLabel}>{t.label}</Text>
              <View style={s.techBadge}>
                <Text style={s.techValue}>{t.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Autor */}
        <Text style={s.sectionTitle}>Desarrollador</Text>
        <Pressable
          style={s.authorCard}
          onPress={() => Linking.openURL("https://github.com/XeanN")}
        >
          <View style={s.authorAvatar}>
            <Text style={s.authorInitial}>A</Text>
          </View>
          <View style={s.authorInfo}>
            <Text style={s.authorName}>Angel (XeanN)</Text>
            <Text style={s.authorRole}>Desarrollador · React Native</Text>
          </View>
          <Ionicons name="logo-github" size={22} color={theme.textSecond} />
        </Pressable>

        <Text style={s.footer}>
          Hecho con ❤️ usando React Native + Expo{"\n"}
          MIT License · 2026
        </Text>
      </ScrollView>
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
    content: { padding: 20, paddingBottom: 40 },
    hero: { alignItems: "center", marginBottom: 24 },
    logoCircle: {
      width: 80,
      height: 80,
      borderRadius: 24,
      backgroundColor: t.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
      elevation: 6,
    },
    appName: {
      fontSize: 28,
      fontWeight: "800",
      color: t.text,
      marginBottom: 4,
    },
    appTagline: { fontSize: 14, color: t.textSecond, marginBottom: 10 },
    versionBadge: {
      backgroundColor: t.iconBg,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 20,
    },
    versionText: { fontSize: 12, color: t.primary, fontWeight: "700" },
    sectionTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: t.text,
      marginBottom: 10,
      marginTop: 4,
    },
    card: {
      backgroundColor: t.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      elevation: 2,
    },
    cardText: { fontSize: 14, color: t.textSecond, lineHeight: 22 },
    border: { borderTopWidth: 1, borderTopColor: t.border },
    featureRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 10,
    },
    featureText: { fontSize: 14, color: t.text, flex: 1 },
    techRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
    },
    techLabel: { fontSize: 14, color: t.text, fontWeight: "500" },
    techBadge: {
      backgroundColor: t.inputBg,
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 8,
    },
    techValue: { fontSize: 12, color: t.primary, fontWeight: "700" },
    authorCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: t.card,
      borderRadius: 16,
      padding: 16,
      gap: 12,
      marginBottom: 20,
      elevation: 2,
    },
    authorAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: t.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    authorInitial: { fontSize: 18, fontWeight: "800", color: "#fff" },
    authorInfo: { flex: 1 },
    authorName: { fontSize: 15, fontWeight: "700", color: t.text },
    authorRole: { fontSize: 12, color: t.textSecond, marginTop: 2 },
    footer: {
      textAlign: "center",
      fontSize: 12,
      color: t.textSecond,
      lineHeight: 20,
    },
  });
