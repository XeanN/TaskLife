import { useTheme } from "../../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SECTIONS = [
  {
    title: "Datos que recopilamos",
    icon: "server-outline",
    body: "TaskLife recopila únicamente los datos que tú ingresas: tu correo electrónico, nombre, y las tareas que creas. No recopilamos datos de ubicación, contactos ni información sensible del dispositivo.",
  },
  {
    title: "Cómo usamos tus datos",
    icon: "shield-outline",
    body: "Tus datos se usan exclusivamente para brindarte el servicio de gestión de tareas. No vendemos, compartimos ni cedemos tu información a terceros bajo ninguna circunstancia.",
  },
  {
    title: "Almacenamiento seguro",
    icon: "lock-closed-outline",
    body: "Toda tu información se almacena en Firebase (Google Cloud), protegida con autenticación segura. Solo tú puedes acceder a tus datos a través de tu cuenta.",
  },
  {
    title: "Eliminación de datos",
    icon: "trash-outline",
    body: "Puedes eliminar tu cuenta y todos tus datos en cualquier momento desde la sección de configuración o contactándonos directamente. La eliminación es permanente e irreversible.",
  },
  {
    title: "Contacto",
    icon: "mail-outline",
    body: "Si tienes dudas sobre tu privacidad o el manejo de tus datos, escríbenos a: soporte@tasklife.app",
  },
];

export default function PrivacyScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const s = makeStyles(theme);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={s.headerTitle}>Privacidad</Text>
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.intro}>
          En TaskLife tu privacidad es nuestra prioridad. Aquí te explicamos de
          forma clara cómo manejamos tu información.
        </Text>
        <Text style={s.updated}>Última actualización: Marzo 2026</Text>

        {SECTIONS.map((sec, i) => (
          <View key={i} style={s.card}>
            <View style={s.cardHeader}>
              <View style={s.iconBox}>
                <Ionicons
                  name={sec.icon as any}
                  size={20}
                  color={theme.primary}
                />
              </View>
              <Text style={s.cardTitle}>{sec.title}</Text>
            </View>
            <Text style={s.cardBody}>{sec.body}</Text>
          </View>
        ))}

        <Text style={s.footer}>TaskLife v1.0.0 · tasklife.app</Text>
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
    intro: {
      fontSize: 14,
      color: t.textSecond,
      lineHeight: 22,
      marginBottom: 6,
    },
    updated: {
      fontSize: 11,
      color: t.textSecond,
      marginBottom: 20,
      fontStyle: "italic",
    },
    card: {
      backgroundColor: t.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 10,
    },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: t.iconBg,
      alignItems: "center",
      justifyContent: "center",
    },
    cardTitle: { fontSize: 15, fontWeight: "700", color: t.text, flex: 1 },
    cardBody: { fontSize: 13, color: t.textSecond, lineHeight: 20 },
    footer: {
      textAlign: "center",
      fontSize: 11,
      color: t.textSecond,
      marginTop: 8,
    },
  });
