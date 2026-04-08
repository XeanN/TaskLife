import { useTheme } from "@/context/ThemeContext";
import { useLabels } from "@/hooks/useLabels";
import { LABEL_COLORS, Label } from "@/models/Label";

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  labels: Label[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export default function LabelSheet({
  visible,
  onClose,
  labels,
  selectedIds,
  onToggle,
}: Props) {
  const { theme } = useTheme();
  const { create, remove, isLoading } = useLabels();
  const s = makeStyles(theme);

  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(LABEL_COLORS[0]);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await create(newName.trim(), newColor);
      setNewName("");
      setNewColor(LABEL_COLORS[0]);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (lbl: Label) => {
    Alert.alert(
      "Eliminar etiqueta",
      `¿Eliminar "${lbl.name}"? Se quitará de todas las tareas.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => remove(lbl.id),
        },
      ],
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <Pressable style={s.backdrop} onPress={onClose} />

        <View style={[s.sheet, { backgroundColor: theme.card }]}>
          {/* Handle */}
          <View style={[s.handle, { backgroundColor: theme.border }]} />

          {/* Header */}
          <View style={s.header}>
            <Text style={[s.title, { color: theme.text }]}>Etiquetas</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={22} color={theme.textSecond} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Buscar / crear */}
            <View
              style={[
                s.inputRow,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.border,
                },
              ]}
            >
              <TextInput
                style={[s.input, { color: theme.text }]}
                placeholder="Busca o crea una etiqueta"
                placeholderTextColor={theme.textThird}
                value={newName}
                onChangeText={setNewName}
              />
              {newName.trim().length > 0 && (
                <Pressable
                  style={[s.createBtn, { backgroundColor: newColor }]}
                  onPress={handleCreate}
                  disabled={creating}
                >
                  <Ionicons name="add" size={18} color="#fff" />
                </Pressable>
              )}
            </View>

            {/* Selector de color */}
            {newName.trim().length > 0 && (
              <View style={s.colorRow}>
                {LABEL_COLORS.map((c) => (
                  <Pressable
                    key={c}
                    style={[
                      s.colorDot,
                      { backgroundColor: c },
                      newColor === c && s.colorDotSelected,
                    ]}
                    onPress={() => setNewColor(c)}
                  >
                    {newColor === c && (
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    )}
                  </Pressable>
                ))}
              </View>
            )}

            {/* Lista de etiquetas existentes */}
            {labels.length === 0 ? (
              <View style={s.empty}>
                <Ionicons
                  name="pricetag-outline"
                  size={40}
                  color={theme.border}
                />
                <Text style={[s.emptyText, { color: theme.textThird }]}>
                  Aún no tienes etiquetas
                </Text>
                <Text style={[s.emptyHint, { color: theme.border }]}>
                  Escribe arriba para crear una
                </Text>
              </View>
            ) : (
              <View style={s.labelList}>
                {labels.map((lbl) => {
                  const selected = selectedIds.includes(lbl.id);
                  return (
                    <View
                      key={lbl.id}
                      style={[s.labelRow, { borderBottomColor: theme.border }]}
                    >
                      {/* Toggle selección */}
                      <Pressable
                        style={s.labelLeft}
                        onPress={() => onToggle(lbl.id)}
                      >
                        <View
                          style={[s.labelColor, { backgroundColor: lbl.color }]}
                        />
                        <Text style={[s.labelName, { color: theme.text }]}>
                          {lbl.name}
                        </Text>
                      </Pressable>

                      <View style={s.labelRight}>
                        {/* Checkbox */}
                        <Pressable
                          style={[
                            s.checkbox,
                            {
                              borderColor: selected ? lbl.color : theme.border,
                              backgroundColor: selected
                                ? lbl.color
                                : "transparent",
                            },
                          ]}
                          onPress={() => onToggle(lbl.id)}
                        >
                          {selected && (
                            <Ionicons name="checkmark" size={12} color="#fff" />
                          )}
                        </Pressable>

                        {/* Eliminar */}
                        <Pressable
                          onPress={() => handleDelete(lbl)}
                          style={s.deleteBtn}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={16}
                            color={theme.textThird}
                          />
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (t: ReturnType<typeof useTheme>["theme"]) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.45)",
    },
    sheet: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 32,
      maxHeight: "75%",
    },
    handle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      alignSelf: "center",
      marginBottom: 16,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: "800",
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 4,
      marginBottom: 12,
      gap: 8,
    },
    input: {
      flex: 1,
      fontSize: 15,
      height: 44,
    },
    createBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    colorRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    colorDot: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    colorDotSelected: {
      borderWidth: 2.5,
      borderColor: "#fff",
    },
    empty: {
      alignItems: "center",
      paddingVertical: 32,
      gap: 8,
    },
    emptyText: {
      fontSize: 15,
      fontWeight: "600",
    },
    emptyHint: {
      fontSize: 13,
    },
    labelList: {
      borderRadius: 12,
      overflow: "hidden",
    },
    labelRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      borderBottomWidth: 1,
    },
    labelLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    labelColor: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    labelName: {
      fontSize: 15,
      fontWeight: "500",
    },
    labelRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    deleteBtn: {
      padding: 4,
    },
  });
