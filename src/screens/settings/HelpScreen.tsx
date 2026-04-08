import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
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
    a: "Ve a cualquier área (Trabajo, Educación, etc.) y toca el botón + en la esquina inferior derecha. También puedes tocar el botón 'Nueva tarea' desde el tab de Tareas.",
  },
  {
    q: "¿Puedo editar una tarea ya creada?",
    a: "Sí. Toca el título de la tarea o el menú de tres puntos (⋮) y selecciona 'Editar tarea'. Podrás cambiar el nombre, descripción, prioridad y fecha.",
  },
  {
    q: "¿Cómo marco una tarea como completada?",
    a: "Toca el círculo a la izquierda de cualquier tarea para marcarla como completada. Tócalo de nuevo para desmarcarla.",
  },
  {
    q: "¿Mis datos se sincronizan entre dispositivos?",
    a: "Sí. Todos tus datos se guardan en la nube (Firebase). Inicia sesión con tu cuenta en cualquier dispositivo para acceder a tus tareas.",
  },
  {
    q: "¿Cómo elimino mi cuenta?",
    a: "Por el momento escríbenos a soporte@tasklife.app y procesamos la eliminación en menos de 24 horas. Pronto estará disponible desde la app.",
  },
];

const CONTACT = [
  {
    id: "email",
    icon: "mail-outline",
    label: "Enviar correo",
    action: () => Linking.openURL("mailto:soporte@tasklife.app"),
  },
  {
    id: "whatsapp",
    icon: "logo-whatsapp",
    label: "WhatsApp",
    action: () =>
      Alert.alert("Próximamente", "Canal de WhatsApp en construcción"),
  },
  {
    id: "github",
    icon: "logo-github",
    label: "Reportar un bug",
    action: () => Linking.openURL("https://github.com/XeanN/TaskLife/issues"),
  },
] as const;

export default function HelpScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const s = makeStyles(theme);
  const [open, setOpen] = useState<number | null>(null);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={s.headerTitle}>Ayuda y soporte</Text>
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* FAQ */}
        <Text style={s.sectionTitle}>Preguntas frecuentes</Text>
        {FAQS.map((item, i) => (
          <Pressable
            key={i}
            style={s.faqCard}
            onPress={() => setOpen(open === i ? null : i)}
          >
            <View style={s.faqHeader}>
              <Text style={s.faqQ}>{item.q}</Text>
              <Ionicons
                name={open === i ? "chevron-up" : "chevron-down"}
                size={18}
                color={theme.textSecond}
              />
            </View>
            {open === i && <Text style={s.faqA}>{item.a}</Text>}
          </Pressable>
        ))}

        {/* Contacto */}
        <Text style={[s.sectionTitle, { marginTop: 24 }]}>Contáctanos</Text>
        <View style={s.contactCard}>
          {CONTACT.map((c, i) => (
            <Pressable
              key={c.id}
              style={({ pressed }) => [
                s.contactRow,
                i > 0 && s.border,
                pressed && { opacity: 0.7 },
              ]}
              onPress={c.action}
            >
              <View style={s.contactIcon}>
                <Ionicons
                  name={c.icon as any}
                  size={20}
                  color={theme.primary}
                />
              </View>
              <Text style={s.contactLabel}>{c.label}</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.textSecond}
              />
            </Pressable>
          ))}
        </View>

        <Text style={s.footer}>Respondemos en menos de 24 horas 🙌</Text>
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
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: t.text,
      marginBottom: 12,
    },
    faqCard: {
      backgroundColor: t.card,
      borderRadius: 14,
      padding: 16,
      marginBottom: 10,
      elevation: 2,
    },
    faqHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    faqQ: { flex: 1, fontSize: 14, fontWeight: "600", color: t.text },
    faqA: { fontSize: 13, color: t.textSecond, lineHeight: 20, marginTop: 10 },
    contactCard: { backgroundColor: t.card, borderRadius: 16, elevation: 2 },
    contactRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      gap: 12,
    },
    border: { borderTopWidth: 1, borderTopColor: t.border },
    contactIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: t.iconBg,
      alignItems: "center",
      justifyContent: "center",
    },
    contactLabel: { flex: 1, fontSize: 15, color: t.text, fontWeight: "500" },
    footer: {
      textAlign: "center",
      fontSize: 12,
      color: t.textSecond,
      marginTop: 20,
    },
  });
