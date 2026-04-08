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
  { icon: "pricetag-outline", text: "Etiquetas personalizadas con colores" },
  { icon: "cloud-outline", text: "Sincronización en tiempo real con Firebase" },
  { icon: "moon-outline", text: "Modo oscuro completo" },
  { icon: "swap-horizontal-outline", text: "Navegación rápida entre áreas" },
  { icon: "lock-closed-outline", text: "Datos privados y seguros por usuario" },
];

const TECH = [
  { label: "React Native", value: "0.81" },
  { label: "Expo SDK", value: "54" },
  { label: "TypeScript", value: "5.9" },
  { label: "Firebase", value: "12.x" },
  { label: "Expo Router", value: "6.x" },
  { label: "Arquitectura", value: "MVC" },
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
        {/* Hero */}
        <View style={s.hero}>
          <View style={[s.logoCircle, { backgroundColor: theme.primary }]}>
            <Ionicons name="checkmark-done" size={40} color="#fff" />
          </View>
          <Text style={[s.appName, { color: theme.text }]}>TaskLife</Text>
          <Text style={[s.appTagline, { color: theme.textSecond }]}>
            Organiza tu vida, un área a la vez
          </Text>
          <View style={[s.versionBadge, { backgroundColor: theme.iconBg }]}>
            <Text style={[s.versionText, { color: theme.primary }]}>
              v1.0.0
            </Text>
          </View>
        </View>

        {/* Descripción */}
        <View
          style={[
            s.card,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Text style={[s.cardText, { color: theme.textSecond }]}>
            TaskLife es una app de gestión de tareas diseñada con arquitectura
            MVC para organizar las 4 áreas principales de tu vida: Trabajo,
            Educación, Finanzas y Bienestar.
          </Text>
        </View>

        {/* Funcionalidades */}
        <Text style={[s.sectionTitle, { color: theme.text }]}>
          Funcionalidades
        </Text>
        <View
          style={[
            s.card,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          {FEATURES.map((f, i) => (
            <View
              key={i}
              style={[
                s.featureRow,
                i > 0 && { borderTopWidth: 1, borderTopColor: theme.border },
              ]}
            >
              <Ionicons name={f.icon as any} size={18} color={theme.primary} />
              <Text style={[s.featureText, { color: theme.text }]}>
                {f.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Tech */}
        <Text style={[s.sectionTitle, { color: theme.text }]}>
          Stack tecnológico
        </Text>
        <View
          style={[
            s.card,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          {TECH.map((t, i) => (
            <View
              key={i}
              style={[
                s.techRow,
                i > 0 && { borderTopWidth: 1, borderTopColor: theme.border },
              ]}
            >
              <Text style={[s.techLabel, { color: theme.text }]}>
                {t.label}
              </Text>
              <View style={[s.techBadge, { backgroundColor: theme.iconBg }]}>
                <Text style={[s.techValue, { color: theme.primary }]}>
                  {t.value}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Autor */}
        <Text style={[s.sectionTitle, { color: theme.text }]}>
          Desarrollador
        </Text>
        <Pressable
          style={[
            s.authorCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
          onPress={() => Linking.openURL("https://github.com/XeanN")}
        >
          <View style={[s.authorAvatar, { backgroundColor: theme.primary }]}>
            <Text style={s.authorInitial}>A</Text>
          </View>
          <View style={s.authorInfo}>
            <Text style={[s.authorName, { color: theme.text }]}>
              Angel (XeanN)
            </Text>
            <Text style={[s.authorRole, { color: theme.textSecond }]}>
              Desarrollador · React Native
            </Text>
          </View>
          <Ionicons name="logo-github" size={22} color={theme.textSecond} />
        </Pressable>

        <Text style={[s.footer, { color: theme.textThird }]}>
          Hecho con React Native + Expo{"\n"}MIT License · 2026
        </Text>
      </ScrollView>
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
    content: { padding: 20, paddingBottom: 40, gap: 12 },
    hero: { alignItems: "center", marginBottom: 8 },
    logoCircle: {
      width: 80,
      height: 80,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    appName: { fontSize: 28, fontWeight: "800", marginBottom: 4 },
    appTagline: { fontSize: 14, marginBottom: 10 },
    versionBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 20,
    },
    versionText: { fontSize: 12, fontWeight: "700" },
    sectionTitle: { fontSize: 15, fontWeight: "700" },
    card: {
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      gap: 0,
    },
    cardText: { fontSize: 14, lineHeight: 22 },
    featureRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 10,
    },
    featureText: { fontSize: 14, flex: 1 },
    techRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
    },
    techLabel: { fontSize: 14, fontWeight: "500" },
    techBadge: {
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 8,
    },
    techValue: { fontSize: 12, fontWeight: "700" },
    authorCard: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 16,
      padding: 16,
      gap: 12,
      borderWidth: 1,
    },
    authorAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
    },
    authorInitial: { fontSize: 18, fontWeight: "800", color: "#fff" },
    authorInfo: { flex: 1 },
    authorName: { fontSize: 15, fontWeight: "700" },
    authorRole: { fontSize: 12, marginTop: 2 },
    footer: {
      textAlign: "center",
      fontSize: 12,
      lineHeight: 20,
      marginTop: 8,
    },
  });
