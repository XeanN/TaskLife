import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FAQS = [
  {
    q: "¿Cómo creo una tarea?",
    a: "Toca el botón + en cualquier área o en el tab de Tareas. Se abrirá un panel donde puedes escribir el nombre, descripción, prioridad, fecha y etiquetas.",
  },
  {
    q: "¿Puedo editar una tarea ya creada?",
    a: "Sí. Toca el título de la tarea para abrir el formulario de edición. También puedes tocar los tres puntos ⋮ y seleccionar 'Editar tarea'.",
  },
  {
    q: "¿Cómo marco una tarea como completada?",
    a: "Toca el círculo a la izquierda de cualquier tarea para marcarla como completada. Tócalo de nuevo para desmarcarla.",
  },
  {
    q: "¿Cómo creo etiquetas personalizadas?",
    a: "Al crear o editar una tarea, toca el selector de etiquetas. Escribe el nombre de la etiqueta, elige un color y pulsa +.",
  },
  {
    q: "¿Mis datos se sincronizan entre dispositivos?",
    a: "Sí. Todos tus datos se guardan en Firebase. Inicia sesión con tu cuenta en cualquier dispositivo para acceder a tus tareas.",
  },
  {
    q: "¿Cómo navego entre áreas?",
    a: "Dentro de cualquier área usa las flechas ◄ ► del header para pasar a la siguiente o anterior área sin volver al inicio.",
  },
];

const CONTACTS = [
  {
    id: "email",
    icon: "mail-outline",
    label: "Enviar correo",
    onPress: () => Linking.openURL("mailto:soporte@tasklife.app"),
  },
  {
    id: "github",
    icon: "logo-github",
    label: "Reportar un bug",
    onPress: () => Linking.openURL("https://github.com/XeanN/TaskLife/issues"),
  },
  {
    id: "whatsapp",
    icon: "logo-whatsapp",
    label: "WhatsApp",
    onPress: () =>
      Alert.alert("Próximamente", "Canal de WhatsApp en construcción"),
  },
];

export default function HelpScreen() {
  const { theme } = useTheme();
  const s = makeStyles(theme);
  const [open, setOpen] = useState<number | null>(null);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={s.headerTitle}>Ayuda y soporte</Text>
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[s.sectionTitle, { color: theme.text }]}>
          Preguntas frecuentes
        </Text>

        {FAQS.map((item, i) => (
          <Pressable
            key={i}
            style={[
              s.faqCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            onPress={() => setOpen(open === i ? null : i)}
          >
            <View style={s.faqHeader}>
              <Text style={[s.faqQ, { color: theme.text }]}>{item.q}</Text>
              <Ionicons
                name={open === i ? "chevron-up" : "chevron-down"}
                size={18}
                color={theme.textSecond}
              />
            </View>
            {open === i && (
              <Text style={[s.faqA, { color: theme.textSecond }]}>
                {item.a}
              </Text>
            )}
          </Pressable>
        ))}

        <Text style={[s.sectionTitle, { color: theme.text, marginTop: 8 }]}>
          Contáctanos
        </Text>

        <View
          style={[
            s.contactCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          {CONTACTS.map((c, i) => (
            <Pressable
              key={c.id}
              style={({ pressed }) => [
                s.contactRow,
                i > 0 && { borderTopWidth: 1, borderTopColor: theme.border },
                pressed && { opacity: 0.7 },
              ]}
              onPress={c.onPress}
            >
              <View style={[s.contactIcon, { backgroundColor: theme.iconBg }]}>
                <Ionicons
                  name={c.icon as any}
                  size={20}
                  color={theme.primary}
                />
              </View>
              <Text style={[s.contactLabel, { color: theme.text }]}>
                {c.label}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.textSecond}
              />
            </Pressable>
          ))}
        </View>

        <Text style={[s.footer, { color: theme.textThird }]}>
          Respondemos en menos de 24 horas
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
    content: { padding: 20, paddingBottom: 40, gap: 10 },
    sectionTitle: { fontSize: 16, fontWeight: "700" },
    faqCard: {
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      gap: 8,
    },
    faqHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    faqQ: { flex: 1, fontSize: 14, fontWeight: "600" },
    faqA: { fontSize: 13, lineHeight: 20 },
    contactCard: {
      borderRadius: 16,
      borderWidth: 1,
      overflow: "hidden",
    },
    contactRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      gap: 12,
    },
    contactIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    contactLabel: { flex: 1, fontSize: 15, fontWeight: "500" },
    footer: { textAlign: "center", fontSize: 12, marginTop: 8 },
  });
