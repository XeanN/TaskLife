import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type ModalType = "danger" | "success" | "warning" | "info";

interface Props {
  visible: boolean;
  type?: ModalType;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ICONS: Record<ModalType, string> = {
  danger: "alert-circle",
  success: "checkmark-circle",
  warning: "warning",
  info: "information-circle",
};

export default function ConfirmModal({
  visible,
  type = "danger",
  title,
  message,
  confirmText = "Continuar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
}: Props) {
  const { theme } = useTheme();
  const s = makeStyles(theme);

  const iconColor = {
    danger: theme.danger,
    success: theme.success,
    warning: theme.gold,
    info: theme.primary,
  }[type];

  const confirmBg = {
    danger: theme.danger,
    success: theme.success,
    warning: theme.gold,
    info: theme.primary,
  }[type];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={s.overlay}>
        <View style={[s.card, { backgroundColor: theme.card }]}>
          {/* Ícono */}
          <View
            style={[
              s.iconCircle,
              {
                backgroundColor:
                  type === "success"
                    ? theme.successBg
                    : type === "danger"
                      ? theme.dangerBg
                      : type === "warning"
                        ? theme.goldBg
                        : theme.primaryLight,
              },
            ]}
          >
            <Ionicons name={ICONS[type] as any} size={36} color={iconColor} />
          </View>

          {/* Texto */}
          <Text style={[s.title, { color: theme.text }]}>{title}</Text>
          {message && (
            <Text style={[s.message, { color: theme.textSecond }]}>
              {message}
            </Text>
          )}

          {/* Botones */}
          <View style={s.buttons}>
            <Pressable
              style={[
                s.btn,
                s.cancelBtn,
                { borderColor: theme.border, backgroundColor: theme.inputBg },
              ]}
              onPress={onCancel}
            >
              <Text style={[s.btnText, { color: theme.textSecond }]}>
                {cancelText}
              </Text>
            </Pressable>
            <Pressable
              style={[s.btn, s.confirmBtn, { backgroundColor: confirmBg }]}
              onPress={onConfirm}
            >
              <Text style={[s.btnText, { color: "#fff" }]}>{confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (t: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
    },
    card: {
      width: "100%",
      borderRadius: 20,
      padding: 24,
      alignItems: "center",
    },
    iconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: "800",
      textAlign: "center",
      marginBottom: 8,
    },
    message: {
      fontSize: 14,
      textAlign: "center",
      lineHeight: 20,
      marginBottom: 24,
    },
    buttons: {
      flexDirection: "row",
      gap: 10,
      width: "100%",
    },
    btn: {
      flex: 1,
      height: 46,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelBtn: {
      borderWidth: 1,
    },
    confirmBtn: {},
    btnText: {
      fontSize: 15,
      fontWeight: "700",
    },
  });
